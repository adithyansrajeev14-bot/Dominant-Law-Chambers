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
  getDocs,
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
const AUTH_DOC_PATH = 'settings/admin_auth';
const GALLERY_COLLECTION_PATH = 'gallery_images';

// Cryptographic SHA-256 Hashing using Web Crypto API
export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Initial seed hash for database setup (SHA-256 digest, no plaintext password in code)
const INITIAL_SEED_HASH = 'f9ff003b1dda54bc9b62f0febc30bcf9c0b7050b755f29812a0bd1801d49a19e';

// Retrieve or initialize hashed password in Firestore (stored securely in database, never in code)
export async function getStoredPasswordHash(): Promise<string> {
  try {
    const docRef = doc(db, 'settings', 'admin_auth');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().passwordHash) {
      return snap.data().passwordHash as string;
    }
  } catch (e) {
    console.warn('Could not read admin_auth from database:', e);
  }

  // Initialize with secure hash in database if first time
  try {
    await setDoc(doc(db, 'settings', 'admin_auth'), {
      passwordHash: INITIAL_SEED_HASH,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Could not seed admin_auth in database:', e);
  }
  return INITIAL_SEED_HASH;
}

// Verify entered password against hashed password in Firestore
export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  const inputHash = await hashPassword(inputPassword);
  const storedHash = await getStoredPasswordHash();
  return inputHash === storedHash;
}

// Update admin password hash in Firestore
export async function updateAdminPasswordInDb(newPasswordPlain: string): Promise<void> {
  const newHash = await hashPassword(newPasswordPlain);
  const docRef = doc(db, 'settings', 'admin_auth');
  await setDoc(docRef, {
    passwordHash: newHash,
    updatedAt: new Date().toISOString(),
  });
}

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
      onlineConsultationFee: content.onlineConsultationFee ?? 500,
      gpayNumber: content.gpayNumber || '9497100509',
      upiId: content.upiId || 'adv.ctsasi-1@okaxis',
      practiceAreas: content.practiceAreas || [],
      portrait: content.images.portrait,
      heroChambers: content.images.heroChambers,
      office: content.images.office,
      logo: content.images.logo || '',
      favicon: content.images.favicon || '',
      backgroundImage: content.images.backgroundImage || '',
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

// Save all gallery images to Firebase (handles order updates, additions, and deletes removed images)
export async function syncAllGlobalGallery(items: GalleryImageItem[]): Promise<void> {
  try {
    const colRef = collection(db, GALLERY_COLLECTION_PATH);
    const existingSnap = await getDocs(colRef);
    const keepIds = new Set(items.map((it) => it.id));

    // 1. Delete all Firestore documents that were deleted by the admin
    for (const docSnap of existingSnap.docs) {
      if (!keepIds.has(docSnap.id)) {
        try {
          await deleteDoc(docSnap.ref);
        } catch (delErr) {
          console.warn(`Failed to delete document ${docSnap.id} from Firestore`, delErr);
        }
      }
    }

    // 2. Save/update all remaining items with their explicit order index
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
