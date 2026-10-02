/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SiteContent, GalleryImageItem } from '../types/content';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore: client appears offline, falling back to local cache.');
    }
  }
}

// Global Image Compressor: Compresses phone/camera photos down to clean ~80-150KB WebP/JPEG
export async function compressImageFile(file: File, maxDimension = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Try WebP first, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const SETTINGS_DOC_PATH = 'settings/chambers_content';
const GALLERY_COLLECTION_PATH = 'gallery_images';

// Subscribe to global chambers settings & branding images
export function subscribeGlobalSettings(
  onData: (data: Partial<SiteContent> | null) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, 'settings', 'chambers_content');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as Partial<SiteContent>);
      } else {
        onData(null);
      }
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, SETTINGS_DOC_PATH);
      } catch (e) {
        if (typeof onError === 'function') {
          onError(e);
        }
      }
    }
  );
}

// Save global chambers settings to Firebase
export async function saveGlobalSettings(content: SiteContent): Promise<void> {
  const path = 'settings/chambers_content';
  try {
    const docRef = doc(db, 'settings', 'chambers_content');
    const payload = {
      clientName: content.clientName,
      designation: content.designation,
      firmName: content.firmName,
      address: content.address,
      landline: content.landline,
      mobile: content.mobile,
      whatsappNumber: content.whatsappNumber,
      locationFocus: content.locationFocus,
      officeHours: content.officeHours,
      courtHours: content.courtHours,
      heroHeadline: content.heroHeadline,
      heroSubheadline: content.heroSubheadline,
      portrait: content.images.portrait,
      heroChambers: content.images.heroChambers,
      office: content.images.office,
      logo: content.images.logo || '',
      favicon: content.images.favicon || '',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Subscribe to global gallery images
export function subscribeGlobalGallery(
  onData: (items: GalleryImageItem[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, GALLERY_COLLECTION_PATH);
  const q = query(colRef, orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: GalleryImageItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as GalleryImageItem);
      });
      onData(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, GALLERY_COLLECTION_PATH);
      } catch (e) {
        if (typeof onError === 'function') {
          onError(e);
        }
      }
    }
  );
}

// Save a single gallery image to Firebase
export async function saveGlobalGalleryItem(item: GalleryImageItem, orderIndex: number): Promise<void> {
  const path = `${GALLERY_COLLECTION_PATH}/${item.id}`;
  try {
    const docRef = doc(db, GALLERY_COLLECTION_PATH, item.id);
    await setDoc(docRef, {
      id: item.id,
      url: item.url,
      title: item.title,
      caption: item.caption || '',
      category: item.category || 'Chambers',
      order: orderIndex,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save all gallery images to Firebase (handles order updates, additions)
export async function syncAllGlobalGallery(items: GalleryImageItem[]): Promise<void> {
  try {
    for (let i = 0; i < items.length; i++) {
      await saveGlobalGalleryItem(items[i], i);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, GALLERY_COLLECTION_PATH);
  }
}

// Delete a gallery image from Firebase
export async function deleteGlobalGalleryItem(id: string): Promise<void> {
  const path = `${GALLERY_COLLECTION_PATH}/${id}`;
  try {
    const docRef = doc(db, GALLERY_COLLECTION_PATH, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
