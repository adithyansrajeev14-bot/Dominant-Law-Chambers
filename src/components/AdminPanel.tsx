import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  KeyRound,
  FileText,
  Briefcase,
  Phone,
  Layout,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Lock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Cloud,
  Loader2,
  IndianRupee,
  Edit3,
  Smartphone,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import { SiteContent, PracticeAreaItem, GalleryImageItem } from '../types/content';
import {
  compressImageFile,
  deleteGlobalGalleryItem,
  verifyAdminPassword,
  updateAdminPasswordInDb,
} from '../lib/firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
  onSaveContent: (newContent: SiteContent) => Promise<void> | void;
  onResetDefaults: () => void;
  currentPasswordHash?: string;
  onUpdatePassword?: (newPass: string) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  content,
  onSaveContent,
  onResetDefaults,
  currentPasswordHash,
  onUpdatePassword,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'consultation' | 'contact' | 'hero' | 'about' | 'practice' | 'gallery' | 'images' | 'password'
  >('contact');
  const [draft, setDraft] = useState<SiteContent>(content);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Gallery URL add state
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCaption, setNewGalCaption] = useState('');

  // Password state
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    showStatus('Uploading & synchronizing globally to Firebase Firestore...');
    try {
      await onSaveContent(draft);
      showStatus('Success! Stored globally on Firebase for all clients worldwide.');
    } catch {
      showStatus('Saved locally. Please verify internet connection for Firebase.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handler using WebP/JPEG Client Compression
  const handleImageUpload = async (
    key: 'portrait' | 'heroChambers' | 'office' | 'logo' | 'favicon' | 'backgroundImage',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('Please select a valid image file (PNG, JPG, WEBP, ICO, SVG).', 'error');
      return;
    }

    try {
      showStatus(`Optimizing and preparing ${key} for Firebase...`);
      const maxDim = key === 'logo' || key === 'favicon' ? 480 : key === 'backgroundImage' ? 1920 : 1280;
      const compressedDataUrl = await compressImageFile(file, maxDim, 0.85);

      setDraft((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [key]: compressedDataUrl,
        },
      }));
      showStatus(`${key.toUpperCase()} prepared! Click 'Save All Changes' to store globally on Firebase.`);
    } catch {
      showStatus('Failed to process image file.', 'error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdCurrent.trim()) {
      setPwdMsg({ text: 'Please enter your current master password.', type: 'error' });
      return;
    }
    if (pwdNew.length < 6) {
      setPwdMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdMsg({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    try {
      setIsSaving(true);
      const isValid = await verifyAdminPassword(pwdCurrent);
      if (!isValid) {
        setPwdMsg({ text: 'Current password does not match.', type: 'error' });
        setIsSaving(false);
        return;
      }
      await updateAdminPasswordInDb(pwdNew);
      if (onUpdatePassword) {
        onUpdatePassword(pwdNew);
      }
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
      setPwdMsg({
        text: 'Password successfully updated and securely hashed in the database!',
        type: 'success',
      });
    } catch {
      setPwdMsg({
        text: 'Failed to update password in database. Please check your connection.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPracticeArea = () => {
    const newItem: PracticeAreaItem = {
      id: `custom-${Date.now()}`,
      title: 'New Legal Practice Area',
      iconName: 'Scale',
      summary: 'Summary description of the legal service and representation provided.',
      points: ['Primary court representation', 'Procedural filing & appeals'],
      documentsNeeded: ['Identity proof', 'Relevant case documents'],
      courtForum: 'District & Subordinate Courts',
    };
    setDraft((prev) => ({
      ...prev,
      practiceAreas: [...prev.practiceAreas, newItem],
    }));
  };

  const handleRemovePracticeArea = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      practiceAreas: prev.practiceAreas.filter((_, i) => i !== index),
    }));
  };

  // Gallery Management Handlers
  const handleMultipleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    showStatus(`Optimizing and preparing ${fileList.length} photo(s) for Firebase...`);

    const newItems: GalleryImageItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressedUrl = await compressImageFile(file, 1280, 0.82);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        newItems.push({
          id: `gal-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          url: compressedUrl,
          title: formattedTitle || 'Chambers & Court Practice',
          caption: 'Client legal consultation and advocate practice photo.',
          category: 'Chambers',
        });
      } catch (err) {
        console.error('Error compressing gallery photo', err);
      }
    }

    if (newItems.length > 0) {
      setDraft((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...newItems],
      }));
      showStatus(`${newItems.length} photo(s) ready! Click 'Save Globally to Firebase' to publish.`);
    }
  };

  const handleAddGalleryByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalUrl.trim()) return;

    const newItem: GalleryImageItem = {
      id: `gal-${Date.now()}`,
      url: newGalUrl.trim(),
      title: newGalTitle.trim() || 'Chambers Practice Photo',
      caption: newGalCaption.trim() || 'Court practice and client advocacy at The Dominant Law Chambers.',
      category: 'Chambers',
    };

    setDraft((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), newItem],
    }));

    setNewGalUrl('');
    setNewGalTitle('');
    setNewGalCaption('');
    showStatus('New photo added to client gallery! Click Save Globally to Firebase to publish.');
  };

  const handleDeleteGalleryItem = async (id: string) => {
    setDraft((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((item) => item.id !== id),
    }));
    try {
      await deleteGlobalGalleryItem(id);
      showStatus('Photo permanently deleted from gallery and Firebase.');
    } catch {
      showStatus('Photo removed from draft. Click "Save Globally to Firebase" to sync changes.');
    }
  };

  const handleMoveGalleryItem = (index: number, direction: 'up' | 'down') => {
    const list = [...(draft.galleryImages || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setDraft((prev) => ({
      ...prev,
      galleryImages: list,
    }));
  };

  const handleUpdateGalleryItem = (id: string, field: keyof GalleryImageItem, val: string) => {
    setDraft((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-slate-700/80 text-slate-100 rounded-2xl w-full max-w-5xl h-[92vh] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <span>Chamber Backside Content Manager</span>
                <span className="text-[10px] uppercase font-mono tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Firebase Global Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                All edits, uploads, and gallery images are synchronized globally to Firebase for all clients.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing to Firebase...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-emerald-200" />
                  <Save className="w-4 h-4" />
                  <span>Save Globally to Firebase</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close & Preview Site"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {statusMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between shrink-0 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
                : 'bg-red-950/80 text-red-300 border-b border-red-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> {statusMsg.text}
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 flex overflow-x-auto gap-2 py-2 shrink-0 text-xs font-medium">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'consultation' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Online Consultation</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'contact' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Chambers & Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'hero' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Hero & Headlines</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'about' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>About Bio & Pillars</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'practice' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Practice Areas</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'gallery' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Slideshow Gallery ({draft.galleryImages?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'images' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Images & Local Uploads</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'password' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
          
          {/* TAB: ONLINE CONSULTATION VIA WHATSAPP */}
          {activeTab === 'consultation' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>Online Consultation & WhatsApp Calling Setup</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When clients click 'Online Consultation' on the website, they are routed directly to WhatsApp for calling, case discussion, and consultation setup.
                  </p>
                </div>
              </div>

              {/* WhatsApp Consultation Contact Card */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Registered WhatsApp Number for Calls & Consultations
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Clients will be directed to this WhatsApp number for voice calls, video briefings, and case documents.
                  </p>
                  <div className="flex items-center gap-3 max-w-sm">
                    <div className="relative w-full">
                      <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={draft.whatsappNumber || '919497100509'}
                        onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
                        placeholder="e.g. 919497100509"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Direct Chambers Mobile Phone (for Telephone Hotline)
                  </label>
                  <div className="flex items-center gap-3 max-w-sm mt-2">
                    <div className="relative w-full">
                      <Phone className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={draft.mobile || '+91 9497100509'}
                        onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
                        placeholder="e.g. +91 9497100509"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Google Pay (GPay) Phone Number
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Phone number linked to Google Pay for quick client payments.
                  </p>
                  <div className="flex items-center gap-3 max-w-sm mb-4">
                    <div className="relative w-full">
                      <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={draft.gpayNumber || '9497100509'}
                        onChange={(e) => setDraft({ ...draft, gpayNumber: e.target.value })}
                        placeholder="e.g. 9497100509"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Direct UPI ID (VPA)
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    Your official Virtual Payment Address (e.g. <strong>adv.ctsasi-1@okaxis</strong>) used for one-tap payments across PhonePe, Google Pay, Paytm, and BHIM.
                  </p>
                  <div className="flex items-center gap-3 max-w-sm">
                    <div className="relative w-full">
                      <CreditCard className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={draft.upiId || 'adv.ctsasi-1@okaxis'}
                        onChange={(e) => setDraft({ ...draft, upiId: e.target.value })}
                        placeholder="e.g. adv.ctsasi-1@okaxis"
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200/90 leading-relaxed">
                  <p className="font-semibold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> How the client consultation workflow functions:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>The client taps the <strong>Online Consultation</strong> button on the website.</li>
                    <li>They are directly routed to your WhatsApp chat with a prefilled consultation request message or can call immediately.</li>
                    <li>Case details, court documents, and preliminary questions are shared in WhatsApp.</li>
                    <li>Appointment slot confirmation, video call link, and any consultation fee arrangements take place directly outside the website.</li>
                  </ol>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Consultation Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: CONTACT & CHAMBERS */}
          {activeTab === 'contact' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                Chamber Identity & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Advocate Full Name</label>
                  <input
                    type="text"
                    value={draft.clientName}
                    onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation & Credentials</label>
                  <input
                    type="text"
                    value={draft.designation}
                    onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Law Firm / Chamber Name</label>
                  <input
                    type="text"
                    value={draft.firmName}
                    onChange={(e) => setDraft({ ...draft, firmName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Court Locations Focus</label>
                  <input
                    type="text"
                    value={draft.locationFocus}
                    onChange={(e) => setDraft({ ...draft, locationFocus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chambers Full Postal Address</label>
                <textarea
                  rows={2}
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Office Landline</label>
                  <input
                    type="text"
                    value={draft.landline}
                    onChange={(e) => setDraft({ ...draft, landline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Display Number</label>
                  <input
                    type="text"
                    value={draft.mobile}
                    onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Raw Number (e.g. 919497100509)</label>
                  <input
                    type="text"
                    value={draft.whatsappNumber}
                    onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chamber Working Hours</label>
                  <input
                    type="text"
                    value={draft.officeHours}
                    onChange={(e) => setDraft({ ...draft, officeHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Court Hearing Sessions</label>
                  <input
                    type="text"
                    value={draft.courtHours}
                    onChange={(e) => setDraft({ ...draft, courtHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HERO & HEADLINES */}
          {activeTab === 'hero' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                Hero Section Content & Statistics
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Credential Badge</label>
                <input
                  type="text"
                  value={draft.heroBadge}
                  onChange={(e) => setDraft({ ...draft, heroBadge: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Headline</label>
                <input
                  type="text"
                  value={draft.heroHeadline}
                  onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none font-serif text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sub-Headline Text</label>
                <textarea
                  rows={3}
                  value={draft.heroSubheadline}
                  onChange={(e) => setDraft({ ...draft, heroSubheadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stat 1 Value</label>
                  <input
                    type="text"
                    value={draft.heroStat1Val}
                    onChange={(e) => setDraft({ ...draft, heroStat1Val: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-amber-400 font-bold mb-2"
                  />
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stat 1 Label</label>
                  <input
                    type="text"
                    value={draft.heroStat1Label}
                    onChange={(e) => setDraft({ ...draft, heroStat1Label: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stat 2 Value</label>
                  <input
                    type="text"
                    value={draft.heroStat2Val}
                    onChange={(e) => setDraft({ ...draft, heroStat2Val: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-amber-400 font-bold mb-2"
                  />
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stat 2 Label</label>
                  <input
                    type="text"
                    value={draft.heroStat2Label}
                    onChange={(e) => setDraft({ ...draft, heroStat2Label: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stat 3 Value</label>
                  <input
                    type="text"
                    value={draft.heroStat3Val}
                    onChange={(e) => setDraft({ ...draft, heroStat3Val: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm text-amber-400 font-bold mb-2"
                  />
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Stat 3 Label</label>
                  <input
                    type="text"
                    value={draft.heroStat3Label}
                    onChange={(e) => setDraft({ ...draft, heroStat3Label: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT BIO & PILLARS */}
          {activeTab === 'about' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                About Advocate Profile Narrative
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">About Section Title</label>
                  <input
                    type="text"
                    value={draft.aboutTitle}
                    onChange={(e) => setDraft({ ...draft, aboutTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">About Subtitle</label>
                  <input
                    type="text"
                    value={draft.aboutSubtitle}
                    onChange={(e) => setDraft({ ...draft, aboutSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio Paragraph 1</label>
                <textarea
                  rows={3}
                  value={draft.aboutBio1}
                  onChange={(e) => setDraft({ ...draft, aboutBio1: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio Paragraph 2</label>
                <textarea
                  rows={3}
                  value={draft.aboutBio2}
                  onChange={(e) => setDraft({ ...draft, aboutBio2: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio Paragraph 3 (Notary Role)</label>
                <textarea
                  rows={3}
                  value={draft.aboutBio3}
                  onChange={(e) => setDraft({ ...draft, aboutBio3: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Core Pillars / Values</label>
                <div className="space-y-2">
                  {draft.aboutPillars.map((pillar, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={pillar}
                        onChange={(e) => {
                          const updated = [...draft.aboutPillars];
                          updated[idx] = e.target.value;
                          setDraft({ ...draft, aboutPillars: updated });
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRACTICE AREAS */}
          {activeTab === 'practice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Practice Areas ({draft.practiceAreas.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddPracticeArea}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Practice Area</span>
                </button>
              </div>

              <div className="space-y-6">
                {draft.practiceAreas.map((area, idx) => (
                  <div key={area.id || idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={area.title}
                          onChange={(e) => {
                            const updated = [...draft.practiceAreas];
                            updated[idx].title = e.target.value;
                            setDraft({ ...draft, practiceAreas: updated });
                          }}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm font-bold text-white font-serif"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePracticeArea(idx)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                        title="Delete Area"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Court Jurisdiction</label>
                      <input
                        type="text"
                        value={area.courtForum}
                        onChange={(e) => {
                          const updated = [...draft.practiceAreas];
                          updated[idx].courtForum = e.target.value;
                          setDraft({ ...draft, practiceAreas: updated });
                        }}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-amber-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Summary Description</label>
                      <textarea
                        rows={2}
                        value={area.summary}
                        onChange={(e) => {
                          const updated = [...draft.practiceAreas];
                          updated[idx].summary = e.target.value;
                          setDraft({ ...draft, practiceAreas: updated });
                        }}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Key Points (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={area.points.join('\n')}
                        onChange={(e) => {
                          const updated = [...draft.practiceAreas];
                          updated[idx].points = e.target.value.split('\n').filter((p) => p.trim() !== '');
                          setDraft({ ...draft, practiceAreas: updated });
                        }}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GALLERY SLIDESHOW */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Client Slideshow Gallery ({draft.galleryImages?.length || 0} Photos)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    These photos automatically rotate and slide on the main website for visiting clients to see.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer shadow-md transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Local Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleMultipleGalleryUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Add by URL box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Or Add Picture via Web URL:</span>
                <form onSubmit={handleAddGalleryByUrl} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] text-slate-400 mb-1">Image URL *</label>
                    <input
                      type="text"
                      required
                      value={newGalUrl}
                      onChange={(e) => setNewGalUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={newGalTitle}
                      onChange={(e) => setNewGalTitle(e.target.value)}
                      placeholder="e.g. Chamber Conference Desk"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">Short Caption</label>
                    <input
                      type="text"
                      value={newGalCaption}
                      onChange={(e) => setNewGalCaption(e.target.value)}
                      placeholder="Brief note for clients..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photo</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Gallery Items Grid / List */}
              <div className="space-y-4">
                {(!draft.galleryImages || draft.galleryImages.length === 0) ? (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                    <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-400">No gallery photos added yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click the "Upload Local Photos" button above to upload photos from your device.
                    </p>
                  </div>
                ) : (
                  draft.galleryImages.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex flex-col gap-1 text-slate-400">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveGalleryItem(idx, 'up')}
                            className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] text-center font-mono text-amber-400 font-bold">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === draft.galleryImages.length - 1}
                            onClick={() => handleMoveGalleryItem(idx, 'down')}
                            className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Photo Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateGalleryItem(item.id, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-medium"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Client Caption</label>
                          <input
                            type="text"
                            value={item.caption || ''}
                            onChange={(e) => handleUpdateGalleryItem(item.id, 'caption', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Category</label>
                          <input
                            type="text"
                            value={item.category || 'Chambers'}
                            onChange={(e) => handleUpdateGalleryItem(item.id, 'category', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-amber-400"
                          />
                        </div>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: IMAGES & LOCAL UPLOADS */}
          {activeTab === 'images' && (
            <div className="space-y-6 max-w-3xl">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-serif text-lg font-bold text-white">Upload & Edit Website Branding & Media</h3>
                <p className="text-xs text-slate-400">
                  Upload your chamber logo, browser favicon, and photography directly from local files.
                </p>
              </div>

              {/* A. Chambers Official Logo */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-400 flex items-center gap-2">
                      <span>A. Chamber Official Logo</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Appears in the header and footer. If uploaded, replaces the default insignia.
                    </p>
                  </div>
                  {draft.images.logo && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          images: { ...prev.images, logo: '' },
                        }))
                      }
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 w-32 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center p-2 shrink-0">
                    {draft.images.logo ? (
                      <img src={draft.images.logo} alt="Custom Logo Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[11px] text-slate-500 text-center">Using Default Crest</span>
                    )}
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Local Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('logo', e)}
                      />
                    </label>

                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Or paste Logo URL:</span>
                      <input
                        type="text"
                        value={draft.images.logo || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            images: { ...draft.images, logo: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* B. Browser Favicon */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-400 flex items-center gap-2">
                      <span>B. Browser Tab Favicon</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Appears in the browser tab title bar (square 32x32, 64x64 or any PNG/ICO).
                    </p>
                  </div>
                  {draft.images.favicon && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          images: { ...prev.images, favicon: '' },
                        }))
                      }
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Reset Favicon
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center p-1 shrink-0">
                    {draft.images.favicon ? (
                      <img src={draft.images.favicon} alt="Favicon Preview" className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-500 text-center">Default Scale Icon</span>
                    )}
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Local Favicon File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('favicon', e)}
                      />
                    </label>

                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Or paste Favicon URL:</span>
                      <input
                        type="text"
                        value={draft.images.favicon || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            images: { ...draft.images, favicon: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Advocate Portrait */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white">1. Advocate Portrait Photo</h4>
                    <p className="text-[11px] text-slate-400">Displayed in the Hero card and About section.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 w-32 h-40 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                    <img
                      src={draft.images.portrait}
                      alt="Portrait Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Local Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('portrait', e)}
                      />
                    </label>

                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Or paste custom Image URL:</span>
                      <input
                        type="text"
                        value={draft.images.portrait}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            images: { ...draft.images, portrait: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Chambers Office / Reception */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white">2. Chambers Office Suite / Reception</h4>
                    <p className="text-[11px] text-slate-400">Displayed in the About Chambers card.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 w-44 h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                    <img
                      src={draft.images.office}
                      alt="Office Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Local Office Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('office', e)}
                      />
                    </label>

                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Or paste custom Image URL:</span>
                      <input
                        type="text"
                        value={draft.images.office}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            images: { ...draft.images, office: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Hero Chambers Law Library */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white">3. Law Library / Chambers Banner</h4>
                    <p className="text-[11px] text-slate-400">Law chamber interior image asset.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 w-44 h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                    <img
                      src={draft.images.heroChambers}
                      alt="Hero Chambers Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Local Banner Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('heroChambers', e)}
                      />
                    </label>

                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Or paste custom Image URL:</span>
                      <input
                        type="text"
                        value={draft.images.heroChambers}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            images: { ...draft.images, heroChambers: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Chamber Website Background Image (Wooden / Custom Wall Panel Texture) */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>4. Website Background Image (Wooden Wall / Custom Texture)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Appears behind the transparent frosted glass platform across the whole website.
                    </p>
                  </div>
                  {draft.images.backgroundImage && draft.images.backgroundImage !== '/assets/chamber_wood_bg.jpg' && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          images: { ...prev.images, backgroundImage: '/assets/chamber_wood_bg.jpg' },
                        }))
                      }
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Default Wood</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 w-full h-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0 relative group">
                    <img
                      src={draft.images.backgroundImage || '/assets/chamber_wood_bg.jpg'}
                      alt="Background Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2 pointer-events-none">
                      <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs font-medium">
                        Active Background
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-7 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload New Background Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('backgroundImage', e)}
                      />
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Select any photo (wood grain, mahogany, office chamber, law library). Automatically optimized.
                    </p>

                    <div>
                      <span className="block text-[11px] text-slate-400 mb-1">Or paste Background Image URL:</span>
                      <input
                        type="text"
                        value={draft.images.backgroundImage || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            images: { ...draft.images, backgroundImage: e.target.value },
                          })
                        }
                        placeholder="https://... (or leave blank for default wood)"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="max-w-md space-y-5">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <span>Change Admin Master Password</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Update the password required when typing <code className="text-amber-400 font-mono">/getinsideadmin</code>.
                </p>
              </div>

              {pwdMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    pwdMsg.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950/80 text-red-300 border border-red-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="Enter new password (min 6 characters)..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder="Re-enter new password..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md transition-colors"
                >
                  Update Access Password
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all website text and images to initial default content?')) {
                  onResetDefaults();
                  setDraft(content);
                  showStatus('Website reset to default content.');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-900/50 rounded-lg transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Logout Admin</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
            >
              Preview Live Website
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
