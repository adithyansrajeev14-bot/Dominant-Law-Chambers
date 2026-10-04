/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Scale,
  ShieldCheck,
  Gavel,
  Users,
  Home,
  FileText,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Award,
  Briefcase,
  Calendar,
  Download,
  Code,
  Lock,
  Edit3,
  LogOut,
  Stamp,
  BookOpen,
  Play,
  Pause,
  Maximize2,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Landmark,
  Car,
  Star,
  IndianRupee,
  Smartphone,
  CreditCard,
  Shield,
  AlertCircle,
} from 'lucide-react';

import { SiteContent, PracticeAreaItem, GalleryImageItem } from './types/content';
import { DEFAULT_CONTENT } from './data/defaultContent';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import {
  subscribeGlobalSettings,
  saveGlobalSettings,
  subscribeGlobalGallery,
  syncAllGlobalGallery,
  testFirestoreConnection,
} from './lib/firebase';

const STORAGE_CONTENT_KEY = 'CHAMBERS_CONTENT_LIGHT_PLATFORM_V1';

export default function App() {
  // Content State persisted to LocalStorage with automatic migration for new practice areas
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONTENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasAllAreas =
          parsed.practiceAreas?.some((p: PracticeAreaItem) => p.id === 'lok-ayukta') &&
          parsed.practiceAreas?.some((p: PracticeAreaItem) => p.id === 'criminal-defence') &&
          parsed.practiceAreas?.some((p: PracticeAreaItem) => p.id === 'arbitration-disputes') &&
          parsed.practiceAreas?.some((p: PracticeAreaItem) => p.id === 'cooperative-tribunal');

        if (!hasAllAreas) {
          parsed.practiceAreas = DEFAULT_CONTENT.practiceAreas;
          parsed.heroHeadline = DEFAULT_CONTENT.heroHeadline;
          parsed.heroSubheadline = DEFAULT_CONTENT.heroSubheadline;
          parsed.aboutBio1 = DEFAULT_CONTENT.aboutBio1;
          parsed.aboutBio2 = DEFAULT_CONTENT.aboutBio2;
          parsed.aboutBio3 = DEFAULT_CONTENT.aboutBio3;
          parsed.aboutPillars = DEFAULT_CONTENT.aboutPillars;
          parsed.highlights = DEFAULT_CONTENT.highlights;
          parsed.whyChooseUs = DEFAULT_CONTENT.whyChooseUs;
          parsed.onlineConsultationFee = DEFAULT_CONTENT.onlineConsultationFee;
          parsed.gpayNumber = DEFAULT_CONTENT.gpayNumber;
        }

        if (!parsed.gpayNumber) {
          parsed.gpayNumber = DEFAULT_CONTENT.gpayNumber;
        }
        if (!parsed.upiId) {
          parsed.upiId = DEFAULT_CONTENT.upiId;
        }
        if (parsed.officeHours && parsed.officeHours.includes('4:30 PM')) {
          parsed.officeHours = DEFAULT_CONTENT.officeHours;
        }
        return {
          ...DEFAULT_CONTENT,
          ...parsed,
          images: {
            ...DEFAULT_CONTENT.images,
            ...(parsed.images || {}),
          },
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CONTENT;
  });

  // Admin UI State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Online Consultation Booking & Verification State
  const [consultationForm, setConsultationForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    matterCategory: 'Family Court & Matrimonial Law',
    preferredDate: '',
    preferredTime: '03:00 PM - 08:00 PM (Afternoon & Evening Chamber)',
    summary: '',
  });
  const [consultationSuccessData, setConsultationSuccessData] = useState<{
    name: string;
    phone: string;
    matterCategory: string;
    slot: string;
  } | null>(null);

  // General App State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeArea, setActiveArea] = useState<PracticeAreaItem | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gallery Slideshow State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [selectedGalleryModal, setSelectedGalleryModal] = useState<GalleryImageItem | null>(null);

  const galleryList = content.galleryImages && content.galleryImages.length > 0
    ? content.galleryImages
    : DEFAULT_CONTENT.galleryImages;

  // Touch gesture tracking for mobile swipe
  const galleryTouchStartX = useRef<number | null>(null);
  const galleryTouchStartY = useRef<number | null>(null);
  const modalTouchStartX = useRef<number | null>(null);
  const modalTouchStartY = useRef<number | null>(null);

  // Auto-clamp slide index if photos were deleted
  useEffect(() => {
    if (galleryList.length > 0 && currentSlideIndex >= galleryList.length) {
      setCurrentSlideIndex(0);
    }
  }, [galleryList.length, currentSlideIndex]);

  // Auto-sliding timer (advances every 4.5 seconds unless paused)
  useEffect(() => {
    if (isSlidePaused || galleryList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % galleryList.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isSlidePaused, galleryList.length]);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + galleryList.length) % galleryList.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % galleryList.length);
  };

  const handleModalPrev = () => {
    if (!selectedGalleryModal || galleryList.length <= 1) return;
    const currIdx = galleryList.findIndex((it) => it.id === selectedGalleryModal.id);
    const prevIdx = (currIdx - 1 + galleryList.length) % galleryList.length;
    setSelectedGalleryModal(galleryList[prevIdx]);
  };

  const handleModalNext = () => {
    if (!selectedGalleryModal || galleryList.length <= 1) return;
    const currIdx = galleryList.findIndex((it) => it.id === selectedGalleryModal.id);
    const nextIdx = (currIdx + 1) % galleryList.length;
    setSelectedGalleryModal(galleryList[nextIdx]);
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Civil Litigation',
    message: '',
    mode: 'In-Person at Chambers (Vanchiyoor)',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic Favicon Updater
  useEffect(() => {
    if (content.images.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = content.images.favicon;
    }
  }, [content.images.favicon]);

  // Firebase Real-Time Listeners for Global Content & Images
  useEffect(() => {
    testFirestoreConnection();

    // Subscribe to global chambers settings & branding from Firebase
    const unsubscribeSettings = subscribeGlobalSettings((remoteSettings) => {
      if (remoteSettings) {
        setContent((prev) => {
          const merged: SiteContent = {
            ...prev,
            ...remoteSettings,
            images: {
              ...prev.images,
              portrait: (remoteSettings as Record<string, string>).portrait || prev.images.portrait,
              heroChambers: (remoteSettings as Record<string, string>).heroChambers || prev.images.heroChambers,
              office: (remoteSettings as Record<string, string>).office || prev.images.office,
              logo: (remoteSettings as Record<string, string>).logo !== undefined ? (remoteSettings as Record<string, string>).logo : prev.images.logo,
              favicon: (remoteSettings as Record<string, string>).favicon !== undefined ? (remoteSettings as Record<string, string>).favicon : prev.images.favicon,
              backgroundImage: (remoteSettings as Record<string, string>).backgroundImage !== undefined ? (remoteSettings as Record<string, string>).backgroundImage : prev.images.backgroundImage,
            },
          };
          try {
            localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(merged));
          } catch {
            // Ignored
          }
          return merged;
        });
      }
    });

    // Subscribe to global gallery images from Firebase
    const unsubscribeGallery = subscribeGlobalGallery((remoteGallery) => {
      if (remoteGallery && remoteGallery.length > 0) {
        setContent((prev) => {
          const updated: SiteContent = {
            ...prev,
            galleryImages: remoteGallery,
          };
          try {
            localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(updated));
          } catch {
            // Ignored
          }
          return updated;
        });
      }
    });

    return () => {
      unsubscribeSettings();
      unsubscribeGallery();
    };
  }, []);

  // URL listener: if user navigates to or enters /getinsideadmin in the URL (pathname, hash, or search params)
  useEffect(() => {
    const handleUrlCheck = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (pathname.includes('getinsideadmin') || hash.includes('getinsideadmin') || search.includes('getinsideadmin')) {
        if (isAdminLoggedIn) {
          setShowAdminPanel(true);
        } else {
          setShowLoginModal(true);
        }
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, [isAdminLoggedIn]);

  // Keyboard shortcuts listener (Escape to close modals, Arrow keys for gallery, and secret /getinsideadmin)
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes any open modal or drawer
      if (e.key === 'Escape') {
        if (selectedGalleryModal) {
          setSelectedGalleryModal(null);
          return;
        }
        if (activeArea) {
          setActiveArea(null);
          return;
        }
        if (showCodeModal) {
          setShowCodeModal(false);
          return;
        }
        if (showLoginModal) {
          setShowLoginModal(false);
          return;
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          return;
        }
      }

      // Arrow keys navigate fullscreen gallery
      if (selectedGalleryModal) {
        if (e.key === 'ArrowLeft') {
          handleModalPrev();
          return;
        }
        if (e.key === 'ArrowRight') {
          handleModalNext();
          return;
        }
      }

      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      keyBuffer += e.key;
      if (keyBuffer.length > 30) keyBuffer = keyBuffer.slice(-30);

      if (keyBuffer.toLowerCase().endsWith('/getinsideadmin')) {
        keyBuffer = '';
        if (isAdminLoggedIn) {
          setShowAdminPanel(true);
        } else {
          setShowLoginModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminLoggedIn, selectedGalleryModal, activeArea, showCodeModal, showLoginModal, mobileMenuOpen]);

  // Save Content Globally to Firebase & LocalStorage
  const handleSaveContent = async (newContent: SiteContent) => {
    setContent(newContent);
    try {
      localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(newContent));
    } catch {
      // Ignored
    }

    try {
      showToast('Saving globally to Firebase...');
      await saveGlobalSettings(newContent);
      if (newContent.galleryImages !== undefined) {
        await syncAllGlobalGallery(newContent.galleryImages);
      }
      showToast('Saved globally to Firebase! Live for all visitors.');
    } catch (err) {
      console.error('Firebase save error', err);
      showToast('Saved locally. Check network for Firebase sync.');
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setContent(DEFAULT_CONTENT);
    try {
      localStorage.removeItem(STORAGE_CONTENT_KEY);
      showToast('Reset to original chamber details.');
    } catch {
      // Ignored
    }
  };

  // Change Master Password (hashed securely in Firestore database)
  const handleUpdatePassword = () => {
    showToast('Admin password updated and securely hashed in database.');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminPanel(false);
    showToast('Admin logged out.');
  };

  // Online Consultation Booking & Payment Verification Handler
  const handleOnlineConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !consultationForm.name.trim() ||
      !consultationForm.phone.trim() ||
      !consultationForm.whatsapp.trim() ||
      !consultationForm.preferredDate.trim() ||
      !consultationForm.summary.trim()
    ) {
      showToast('Please fill all required booking fields marked with *');
      return;
    }

    const targetPhone = content.whatsappNumber || content.mobile || '9497100509';
    const cleanNumber = targetPhone.replace(/\D/g, '');
    const targetWaNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const waText =
      `*⚖️ ONLINE LEGAL CONSULTATION REQUEST*\n\n` +
      `*Chambers of Advocate C.T. Sasi Chengaroor*\n` +
      `The Dominant Law Chambers, Vanchiyoor, Trivandrum\n\n` +
      `*Client Name:* ${consultationForm.name.trim()}\n` +
      `*Mobile Phone:* ${consultationForm.phone.trim()}\n` +
      `*WhatsApp (for Video/Voice Link):* ${consultationForm.whatsapp.trim()}\n` +
      `*Matter Category:* ${consultationForm.matterCategory}\n` +
      `*Preferred Slot:* ${consultationForm.preferredDate} (${consultationForm.preferredTime})\n` +
      `*Case Summary:* ${consultationForm.summary.trim()}\n\n` +
      `I would like to schedule an online legal consultation via WhatsApp Call. Please guide me regarding the consultation schedule and setup.`;

    const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waText)}`;

    setConsultationSuccessData({
      name: consultationForm.name.trim(),
      phone: consultationForm.phone.trim(),
      matterCategory: consultationForm.matterCategory,
      slot: `${consultationForm.preferredDate} (${consultationForm.preferredTime})`,
    });

    showToast('Consultation request generated! Opening WhatsApp...');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      showToast('Please fill all required fields marked with *');
      return;
    }

    const waText =
      `*Legal Consultation Request*\n\n` +
      `*Client Name:* ${formData.name.trim()}\n` +
      `*Contact:* ${formData.phone.trim()}\n` +
      (formData.email.trim() ? `*Email:* ${formData.email.trim()}\n` : '') +
      `*Category:* ${formData.category}\n` +
      `*Mode:* ${formData.mode}\n\n` +
      `*Matter Description:*\n${formData.message.trim()}\n\n` +
      `_Chambers of ${content.clientName}_`;

    const encoded = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${content.whatsappNumber}?text=${encoded}`;
    showToast('Connecting with Chambers via WhatsApp...');
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  const copyInquiry = () => {
    const text =
      `${content.clientName} - Consultation Request:\n` +
      `Name: ${formData.name || 'Not provided'}\n` +
      `Phone: ${formData.phone || 'Not provided'}\n` +
      `Category: ${formData.category}\n` +
      `Mode: ${formData.mode}\n` +
      `Summary: ${formData.message || 'General legal consultation'}`;

    navigator.clipboard
      .writeText(text)
      .then(() => showToast('Inquiry details copied to clipboard!'))
      .catch(() => showToast('Unable to copy. Please submit via WhatsApp.'));
  };

  const cleanWaNumber = (content.whatsappNumber || '919497100509').replace(/\D/g, '');
  const targetWaNumber = cleanWaNumber.length === 10 ? `91${cleanWaNumber}` : cleanWaNumber;

  const directWhatsAppUrl = `https://wa.me/${targetWaNumber}?text=Hello%20${encodeURIComponent(
    content.clientName
  )},%20I%20would%20like%20to%20consult%20regarding%20a%20legal%20matter.`;

  const onlineConsultationWhatsAppUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(
    `Hello ${content.clientName}, I would like to schedule an online legal consultation via WhatsApp Call. Please guide me regarding the consultation schedule and setup.`
  )}`;

  // Icon Helper for Practice Areas
  const renderIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-neutral-800" />;
      case 'Users':
        return <Users className="w-5 h-5 text-neutral-800" />;
      case 'Home':
        return <Home className="w-5 h-5 text-neutral-800" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-neutral-800" />;
      case 'Gavel':
        return <Gavel className="w-5 h-5 text-neutral-800" />;
      case 'Car':
        return <Car className="w-5 h-5 text-neutral-800" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5 text-neutral-800" />;
      case 'Award':
        return <Award className="w-5 h-5 text-neutral-800" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-neutral-800" />;
      default:
        return <Scale className="w-5 h-5 text-neutral-800" />;
    }
  };

  const currentBgImage =
    content.images.backgroundImage || DEFAULT_CONTENT.images.backgroundImage || '/assets/chamber_wood_bg.jpg';

  return (
    <div
      className="platform-canvas min-h-screen text-neutral-800 font-sans antialiased selection:bg-neutral-900 selection:text-white py-0 sm:py-6 lg:py-8 px-0 sm:px-4 lg:px-6 2xl:px-8 pb-28 lg:pb-8"
      style={{
        '--bg-custom-image': `url('${currentBgImage}')`,
      } as React.CSSProperties}
    >
      {/* Fixed Ambient Background Image (Configurable via Admin Panel) */}
      <div
        className="fixed inset-0 pointer-events-none z-[-1] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `radial-gradient(ellipse 90% 70% at 50% 15%, rgba(0, 0, 0, 0.2) 0%, rgba(15, 8, 4, 0.75) 100%), url('${currentBgImage}')`,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
        }}
      />
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-neutral-900 text-white px-4 sm:px-5 py-3 rounded-xl shadow-2xl border border-neutral-700 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Action Bar (ONLY visible when authenticated) */}
      {isAdminLoggedIn && (
        <div className="max-w-[1540px] 2xl:max-w-[1680px] mx-auto mb-3 bg-neutral-900 text-white px-4 sm:px-6 py-2.5 text-xs font-medium rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-neutral-200">Chambers Management Console Active</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-amber-600 hover:bg-amber-500 text-neutral-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details, Gallery & Media</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Expansive Architectural Monolith Platform Container with Shiny Light Grey Border & Translucent Glass */}
      <div className="monolith-platform max-w-[1540px] 2xl:max-w-[1680px] mx-auto rounded-none sm:rounded-3xl overflow-hidden relative shiny-border-lg shiny-top-sheen sm:shadow-[0_20px_50px_-10px_rgba(148,163,184,0.35)]">
        
        {/* Top Legal Authority Strip — Rich Executive Navy & Warm Gold Contrast */}
        <div className="bg-[#0f172a] text-slate-300 px-4 sm:px-8 lg:px-12 2xl:px-16 py-2 sm:py-2.5 text-xs border-b border-white/10">
          {/* Mobile Single Row View (<sm) */}
          <div className="flex sm:hidden items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] truncate">
              <Stamp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{content.designation} · Trivandrum</span>
            </span>
            <a
              href={`tel:${content.mobile.replace(/\s+/g, '')}`}
              className="text-white hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 shrink-0 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 active:scale-95 transition-transform"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Call Desk</span>
            </a>
          </div>

          {/* Desktop/Tablet Extended Row (>=sm) */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold tracking-wide">
                <Stamp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Govt. Authorized Notary Public & Senior Advocate · 25+ Yrs Bar Practice</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Dominant Towers, Vanchiyoor, Trivandrum</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                Office: <span className="text-slate-200 font-mono font-medium">{content.landline}</span>
              </span>
              <span className="text-slate-600">·</span>
              <a
                href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                className="text-white hover:text-amber-300 transition-colors flex items-center gap-1.5 font-bold"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct: {content.mobile}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sleek Executive Navigation Header */}
        <header className="px-4 sm:px-8 lg:px-12 2xl:px-16 py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-40 bg-white/95 sm:bg-white/90 text-slate-900 border-b border-slate-200/80 shadow-xs">
          {/* Logo / Brand Mark */}
          <a href="#hero" className="flex items-center gap-3 group max-w-[75%] sm:max-w-none">
            {content.images.logo ? (
              <img
                src={content.images.logo}
                alt={content.firmName}
                decoding="async"
                className="h-10 sm:h-11 w-auto max-w-[130px] sm:max-w-[170px] object-contain rounded-lg shrink-0"
              />
            ) : null}
            <div className="flex flex-col min-w-0">
              <div className="font-heading text-lg sm:text-2xl font-bold tracking-wide text-slate-900 truncate">
                <span className="text-amber-800 mr-1.5">The Dominant</span>
                <span>Law Chambers</span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Chambers of {content.clientName}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links — Pure Typographic Elegance (No Clutter Badges) */}
          <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-slate-700">
            <a href="#about" className="hover:text-amber-800 transition-colors">
              About
            </a>
            <a href="#practice-areas" className="hover:text-amber-800 transition-colors">
              Practice Forums
            </a>
            <a href="#online-consultation" className="hover:text-amber-800 transition-colors">
              Online Consultation
            </a>
            <a href="#highlights" className="hover:text-amber-800 transition-colors">
              Court Highlights
            </a>
            <a href="#gallery" className="hover:text-amber-800 transition-colors">
              Gallery
            </a>
            <a href="#why-choose-us" className="hover:text-amber-800 transition-colors">
              Why Us
            </a>
            <a href="#contact" className="hover:text-amber-800 transition-colors">
              Contact
            </a>
          </nav>

          {/* Header Action Dashboard Controls — Clean & Uncrowded */}
          <div className="flex items-center gap-2.5">
            <a
              href="#online-consultation"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-200" />
              <span>Online Consultation</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 transition-colors focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer (Polished, High-End Card Drawer) */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-300 px-4 sm:px-6 pt-3 pb-6 space-y-2.5 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Navigation Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-500" />
                <span>About Advocate C.T. Sasi</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <a
              href="#practice-areas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-amber-700" />
                <span>10 Active Court Practice Forums</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold uppercase">
                Family Court Focus
              </span>
            </a>

            <a
              href={onlineConsultationWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-xs transition-all"
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span>Online Consultation</span>
              </span>
              <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded font-extrabold uppercase">
                WhatsApp Call
              </span>
            </a>

            <a
              href="#highlights"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-slate-500" />
                <span>Court Record & Track Record</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Chambers & Court Gallery</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <a
              href="#why-choose-us"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Why Choose The Dominant</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Vanchiyoor Location & Contact</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <a
                href="https://maps.google.com/maps?q=8.4938957%2C76.9416295&z=17&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>Open Map</span>
              </a>
              <a
                href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Direct</span>
              </a>
            </div>
          </div>
        )}

        {/* Architectural Chamber Heraldry Banner (Transparent Background with Floating Sculpted Glass Plaque) */}
        <section id="hero" className="relative bg-transparent py-6 sm:py-10 px-4 sm:px-8 text-center">
          <div className="max-w-3xl mx-auto glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white/90 border border-white/80 shadow-xl space-y-2.5 relative overflow-hidden shiny-top-sheen">
            
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300/80 shadow-2xs">
              <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Chamber of Senior Advocacy & Statutory Notary</span>
            </div>

            <h1 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              {content.firmName}
            </h1>

            <p className="text-xs sm:text-sm font-medium text-slate-700 max-w-xl mx-auto leading-relaxed">
              District Courts, Family Courts, MACT, Tribunals & High Court of Kerala · Vanchiyoor, Thiruvananthapuram
            </p>
          </div>
        </section>

        {/* Corporate Split Law Firm Section (Mobile-First: Desk Profile first on mobile, Active Court Practice sidebar second) */}
        <section id="chambers-overview" className="bg-white/60 border-b border-white/70 py-8 sm:py-12 lg:py-14 scroll-section-optimized">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* DESK PORTRAIT & COUNSELOR PROFILE (Order 1 on mobile, Order 2 on desktop) */}
              <div className="lg:col-span-8 space-y-5 sm:space-y-6 order-1 lg:order-2">
                
                {/* Large High-Resolution Desk Photograph with Light Grey Shiny Border */}
                <div className="rounded-2xl overflow-hidden bg-white/90 p-1.5 sm:p-2 relative border border-white/80 shadow-md">
                  <img
                    src={content.images.portrait}
                    alt={content.clientName}
                    decoding="async"
                    className="w-full h-auto max-h-[540px] sm:max-h-[600px] object-cover object-top rounded-xl"
                  />
                </div>

                {/* Stately Counsel Profile Card with Light Grey Shiny Border */}
                <div className="bg-white/90 rounded-2xl p-5 sm:p-7 lg:p-8 space-y-5 relative border border-white/80 shadow-md">
                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                      <span>Lead Counsel & Govt. Appointed Notary</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-medium">Vanchiyoor Bar</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                      {content.clientName}
                    </h2>
                    <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed">
                      {content.heroSubheadline}
                    </p>
                  </div>

                  {/* Corporate Metrics Bar */}
                  <div className="grid grid-cols-3 gap-3 py-3.5 border-y border-slate-200/60 text-center bg-slate-50/70 rounded-xl px-3">
                    <div>
                      <p className="text-xl sm:text-3xl font-bold text-slate-900 font-serif">{content.heroStat1Val}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{content.heroStat1Label}</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-3xl font-bold text-amber-700 font-serif">{content.heroStat2Val}</p>
                      <p className="text-[11px] text-amber-800 font-bold mt-0.5">{content.heroStat2Label}</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-3xl font-bold text-slate-900 font-serif">{content.heroStat3Val}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{content.heroStat3Label}</p>
                    </div>
                  </div>

                  {/* Action Buttons — Clean & Focused */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <a
                      href={onlineConsultationWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-xs transition-all active:scale-[0.99]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Online Legal Consultation</span>
                    </a>
                    <a
                      href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.99]"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Call {content.mobile}</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* ACTIVE COURT PRACTICE SIDEBAR (Order 2 on mobile, Order 1 on desktop) */}
              <div className="lg:col-span-4 space-y-5 order-2 lg:order-1">
                
                {/* Active Court Practice Table with Light Grey Shiny Border & Individual Session Hover Enlargement */}
                <div className="rounded-2xl bg-white/90 border border-white/80 shadow-md p-2.5">
                  <div className="bg-slate-100/90 text-slate-900 font-serif font-bold text-base sm:text-lg px-4 sm:px-5 py-3.5 sm:py-4 border border-slate-200/80 rounded-xl flex items-center justify-between mb-2.5 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <Scale className="w-5 h-5 text-amber-700 shrink-0" />
                      <span>Active Court Practice</span>
                    </div>
                    <span className="text-xs sm:text-sm bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-0.5 rounded-lg font-mono font-bold shrink-0">
                      10 Forums
                    </span>
                  </div>

                  <div className="space-y-2 text-sm sm:text-base">
                    {/* 1. Family Court - Highlighted in warm tan/gold with smooth enlargement on hover */}
                    <div
                      onClick={() => {
                        const area = content.practiceAreas.find((p) => p.id === 'family-law');
                        if (area) setActiveArea(area);
                      }}
                      className="p-3.5 sm:p-4.5 bg-[#c2a77d] hover:bg-[#b89b6e] text-white font-bold flex items-center justify-between cursor-pointer rounded-xl transition-all duration-200 ease-out transform-gpu hover:scale-[1.03] hover:shadow-lg hover:shadow-amber-900/25 hover:z-20 relative group active:scale-[0.98]"
                      title="Click to view procedural scope"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Users className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-bold text-sm sm:text-base tracking-wide leading-snug">
                          Family Court & Matrimonial
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs uppercase font-black tracking-wider bg-white/25 px-2.5 py-1 rounded-md text-white shrink-0 group-hover:bg-white/35 transition-colors ml-2">
                        Primary Focus
                      </span>
                    </div>

                    {/* Remaining 9 Practice Forums with individual smooth hover enlargement & larger font */}
                    {content.practiceAreas
                      .filter((p) => p.id !== 'family-law')
                      .map((area) => (
                        <div
                          key={area.id}
                          onClick={() => setActiveArea(area)}
                          className="p-3.5 sm:p-4 px-4 sm:px-4.5 bg-white hover:bg-amber-50/40 text-slate-800 font-medium flex items-center justify-between cursor-pointer rounded-xl transition-all duration-200 ease-out transform-gpu hover:scale-[1.03] hover:shadow-md hover:shadow-amber-900/10 hover:border-amber-400/80 hover:z-10 relative group border border-slate-200/70 active:scale-[0.98]"
                          title="Click to view procedural scope"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-slate-500 group-hover:text-amber-700 group-hover:scale-110 transition-all duration-200 shrink-0">
                              {renderIcon(area.iconName)}
                            </div>
                            <span className="group-hover:text-slate-950 group-hover:font-bold transition-all text-sm sm:text-[15px] font-semibold text-slate-900 leading-snug">
                              {area.title}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-amber-700 group-hover:translate-x-1 transition-all duration-200 shrink-0 ml-2" />
                        </div>
                      ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Section: About Advocate Sasi & Chambers Suite */}
        <section id="about" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-amber-50/30 via-white/90 to-slate-50/70 scroll-section-optimized">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center">
            
            {/* Left Chambers Overview Card */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="glass-card rounded-3xl p-6 sm:p-10 space-y-6">
                
                <div className="pb-4 border-b border-neutral-200/80">
                  <span className="text-xs uppercase font-bold tracking-widest text-neutral-500">Chambers Headquarters</span>
                  <h4 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">{content.firmName}</h4>
                  <p className="text-sm text-neutral-700 mt-1.5 leading-relaxed">{content.address}</p>
                </div>

                <div className="space-y-5 text-sm text-neutral-700 leading-relaxed">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 shadow-2xs">
                      <Stamp className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <strong className="text-neutral-950 block font-serif text-base sm:text-lg">Notary Public Authority</strong>
                      <span className="text-neutral-700 text-sm">Appointed by the Government to execute statutory notarial acts, attest deeds, verify affidavits, and certify documents.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 shadow-2xs">
                      <Scale className="w-5 h-5 text-neutral-800" />
                    </div>
                    <div>
                      <strong className="text-neutral-950 block font-serif text-base sm:text-lg">District Court Jurisdiction</strong>
                      <span className="text-neutral-700 text-sm">Practicing regularly across Thiruvananthapuram District Judiciary, CJM, Sub Courts, Munsiff Courts, and Chengaroor.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 shadow-2xs">
                      <BookOpen className="w-5 h-5 text-neutral-800" />
                    </div>
                    <div>
                      <strong className="text-neutral-950 block font-serif text-base sm:text-lg">Procedural Rigor & Transparency</strong>
                      <span className="text-neutral-700 text-sm">Delivering practical dispute settlements, unvarnished merit opinions, and resolute courtroom representation.</span>
                    </div>
                  </div>
                </div>

                {/* Office Suite Photo */}
                <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-white/80 relative glass-card p-1 shadow-md">
                  <img src={content.images.office} alt="Chambers Office" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/90 backdrop-blur-sm text-xs sm:text-sm text-white px-4 py-2 rounded-xl flex items-center justify-between">
                    <span className="font-semibold">Dominant Towers Suite, Vanchiyoor</span>
                    <span className="text-amber-400 font-bold">Open Mon - Sat</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${content.landline.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-3.5 px-4 text-xs sm:text-sm font-bold text-neutral-800 bg-white/80 border border-neutral-300 rounded-xl hover:bg-white transition-colors shadow-2xs"
                  >
                    Office: {content.landline}
                  </a>
                  <a
                    href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-3.5 px-4 text-xs sm:text-sm font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-2xs"
                  >
                    Direct: {content.mobile}
                  </a>
                </div>

              </div>
            </div>

            {/* Right Narrative Profile */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 sm:space-y-8">
              
              <div className="space-y-2.5">
                <span className="text-neutral-600 font-bold text-xs tracking-widest uppercase bg-white/80 px-3.5 py-1 rounded-full border border-neutral-200">
                  {content.aboutBadge}
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight text-balance">
                  {content.aboutTitle}
                </h2>
                <p className="text-lg sm:text-xl font-semibold text-neutral-800">{content.aboutSubtitle}</p>
              </div>

              <div className="space-y-5 text-neutral-700 leading-relaxed text-base sm:text-lg font-normal">
                <p>{content.aboutBio1}</p>
                <p>{content.aboutBio2}</p>
                <p>{content.aboutBio3}</p>
              </div>

              {/* Core Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {content.aboutPillars.map((p, i) => (
                  <div key={i} className="glass-card flex items-center gap-3 text-sm sm:text-base text-neutral-900 font-semibold p-4 rounded-2xl border border-white/80 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="#practice-areas"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-900 hover:text-amber-800 group"
                >
                  <span>Explore Practice Disciplines</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

            </div>

          </div>
        </section>

        {/* Section: Practice Areas with Highlighting for Family Court & New Legal Forums */}
        <section id="practice-areas" className="px-4 sm:px-8 lg:px-12 2xl:px-16 py-18 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/50 via-white/90 to-slate-50/70 scroll-section-optimized">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-neutral-600 font-bold text-xs uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full border border-neutral-200 shadow-2xs">
              Court Forums & Specializations
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight">
              Specialized Legal Practice Areas
            </h2>
            <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
              Targeted courtroom advocacy, matrimonial resolution, accident claims, tribunal appeals, and statutory certifications across Kerala Courts.
            </p>
          </div>

          {/* Practice Areas Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {content.practiceAreas.map((area, idx) => {
              const isFamilyCourt = area.id === 'family-law' || area.isMainFocus;
              return (
                <div
                  key={area.id || idx}
                  className={`glass-card rounded-3xl p-6 sm:p-9 flex flex-col justify-between transition-all duration-300 transform-gpu hover:scale-[1.02] hover:shadow-2xl hover:border-amber-400/80 cursor-pointer ${
                    isFamilyCourt
                      ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/98 via-amber-50/45 to-white/95 border-amber-400/80 ring-2 ring-amber-400/25 shadow-xl'
                      : ''
                  }`}
                  onClick={() => setActiveArea(area)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs border ${
                            isFamilyCourt
                              ? 'bg-amber-500/20 text-amber-900 border-amber-400/40'
                              : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                          }`}
                        >
                          {renderIcon(area.iconName)}
                        </div>
                        {isFamilyCourt && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 border border-amber-400/40 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <span>Primary Chamber Focus</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider bg-neutral-100/90 px-3 py-1 rounded-lg border border-neutral-200">
                        {area.courtForum}
                      </span>
                    </div>

                    <h3
                      className={`font-serif font-bold text-neutral-900 mb-3 ${
                        isFamilyCourt ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                      }`}
                    >
                      {area.title}
                    </h3>

                    <p className="text-neutral-700 leading-relaxed mb-6 text-sm sm:text-base font-normal">
                      {area.summary}
                    </p>

                    <div className="border-t border-neutral-200/80 pt-4 space-y-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Key Legal Proceedings:</p>
                      <ul className="text-sm text-neutral-800 space-y-2 font-medium">
                        {area.points.slice(0, 4).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isFamilyCourt ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-neutral-200/80 flex items-center justify-between text-sm">
                    <button
                      onClick={() => setActiveArea(area)}
                      className="font-bold uppercase tracking-wider text-neutral-900 hover:text-amber-800 text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span>Procedural Scope</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://wa.me/${content.whatsappNumber}?text=Hello%20${encodeURIComponent(
                        content.clientName
                      )},%20I%20need%20legal%20guidance%20on%20${encodeURIComponent(area.title)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 text-emerald-700 hover:text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 transition-colors shadow-2xs flex items-center gap-1.5 font-bold text-xs"
                      title="WhatsApp Query"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Query</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Online Consultation Session (Direct WhatsApp Call & Consultation) */}
        <section
          id="online-consultation"
          className="px-4 sm:px-8 lg:px-12 2xl:px-16 py-18 sm:py-24 border-b border-white/70 bg-gradient-to-b from-emerald-50/30 via-white/90 to-slate-50/70 scroll-section-optimized"
        >
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-emerald-950 font-bold text-xs uppercase tracking-widest bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-2xs inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Direct Remote Legal Consultation</span>
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight">
              Online Legal Consultation & Case Review
            </h2>
            <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
              Consult directly with Advocate C.T. Sasi Chengaroor via confidential WhatsApp Voice or Video Call from anywhere in India or abroad.
              Tap below to connect directly on WhatsApp to coordinate your appointment slot and consultation arrangements.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Guidance & Direct Call Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-emerald-50/70 via-white/90 to-amber-50/40 text-slate-900 relative overflow-hidden shiny-border-lg shiny-top-sheen shadow-sm">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-bold uppercase tracking-wider border border-emerald-300">
                    <span>How It Works</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Direct Call Available</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-2xl border border-emerald-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Direct WhatsApp Calling & Chat</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Connect directly with Advocate C.T. Sasi Chengaroor via WhatsApp Call or message to initiate your consultation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-2xl border border-emerald-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Case Discussion & Document Sharing</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Share your court summons, case facts, deeds, or specific legal questions directly in the chat for preliminary review.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/80 rounded-2xl border border-emerald-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Direct Coordination & Setup</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        All consultation scheduling, payment setup, and video/voice link arrangements take place directly outside the website with the advocate.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-6">
                  <a
                    href={onlineConsultationWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Connect on WhatsApp Call</span>
                  </a>
                </div>
              </div>

              {/* Direct Telephone Support */}
              <div className="p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-xs flex items-center justify-between text-xs sm:text-sm shiny-border">
                <div>
                  <p className="font-bold text-slate-900">Prefer a direct telephone call?</p>
                  <p className="text-slate-600">Contact chambers desk directly</p>
                </div>
                <a
                  href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                  className="px-3.5 py-2 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {content.mobile}</span>
                </a>
              </div>

              {/* Google Pay (GPay) Official Number Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/40 border border-blue-200/90 shadow-xs space-y-3 shiny-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-[11px] shadow-2xs">
                      GPay
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">Google Pay (GPay) / UPI Number</p>
                      <p className="text-[11px] text-slate-500">Official Advocate Chamber Account</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-200/80 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Google Pay Number</div>
                        <span className="font-mono font-bold text-slate-900 text-sm sm:text-base select-all tracking-wider">
                          {content.gpayNumber || '9497100509'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(content.gpayNumber || '9497100509');
                        showToast('Google Pay (GPay) number copied to clipboard!');
                      }}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Copy Google Pay Number"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Direct UPI ID</div>
                        <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm select-all">
                          {content.upiId || 'adv.ctsasi-1@okaxis'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(content.upiId || 'adv.ctsasi-1@okaxis');
                          showToast('UPI ID copied to clipboard!');
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                      <a
                        href={`upi://pay?pa=${encodeURIComponent(content.upiId || 'adv.ctsasi-1@okaxis')}&pn=${encodeURIComponent(content.clientName)}&cu=INR`}
                        className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        title="Open in UPI App (GPay, PhonePe, Paytm)"
                      >
                        <span>Pay</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Case Brief Booking Form (Dispatches directly to WhatsApp) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl p-5 sm:p-8 bg-white/95 relative shiny-border-lg shiny-top-sheen shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-neutral-200 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                      Remote Consultation Scheduling
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950 mt-2">
                      Submit Your Case Brief for Consultation
                    </h3>
                  </div>
                </div>

                {consultationSuccessData ? (
                  <div className="space-y-6 text-center py-6 animate-in fade-in duration-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-serif text-2xl font-bold text-neutral-950">
                        Consultation Details Ready!
                      </h4>
                      <p className="text-sm text-neutral-700 max-w-md mx-auto">
                        Your consultation brief has been generated. Tap below to send it directly to Advocate C.T. Sasi Chengaroor on WhatsApp.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 max-w-md mx-auto text-left text-xs sm:text-sm space-y-2">
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500 font-semibold">Client Name:</span>
                        <span className="font-bold text-neutral-900">{consultationSuccessData.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500 font-semibold">Mobile:</span>
                        <span className="font-mono font-bold text-neutral-900">{consultationSuccessData.phone}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500 font-semibold">Matter:</span>
                        <span className="font-bold text-neutral-900">{consultationSuccessData.matterCategory}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500 font-semibold">Preferred Slot:</span>
                        <span className="font-bold text-neutral-900">{consultationSuccessData.slot}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500 font-semibold">GPay Number:</span>
                        <span className="font-mono font-bold text-blue-700">{content.gpayNumber || '9497100509'}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-neutral-500 font-semibold">UPI ID:</span>
                        <span className="font-mono font-bold text-emerald-700">{content.upiId || 'adv.ctsasi-1@okaxis'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <a
                        href={onlineConsultationWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp Directly</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setConsultationSuccessData(null)}
                        className="px-5 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                      >
                        Send Another Brief
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOnlineConsultationSubmit} className="space-y-4">
                    {/* Instant WhatsApp Call Option */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-emerald-950">Quick Option: Instant WhatsApp Call</p>
                        <p className="text-[11px] text-emerald-800">Skip the form and call the advocate directly on WhatsApp</p>
                      </div>
                      <a
                        href={onlineConsultationWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Call on WhatsApp</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                          Full Legal Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={consultationForm.name}
                          onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })}
                          placeholder="e.g. Adv. K. Mohanan / Smt. Lekshmi"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                          Contact Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={consultationForm.phone}
                          onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                          placeholder="+91 9497100509"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                          WhatsApp Number for Call / Video Link *
                        </label>
                        <input
                          type="tel"
                          required
                          value={consultationForm.whatsapp}
                          onChange={(e) => setConsultationForm({ ...consultationForm, whatsapp: e.target.value })}
                          placeholder="WhatsApp number"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                          Case / Matter Category *
                        </label>
                        <select
                          value={consultationForm.matterCategory}
                          onChange={(e) =>
                            setConsultationForm({ ...consultationForm, matterCategory: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Family Court & Matrimonial Law">Family Court & Matrimonial (Primary Focus)</option>
                          <option value="Criminal Cases, Bail & Sessions Trials">Criminal Cases, Bail & Sessions Trials</option>
                          <option value="MACT (Motor Accident Claims)">MACT (Motor Accident Claims)</option>
                          <option value="High Court Cases & Writs">High Court Cases & Writs</option>
                          <option value="Administrative Tribunals (CAT / KAT)">Administrative Tribunals (CAT / KAT)</option>
                          <option value="Arbitration & Commercial ADR">Arbitration & Commercial Disputes</option>
                          <option value="Cooperative Tribunal & Societies Cases">Cooperative Tribunal & Societies</option>
                          <option value="Lok Ayukta & Anti-Corruption">Lok Ayukta & Anti-Corruption</option>
                          <option value="Civil Litigation & Land Disputes">Civil Litigation & Land Disputes</option>
                          <option value="Notary Public & Statutory Certification">Notary Public & Certification</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                          Preferred Consultation Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={consultationForm.preferredDate}
                          onChange={(e) =>
                            setConsultationForm({ ...consultationForm, preferredDate: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                          Preferred Time Window *
                        </label>
                        <select
                          value={consultationForm.preferredTime}
                          onChange={(e) =>
                            setConsultationForm({ ...consultationForm, preferredTime: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="09:00 AM - 10:30 AM (Morning Session)">09:00 AM - 10:30 AM (Morning Session)</option>
                          <option value="03:00 PM - 08:00 PM (Afternoon & Evening Chamber)">03:00 PM - 08:00 PM (Afternoon & Evening Chamber)</option>
                          <option value="03:00 PM - 05:30 PM (Afternoon Session)">03:00 PM - 05:30 PM (Afternoon Session)</option>
                          <option value="05:30 PM - 08:00 PM (Evening Chamber)">05:30 PM - 08:00 PM (Evening Chamber)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                        Brief Summary of Matter *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={consultationForm.summary}
                        onChange={(e) => setConsultationForm({ ...consultationForm, summary: e.target.value })}
                        placeholder="Please summarize key facts, court summons, or specific legal questions..."
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all group border border-emerald-600"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                      <span>Dispatch Case Brief to WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Professional Record / Highlights */}
        <section id="highlights" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/60 via-white/90 to-amber-50/40 scroll-section-optimized">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-neutral-600 font-bold text-xs tracking-widest uppercase bg-white/80 px-3.5 py-1 rounded-full border border-neutral-200">
              Judicial Record
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight">
              Court Highlights & Specialization
            </h2>
            <p className="text-neutral-700 text-base sm:text-lg leading-relaxed">
              Decades of active courtroom appearance across the District Judiciary of Thiruvananthapuram and Chengaroor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {content.highlights.map((hl) => (
              <div key={hl.id} className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-4xl sm:text-5xl font-bold text-neutral-950">{hl.metric}</span>
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-2xs">
                      <Gavel className="w-5 h-5 text-amber-700" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950 mb-3">{hl.title}</h3>
                  <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mb-6">{hl.description}</p>
                </div>
                <div className="pt-4 border-t border-neutral-200/80 text-xs sm:text-sm text-neutral-600 space-y-1.5 font-semibold">
                  {hl.subtext.map((sub, i) => (
                    <p key={i}>· {sub}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Reassuring Callout Bar with Translucent Glass */}
          <div className="mt-12 sm:mt-16 p-8 sm:p-10 glass-card border border-white/90 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1.5 text-center lg:text-left">
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950">
                Facing an urgent court summons, family dispute, or accident claim?
              </h4>
              <p className="text-sm sm:text-base text-neutral-700">
                Early procedural counsel decisively protects your legal position before District Courts.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#contact"
                className="px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors whitespace-nowrap shadow-xs"
              >
                Book Chamber Appointment
              </a>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Section: Chambers & Court Practice Gallery (Auto-Sliding Slideshow) */}
        <section id="gallery" className="px-4 sm:px-10 lg:px-14 2xl:px-18 py-16 sm:py-24 border-b border-white/70 bg-gradient-to-b from-amber-50/35 via-white/85 to-slate-50/60 scroll-section-optimized">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
            <div className="space-y-2">
              <span className="text-neutral-600 font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Chambers Visual Tour</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 tracking-tight">
                Chambers & Practice Gallery
              </h2>
              <p className="text-neutral-700 text-sm sm:text-base max-w-xl leading-relaxed">
                A glimpse inside The Dominant Law Chambers, our extensive law library, consultation suites, and judicial advocacy environment in Vanchiyoor, Thiruvananthapuram.
              </p>
            </div>

            {/* Slideshow Control Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsSlidePaused(!isSlidePaused)}
                className="px-3.5 py-2.5 glass-card hover:bg-white text-neutral-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-colors"
                title={isSlidePaused ? 'Resume Auto-Slide' : 'Pause Auto-Slide'}
              >
                {isSlidePaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                <span>{isSlidePaused ? 'Resume' : 'Auto-Slide'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSlide}
                  className="p-2.5 sm:p-3 glass-card hover:bg-white text-neutral-800 rounded-xl shadow-2xs transition-colors active:scale-95"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="p-2.5 sm:p-3 glass-card hover:bg-white text-neutral-800 rounded-xl shadow-2xs transition-colors active:scale-95"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Slideshow Stage with Mobile Touch Swipe Support */}
          <div
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/80 shadow-2xl group select-none"
            onMouseEnter={() => setIsSlidePaused(true)}
            onMouseLeave={() => setIsSlidePaused(false)}
            onTouchStart={(e) => {
              setIsSlidePaused(true);
              galleryTouchStartX.current = e.touches[0].clientX;
              galleryTouchStartY.current = e.touches[0].clientY;
            }}
            onTouchEnd={(e) => {
              setIsSlidePaused(false);
              if (galleryTouchStartX.current === null) return;
              const diffX = galleryTouchStartX.current - e.changedTouches[0].clientX;
              const diffY = galleryTouchStartY.current ? galleryTouchStartY.current - e.changedTouches[0].clientY : 0;
              // Detect clean horizontal swipe
              if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) handleNextSlide();
                else handlePrevSlide();
              }
              galleryTouchStartX.current = null;
              galleryTouchStartY.current = null;
            }}
          >
            {/* Slide Image Frame: Generous aspect ratio on mobile so photos are large and never cropped */}
            <div className="relative aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[270px] xs:min-h-[320px] sm:min-h-[440px] max-h-[580px] w-full overflow-hidden bg-neutral-950">
              {galleryList.map((item, idx) => (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    decoding="async"
                    className="w-full h-full object-cover object-center transform transition-transform duration-1000 scale-100 group-hover:scale-102"
                  />
                  {/* Subtle lighting gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/25 pointer-events-none" />
                </div>
              ))}

              {/* Floating Top Header on Image (Visible on all viewports) */}
              <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-amber-300 backdrop-blur-md border border-amber-400/30 shadow-xs">
                    {galleryList[currentSlideIndex]?.category || 'Chambers Gallery'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white/95 backdrop-blur-md border border-white/20 shadow-xs">
                    {String(currentSlideIndex + 1).padStart(2, '0')} / {String(galleryList.length).padStart(2, '0')}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedGalleryModal(galleryList[currentSlideIndex])}
                  className="pointer-events-auto p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 shadow-sm transition-all hover:scale-105 active:scale-95"
                  title="View Fullscreen"
                  aria-label="View Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Floating Touch Arrows on Image (Easy 1-tap navigation on mobile, visible on hover for desktop) */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition-all shadow-md active:scale-90 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition-all shadow-md active:scale-90 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Desktop Floating Caption Overlay Card (Kept floating on tablet/desktop) */}
              <div className="hidden sm:block absolute bottom-6 left-6 max-w-xl z-20">
                <div className="glass-card p-6 rounded-2xl border border-white/90 shadow-2xl text-neutral-900">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50/80 text-amber-900 border border-amber-200/60">
                      {galleryList[currentSlideIndex]?.category || 'Chambers Gallery'}
                    </span>
                    <span className="text-xs font-mono text-neutral-500 font-semibold">
                      {String(currentSlideIndex + 1).padStart(2, '0')} / {String(galleryList.length).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-2xl font-bold text-neutral-900 leading-snug">
                    {galleryList[currentSlideIndex]?.title}
                  </h3>

                  {galleryList[currentSlideIndex]?.caption && (
                    <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {galleryList[currentSlideIndex]?.caption}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedGalleryModal(galleryList[currentSlideIndex])}
                      className="text-neutral-900 hover:text-amber-700 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Fullscreen</span>
                    </button>

                    <a
                      href="#contact"
                      className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
                    >
                      <span>Visit Chambers &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Dedicated Caption Card: Sits directly under photo so photo is NEVER covered on mobile */}
            <div className="block sm:hidden p-4 xs:p-5 bg-white border-t border-neutral-200/80 text-neutral-900 space-y-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900 leading-snug">
                  {galleryList[currentSlideIndex]?.title}
                </h3>
                {galleryList[currentSlideIndex]?.caption && (
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {galleryList[currentSlideIndex]?.caption}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setSelectedGalleryModal(galleryList[currentSlideIndex])}
                  className="flex-1 py-2 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Fullscreen</span>
                </button>
                <a
                  href="#contact"
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                >
                  <span>Chambers &rarr;</span>
                </a>
              </div>
            </div>

            {/* Interactive Visual Thumbnail Strip with Real Photo Previews */}
            <div className="bg-white/95 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar">
                {galleryList.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`relative shrink-0 rounded-xl overflow-hidden transition-all duration-200 ${
                      idx === currentSlideIndex
                        ? 'ring-2 ring-amber-500 shadow-md scale-105 opacity-100'
                        : 'opacity-60 hover:opacity-90 ring-1 ring-neutral-300/80'
                    }`}
                    title={item.title}
                  >
                    <div className="w-14 h-10 xs:w-16 xs:h-11 sm:w-20 sm:h-13 bg-neutral-900 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {idx === currentSlideIndex && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-neutral-500 font-medium px-2 shrink-0 hidden md:flex items-center gap-1.5">
                <span>Swipe or click arrows to explore</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Why Choose Chambers */}
        <section id="why-choose-us" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/50 via-white/90 to-amber-50/40 scroll-section-optimized">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-neutral-600 font-bold text-xs tracking-widest uppercase bg-white/80 px-3.5 py-1 rounded-full border border-neutral-200">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight">
              Why Choose {content.firmName}
            </h2>
            <p className="text-neutral-700 text-base sm:text-lg leading-relaxed">
              Four fundamental pillars that govern our representation of every brief.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {content.whyChooseUs.map((box) => (
              <div key={box.id} className="glass-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-6 shadow-2xs">
                    {renderIcon(box.iconName)}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950 mb-3">{box.title}</h3>
                  <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">{box.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Chambers Directory & Interactive Consultation Form */}
        <section id="contact" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 bg-gradient-to-b from-amber-50/30 via-white/90 to-slate-100/70 scroll-section-optimized">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-neutral-600 font-bold text-xs tracking-widest uppercase bg-white/80 px-3.5 py-1 rounded-full border border-neutral-200">
              Consultations & Location
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight">
              Schedule Your Legal Consultation
            </h2>
            <p className="text-neutral-700 text-base sm:text-lg leading-relaxed">
              Visit our chambers at Dominant Towers, Vanchiyoor or submit your inquiry for an immediate response.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12">
            
            {/* Left: Chambers Directory & Map */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="glass-card p-8 sm:p-10 rounded-3xl space-y-6">
                
                <div className="border-b border-neutral-200/80 pb-4">
                  <span className="text-xs uppercase font-bold tracking-widest text-neutral-500">Official Chamber</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">{content.firmName}</h3>
                  <p className="text-sm text-neutral-700 font-medium mt-1">{content.clientName} ({content.designation})</p>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-neutral-700">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-neutral-950 font-bold">Chambers Address</p>
                      <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mt-0.5 whitespace-pre-line">
                        {content.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <Phone className="w-5 h-5 text-neutral-900 shrink-0" />
                    <div>
                      <p className="text-neutral-950 font-bold">Office Landline</p>
                      <a href={`tel:${content.landline.replace(/\s+/g, '')}`} className="text-sm sm:text-base text-neutral-900 font-semibold hover:underline">
                        {content.landline}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-neutral-950 font-bold">Mobile & Direct WhatsApp</p>
                      <a href={`tel:${content.mobile.replace(/\s+/g, '')}`} className="text-sm sm:text-base text-emerald-700 font-bold hover:underline block">
                        {content.mobile}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 pt-2 border-t border-neutral-200/80">
                    <Clock className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-neutral-950 font-bold">Chamber & Court Timings</p>
                      <p className="text-sm text-neutral-700">{content.officeHours}</p>
                      <p className="text-sm text-neutral-500 mt-0.5">{content.courtHours}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
                  >
                    Direct WhatsApp
                  </a>
                  <a
                    href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
                  >
                    Call Chambers
                  </a>
                </div>

              </div>

              {/* Google Map Card */}
              <div className="glass-card rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3.5 px-1 text-sm font-semibold">
                  <span className="font-bold text-neutral-950 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-600" /> Chambers at Vanchiyoor
                  </span>
                  <a
                    href="https://maps.google.com/maps?q=8.4938957%2C76.9416295&z=17&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="w-full h-52 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-inner">
                  <iframe
                    title="The Dominant Law Chambers Location Vanchiyoor"
                    src="https://maps.google.com/maps?q=8.4938957,76.9416295&hl=en&z=17&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

            </div>

            {/* Right: Interactive Consultation Request Form */}
            <div className="lg:col-span-7">
              <div className="glass-card p-8 sm:p-12 rounded-3xl">
                <div className="border-b border-neutral-200/80 pb-5 mb-8">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-950">
                    Request Legal Consultation
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-700 mt-1.5">
                    Provide the background of your matter. Information submitted is treated with strict advocate-client privilege.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Anand Kumar"
                        className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-2">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-2">
                        Legal Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                      >
                        {content.practiceAreas.map((a, i) => (
                          <option key={i} value={a.title}>
                            {a.title}
                          </option>
                        ))}
                        <option value="Notary Public Services">Notary Public & Statutory Attestation</option>
                        <option value="Other Legal Matter">Other Legal Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-2">
                      Preferred Consultation Mode *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-300 bg-white cursor-pointer hover:border-neutral-900 transition-all shadow-2xs">
                        <input
                          type="radio"
                          name="consultationMode"
                          checked={formData.mode === 'In-Person at Chambers (Vanchiyoor)'}
                          onChange={() =>
                            setFormData({ ...formData, mode: 'In-Person at Chambers (Vanchiyoor)' })
                          }
                          className="accent-neutral-900 w-4 h-4"
                        />
                        <span className="text-neutral-900 font-semibold">In-Person at Chambers (Vanchiyoor)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-300 bg-white cursor-pointer hover:border-neutral-900 transition-all shadow-2xs">
                        <input
                          type="radio"
                          name="consultationMode"
                          checked={formData.mode === 'WhatsApp / Phone Consultation'}
                          onChange={() =>
                            setFormData({ ...formData, mode: 'WhatsApp / Phone Consultation' })
                          }
                          className="accent-neutral-900 w-4 h-4"
                        />
                        <span className="text-neutral-900 font-semibold">WhatsApp / Telephonic Consultation</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-2">
                      Summary of Legal Matter *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Briefly state court forum, nature of dispute (Family Court, MACT, High Court, Tribunals), or documents ready for notary attestation..."
                      className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Submit via WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyInquiry}
                      className="inline-flex items-center justify-center gap-2 py-4 px-6 glass-card hover:bg-white text-neutral-900 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                      title="Copy inquiry text"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Details</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 text-center pt-2">
                    Submitting connects directly to Advocate Sasi's chamber WhatsApp at{' '}
                    <span className="font-bold text-neutral-900">{content.mobile}</span>.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </section>

        {/* Clean Institutional Footer (Zero /getinsideadmin mention) */}
        <footer className="bg-neutral-950 text-neutral-300 px-6 sm:px-10 lg:px-14 2xl:px-18 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3.5">
                {content.images.logo ? (
                  <img src={content.images.logo} alt="Chamber Logo" className="h-10 w-auto object-contain rounded" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400">
                    <Scale className="w-6 h-6" />
                  </div>
                )}
                <span className="font-heading text-xl sm:text-2xl font-bold text-white tracking-wide">{content.firmName}</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
                Chambers of <strong className="text-white">{content.clientName}</strong> ({content.designation}). Dedicated legal advocacy across the District Judiciary of Kerala.
              </p>
              <div className="text-sm text-neutral-400">
                <p>{content.address}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Navigation</p>
              <ul className="text-sm space-y-2.5 text-neutral-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Counsel</a></li>
                <li><a href="#practice-areas" className="hover:text-white transition-colors">Practice Disciplines</a></li>
                <li><a href="#highlights" className="hover:text-white transition-colors">Court Record</a></li>
                <li><a href="#gallery" className="hover:text-white transition-colors">Chambers Gallery</a></li>
                <li><a href="#why-choose-us" className="hover:text-white transition-colors">Why Choose Us</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Chambers Contact</p>
              <div className="text-sm text-neutral-400 space-y-2">
                <p>Office: {content.landline}</p>
                <p>Mobile: {content.mobile}</p>
                <p>Vanchiyoor P.O, Thiruvananthapuram</p>
              </div>
            </div>
          </div>

          {/* Bar Council Compliance Notice & Clean Links */}
          <div className="pt-8 space-y-4">
            <p className="text-xs text-neutral-400 leading-relaxed max-w-5xl">
              <strong className="text-neutral-300">Notice:</strong> As per the rules of the Bar Council of India, advocates are prohibited from soliciting work or advertising. This website is meant solely for informational purposes to provide details regarding Advocate C.T. Sasi Chengaroor and The Dominant Law Chambers upon specific user request.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-neutral-500 pt-3 border-t border-neutral-900">
              <p>&copy; {new Date().getFullYear()} {content.firmName}. Advocate C.T. Sasi Chengaroor.</p>
              <button
                onClick={() => setShowCodeModal(true)}
                className="hover:text-neutral-300 flex items-center gap-1.5 transition-colors text-xs"
              >
                <Code className="w-3.5 h-3.5" /> Standalone Single HTML
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Mobile Fixed Quick-Action Bottom Bar (Sticky at bottom for mobile with safe-area support) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 border-t border-slate-200/90 px-3 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-xl flex items-center justify-around gap-2">
        <a
          href={`tel:${content.mobile.replace(/\s+/g, '')}`}
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 bg-slate-900 active:bg-slate-800 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-emerald-400 mb-0.5" />
          <span>Call Desk</span>
        </a>
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 bg-emerald-600 active:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-transform"
        >
          <MessageSquare className="w-4 h-4 text-white mb-0.5" />
          <span>WhatsApp</span>
        </a>
        <a
          href={onlineConsultationWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 bg-emerald-700 active:bg-emerald-600 text-white rounded-xl text-[11px] font-extrabold shadow-xs active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-emerald-200 mb-0.5" />
          <span>Online Consult</span>
        </a>
      </div>

      {/* Floating WhatsApp Action Button (Desktop Only) */}
      <aside aria-label="Direct WhatsApp Contact" className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center group">
        <div className="mr-3 bg-neutral-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl border border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Chat with Advocate Sasi
        </div>
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Direct WhatsApp with ${content.clientName}`}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <MessageSquare className="w-7 h-7" />
        </a>
      </aside>

      {/* Practice Area Detail Modal */}
      {activeArea && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveArea(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-lg"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                {renderIcon(activeArea.iconName)}
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-neutral-950">{activeArea.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-semibold">{activeArea.courtForum}</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mb-4">{activeArea.summary}</p>

            <div className="space-y-4 text-sm text-neutral-700">
              <div>
                <p className="font-bold text-neutral-950 mb-2 uppercase tracking-wider text-xs">
                  Procedural Scope & Actions
                </p>
                <ul className="space-y-2 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                  {activeArea.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-neutral-850 font-medium">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-neutral-950 mb-2 uppercase tracking-wider text-xs">
                  Recommended Documents for Consultation
                </p>
                <ul className="space-y-2 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                  {activeArea.documentsNeeded.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-neutral-850">
                      <FileText className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0" />
                      <span className="font-medium">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 flex gap-3">
              <a
                href={`https://wa.me/${content.whatsappNumber}?text=Hello%20${encodeURIComponent(
                  content.clientName
                )},%20I%20wish%20to%20consult%20regarding%20${encodeURIComponent(activeArea.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-4 text-center text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
              >
                Consult on WhatsApp
              </a>
              <button
                onClick={() => setActiveArea(null)}
                className="px-5 py-3.5 text-xs sm:text-sm font-bold border border-neutral-300 rounded-xl hover:bg-neutral-50 text-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Gallery Modal with Swipe and Navigation */}
      {selectedGalleryModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setSelectedGalleryModal(null)}
          onTouchStart={(e) => {
            modalTouchStartX.current = e.touches[0].clientX;
            modalTouchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            if (modalTouchStartX.current === null) return;
            const diffX = modalTouchStartX.current - e.changedTouches[0].clientX;
            const diffY = modalTouchStartY.current ? modalTouchStartY.current - e.changedTouches[0].clientY : 0;
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
              if (diffX > 0) handleModalNext();
              else handleModalPrev();
            }
            modalTouchStartX.current = null;
            modalTouchStartY.current = null;
          }}
        >
          <div
            className="max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Control Bar */}
            <div className="px-4 py-3 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {selectedGalleryModal.category || 'Chambers Gallery'}
                </span>
                <span className="text-xs font-mono text-neutral-400 font-semibold">
                  {galleryList.findIndex((it) => it.id === selectedGalleryModal.id) + 1} / {galleryList.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleModalPrev}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleModalNext}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                  title="Next Photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedGalleryModal(null)}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors ml-1"
                  aria-label="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Main Photo with On-Image Navigation Arrows */}
            <div className="relative flex-1 min-h-[220px] max-h-[62vh] sm:max-h-[68vh] w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedGalleryModal.url}
                alt={selectedGalleryModal.title}
                className="w-full h-full object-contain"
              />

              {/* Prev / Next Floating Arrows on image */}
              <button
                onClick={handleModalPrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all shadow-lg active:scale-90"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={handleModalNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all shadow-lg active:scale-90"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Footer Caption & Direct Contact */}
            <div className="p-4 sm:p-5 bg-neutral-900 border-t border-neutral-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="space-y-0.5 max-w-xl">
                <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedGalleryModal.title}
                </h4>
                {selectedGalleryModal.caption && (
                  <p className="text-xs text-neutral-400 line-clamp-2">{selectedGalleryModal.caption}</p>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Inquiry</span>
                </a>
                <button
                  onClick={() => setSelectedGalleryModal(null)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Single HTML File Exporter Modal */}
      {showCodeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Code className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-xl font-bold text-white">Standalone Single HTML File</h3>
            </div>
            <p className="text-xs text-neutral-300 mb-4">
              Self-contained single-page responsive portfolio with HTML5, Tailwind CSS via CDN, FontAwesome icons, and Vanilla JavaScript.
            </p>

            <div className="flex-1 bg-neutral-950 rounded-2xl p-4 border border-neutral-800 overflow-y-auto font-mono text-xs text-neutral-300 space-y-2 mb-4">
              <p className="text-emerald-400"># Ready-to-run Single File: /public/standalone_portfolio.html</p>
              <p>You can download or open the standalone file directly in your browser without any build tools.</p>
              <div className="pt-2 text-neutral-400 space-y-1">
                <p>✓ Complete HTML5 semantic structure</p>
                <p>✓ Tailwind CSS CDN loaded</p>
                <p>✓ FontAwesome 6 icons</p>
                <p>✓ Google Fonts (Playfair Display & Inter)</p>
                <p>✓ Full client details, WhatsApp integration & Vanilla JS</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800">
              <a
                href="/standalone_portfolio.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-xl"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Standalone HTML
              </a>
              <a
                href="/standalone_portfolio.html"
                download="advocate_c_t_sasi_portfolio.html"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl border border-neutral-700"
              >
                <Download className="w-3.5 h-3.5" /> Download HTML File
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal (Triggered via /getinsideadmin URL or keystroke) */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setShowLoginModal(false);
          setShowAdminPanel(true);
          showToast('Master Access Verified. Welcome to Chamber Management.');
        }}
      />

      {/* Admin Backside Content, Logo, Favicon & Gallery Manager */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        content={content}
        onSaveContent={handleSaveContent}
        onResetDefaults={handleResetDefaults}
        onUpdatePassword={handleUpdatePassword}
        onLogout={handleAdminLogout}
      />
    </div>
  );
}
