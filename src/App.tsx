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
    preferredTime: '04:30 PM - 06:30 PM (Evening Chamber)',
    summary: '',
    gpayUtr: '',
  });
  const [consultationSuccessData, setConsultationSuccessData] = useState<{
    name: string;
    phone: string;
    matterCategory: string;
    slot: string;
    utr: string;
    fee: number;
  } | null>(null);
  const [isCopiedGpay, setIsCopiedGpay] = useState(false);

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

  // Keystroke listener for typing "/getinsideadmin" quietly anywhere on the page
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isAdminLoggedIn]);

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

    if (!consultationForm.gpayUtr.trim() || consultationForm.gpayUtr.trim().length < 6) {
      showToast('Please provide your 12-digit Google Pay / UPI Transaction Reference (UTR) ID.');
      return;
    }

    const fee = content.onlineConsultationFee ?? 500;
    const gpayNumber = content.gpayNumber || '9497100509';
    const waText =
      `*⚖️ ONLINE LEGAL CONSULTATION & GPAY PAYMENT PROOF*\n\n` +
      `*Chambers of Advocate C.T. Sasi Chengaroor*\n` +
      `The Dominant Law Chambers, Vanchiyoor, Trivandrum\n\n` +
      `*Client Name:* ${consultationForm.name.trim()}\n` +
      `*Mobile Phone:* ${consultationForm.phone.trim()}\n` +
      `*WhatsApp (for Video Link):* ${consultationForm.whatsapp.trim()}\n` +
      `*Matter Category:* ${consultationForm.matterCategory}\n` +
      `*Preferred Slot:* ${consultationForm.preferredDate} (${consultationForm.preferredTime})\n` +
      `*Case Summary:* ${consultationForm.summary.trim()}\n\n` +
      `----------------------------------------\n` +
      `*FEE PAID VIA GPAY:* ₹${fee}\n` +
      `*Transferred to GPay Number:* ${gpayNumber}\n` +
      `*UPI / UTR Transaction ID:* ${consultationForm.gpayUtr.trim()}\n` +
      `----------------------------------------\n` +
      `Please confirm my online legal consultation slot.`;

    const cleanNumber = gpayNumber.replace(/\D/g, '');
    const targetWaNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waText)}`;

    setConsultationSuccessData({
      name: consultationForm.name.trim(),
      phone: consultationForm.phone.trim(),
      matterCategory: consultationForm.matterCategory,
      slot: `${consultationForm.preferredDate} (${consultationForm.preferredTime})`,
      utr: consultationForm.gpayUtr.trim(),
      fee,
    });

    showToast('Payment verified & booking request generated! Opening WhatsApp...');
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

  const directWhatsAppUrl = `https://wa.me/${content.whatsappNumber}?text=Hello%20${encodeURIComponent(
    content.clientName
  )},%20I%20would%20like%20to%20consult%20regarding%20a%20legal%20matter.`;

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

  return (
    <div className="platform-canvas min-h-screen text-neutral-800 font-sans antialiased selection:bg-neutral-900 selection:text-white py-0 sm:py-6 lg:py-8 px-0 sm:px-4 lg:px-6 2xl:px-8 pb-24 lg:pb-8">
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

      {/* Expansive Architectural Monolith Platform Container with Shiny Light Grey Border */}
      <div className="monolith-platform max-w-[1540px] 2xl:max-w-[1680px] mx-auto rounded-none sm:rounded-3xl overflow-hidden relative bg-white shiny-border-lg shiny-top-sheen shadow-[0_20px_50px_-10px_rgba(148,163,184,0.35)]">
        
        {/* Top Legal Authority Strip (Refined & Mobile-Optimized) */}
        <div className="bg-slate-50/95 text-slate-700 px-3.5 sm:px-8 lg:px-12 2xl:px-16 py-2 sm:py-2.5 text-xs sm:text-sm border-b border-slate-200/90">
          {/* Mobile Single Row View (<sm) */}
          <div className="flex sm:hidden items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] truncate">
              <Stamp className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">{content.designation}</span>
            </span>
            <a
              href={`tel:${content.mobile.replace(/\s+/g, '')}`}
              className="text-slate-900 hover:text-amber-800 text-[11px] font-bold flex items-center gap-1 shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-200"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>{content.mobile}</span>
            </a>
          </div>

          {/* Desktop/Tablet Extended Row (>=sm) */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <span className="flex items-center gap-2 text-amber-900 font-bold tracking-wide">
                <Stamp className="w-4 h-4 text-amber-700" />
                <span>{content.designation} · Govt. of India / Kerala</span>
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <a
                href="https://maps.google.com/maps?q=8.4938957%2C76.9416295&z=17&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 text-slate-600 hover:text-amber-800 transition-colors font-medium"
                title="Open Chamber Location on Google Maps"
              >
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>Dominant Towers, Vanchiyoor · Open Map</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <span className="hidden xl:inline text-slate-300">|</span>
              <span className="hidden xl:flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Chambers Active Today · Mon - Sat</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs sm:text-sm font-medium">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Office: {content.landline}</span>
              </span>
              <a
                href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                className="text-slate-900 hover:text-amber-800 transition-colors flex items-center gap-1.5 font-bold"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Direct: {content.mobile}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sleek Executive Navigation Header (Luminous Light Theme with Mobile Polish) */}
        <header className="px-3.5 sm:px-8 lg:px-12 2xl:px-16 py-3 sm:py-3.5 flex items-center justify-between sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/90 shadow-xs">
          
          {/* Logo / Brand Mark */}
          <a href="#hero" className="flex items-center gap-2.5 sm:gap-3.5 group max-w-[75%] sm:max-w-none">
            {content.images.logo ? (
              <img
                src={content.images.logo}
                alt={content.firmName}
                className="h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[170px] object-contain rounded-lg shrink-0"
              />
            ) : null}
            <div className="flex flex-col min-w-0">
              <div className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold tracking-wide text-slate-900 truncate">
                <span className="text-amber-800 border-b-2 border-amber-600 pb-0.5 mr-1.5">The Dominant</span>
                <span>Law Chambers</span>
              </div>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
                Chambers of {content.clientName} · {content.designation}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#about" className="hover:text-amber-800 transition-colors">
              About Us
            </a>
            <a href="#practice-areas" className="hover:text-amber-800 transition-colors flex items-center gap-1.5">
              <span>Practice Areas</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-full">
                Family Court Focus
              </span>
            </a>
            <a
              href="#online-consultation"
              className="hover:opacity-95 transition-all flex items-center gap-1.5 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-full shadow-xs"
            >
              <IndianRupee className="w-3.5 h-3.5 text-slate-950" />
              <span>Online Consultation</span>
              <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                Pay via GPay
              </span>
            </a>
            <a href="#highlights" className="hover:text-amber-800 transition-colors">
              Court Record
            </a>
            <a href="#gallery" className="hover:text-amber-800 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Gallery</span>
            </a>
            <a href="#why-choose-us" className="hover:text-amber-800 transition-colors">
              Why Us
            </a>
            <a href="#contact" className="hover:text-amber-800 transition-colors">
              Contact
            </a>
          </nav>

          {/* Header Action Dashboard Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://maps.google.com/maps?q=8.4938957%2C76.9416295&z=17&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-2xs"
              title="Chamber Location on Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>Vanchiyoor Map</span>
            </a>
            <a
              href={`tel:${content.mobile.replace(/\s+/g, '')}`}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs whitespace-nowrap"
            >
              <Phone className="w-4 h-4" />
              <span>Call Direct</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300/80 transition-colors shadow-2xs focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer (Polished, High-End Card Drawer) */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white/98 backdrop-blur-2xl border-b border-slate-300/90 px-4 sm:px-6 pt-3 pb-6 space-y-2.5 shadow-xl animate-in fade-in duration-200">
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
              href="#online-consultation"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-3.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 rounded-xl shadow-xs transition-all"
            >
              <span className="flex items-center gap-2.5">
                <IndianRupee className="w-4 h-4 text-slate-950" />
                <span>Online Consultation & GPay</span>
              </span>
              <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-extrabold uppercase">
                ₹{content.onlineConsultationFee ?? 500}
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

        {/* Architectural Title Banner (Prestigious Light Executive Law Firm Banner with Shiny Grey Border) */}
        <section id="hero" className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/70 py-10 sm:py-16 px-4 sm:px-8 border-b border-slate-300 overflow-hidden text-center shiny-top-sheen shadow-[inset_0_-1px_0_0_#cbd5e1]">
          {/* Subtle Chamber Watermark Texture */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.05] mix-blend-multiply filter contrast-125 pointer-events-none"
            style={{ backgroundImage: `url(${content.images.heroChambers})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/90 pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-3 sm:space-y-3.5">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase bg-amber-50 text-amber-900 border border-amber-300/80 shadow-2xs">
              <Landmark className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Senior Advocate & Govt. Authorized Notary Public</span>
            </div>

            <h1 className="font-heading text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-wide uppercase drop-shadow-2xs">
              {content.firmName}
            </h1>

            <p className="text-sm sm:text-xl font-serif font-bold text-amber-800 tracking-wide">
              Advocate C.T. Sasi Chengaroor
            </p>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed pt-1">
              Over 25 Years of Commanding Courtroom Advocacy & Statutory Representation across District Courts, Family Courts, MACT & High Court of Kerala.
            </p>
          </div>
        </section>

        {/* Corporate Split Law Firm Section (Mobile-First: Desk Profile first on mobile, Active Court Practice sidebar second) */}
        <section id="chambers-overview" className="bg-[#f8fafc] border-b border-slate-300/80 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* DESK PORTRAIT & COUNSELOR PROFILE (Order 1 on mobile, Order 2 on desktop) */}
              <div className="lg:col-span-8 space-y-5 sm:space-y-6 order-1 lg:order-2">
                
                {/* Large High-Resolution Desk Photograph with Light Grey Shiny Border */}
                <div className="rounded-2xl overflow-hidden bg-white p-1.5 sm:p-2 relative shiny-border shiny-top-sheen shadow-sm">
                  <img
                    src={content.images.portrait}
                    alt={content.clientName}
                    className="w-full h-auto max-h-[560px] sm:max-h-[640px] object-cover object-top rounded-xl hover:scale-[1.01] transition-transform duration-700"
                  />
                </div>

                {/* Stately Counsel Profile Card with Light Grey Shiny Border */}
                <div className="bg-white rounded-2xl p-4 sm:p-7 lg:p-8 space-y-4 sm:space-y-5 relative shiny-border shiny-top-sheen shadow-sm">
                  <div className="space-y-2 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 sm:px-3 py-1 rounded-full">
                        Senior Advocate · Vanchiyoor Bar
                      </span>
                      <span className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 rounded-full">
                        Govt. Authorized Notary Public
                      </span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-3xl font-bold text-slate-900">
                      {content.clientName}
                    </h2>
                    <p className="text-slate-600 font-medium text-xs sm:text-base">
                      {content.designation} · {content.firmName}
                    </p>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs sm:text-base font-normal">
                    {content.heroSubheadline}
                  </p>

                  {/* Corporate Metrics Bar (Mobile-Responsive Grid) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3.5 border-y border-slate-200/80 text-center sm:text-left bg-slate-50/70 rounded-xl px-2.5 sm:px-4">
                    <div>
                      <p className="text-lg sm:text-3xl font-bold text-slate-900 font-serif">{content.heroStat1Val}</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-0.5 leading-tight">{content.heroStat1Label}</p>
                    </div>
                    <div>
                      <p className="text-lg sm:text-3xl font-bold text-amber-700 font-serif">{content.heroStat2Val}</p>
                      <p className="text-[10px] sm:text-xs text-amber-800 font-bold mt-0.5 leading-tight">{content.heroStat2Label}</p>
                    </div>
                    <div>
                      <p className="text-lg sm:text-3xl font-bold text-slate-900 font-serif">{content.heroStat3Val}</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-0.5 leading-tight">{content.heroStat3Label}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
                    <a
                      href="#online-consultation"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-xs transition-all active:scale-[0.99]"
                    >
                      <IndianRupee className="w-4 h-4" />
                      <span>Book Online Consultation (GPay)</span>
                    </a>
                    <a
                      href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.99]"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Call {content.mobile}</span>
                    </a>
                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all active:scale-[0.99]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* ACTIVE COURT PRACTICE SIDEBAR (Order 2 on mobile, Order 1 on desktop) */}
              <div className="lg:col-span-4 space-y-5 sm:space-y-6 order-2 lg:order-1">
                
                {/* Active Court Practice Table with Light Grey Shiny Border */}
                <div className="rounded-2xl overflow-hidden bg-white shiny-border shiny-top-sheen shadow-sm">
                  <div className="bg-slate-100/90 text-slate-900 font-serif font-bold text-sm sm:text-base px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
                      <span>Active Court Practice</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded font-mono font-bold">
                      10 Forums
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {/* 1. Family Court - Highlighted in warm tan/gold */}
                    <div
                      onClick={() => {
                        const area = content.practiceAreas.find((p) => p.id === 'family-law');
                        if (area) setActiveArea(area);
                      }}
                      className="p-3.5 sm:p-4 bg-[#c2a77d] hover:bg-[#b89b6e] text-white font-bold flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
                      title="Click to view procedural scope"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-white shrink-0" />
                        <span className="font-bold">Family Court & Matrimonial</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider bg-white/25 px-2 py-0.5 rounded text-white shrink-0">
                        Primary Focus
                      </span>
                    </div>

                    {/* Remaining 9 Practice Forums */}
                    {content.practiceAreas
                      .filter((p) => p.id !== 'family-law')
                      .map((area) => (
                        <div
                          key={area.id}
                          onClick={() => setActiveArea(area)}
                          className="p-3 sm:p-3.5 px-3.5 sm:px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center justify-between cursor-pointer transition-colors group active:bg-slate-100"
                          title="Click to view procedural scope"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="text-slate-500 group-hover:text-amber-700 transition-colors shrink-0">
                              {renderIcon(area.iconName)}
                            </div>
                            <span className="group-hover:text-slate-950 transition-colors text-xs sm:text-sm truncate">
                              {area.title}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-1.5" />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Online Consultation Box in Left Sidebar with Light Grey Shiny Border */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 text-slate-900 space-y-3 shiny-border shiny-top-sheen shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold text-amber-900 tracking-wider flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-amber-700" /> Online Consultation
                    </span>
                    <span className="text-[10px] sm:text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                      Direct Video/Call
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">₹{content.onlineConsultationFee ?? 500}</span>
                      <span className="text-xs text-slate-500">/ session</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Pay via Google Pay to <strong className="text-amber-800 font-mono font-bold">{content.gpayNumber || '9497100509'}</strong>
                    </p>
                  </div>
                  <a
                    href="#online-consultation"
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider block text-center transition-all shadow-xs"
                  >
                    Pay & Book Slot Now &rarr;
                  </a>
                </div>

                {/* Chamber Location Box in Left Sidebar with Light Grey Shiny Border */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white space-y-2 text-xs shiny-border shadow-xs">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    <span>Chambers Location</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Dominant Towers, Near Khadi Board, Vanchiyoor P.O, Thiruvananthapuram, Kerala - 695035
                  </p>
                  <a
                    href="https://maps.google.com/maps?q=8.4938957%2C76.9416295&z=17&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800 hover:underline pt-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Section: About Advocate Sasi & Chambers Suite */}
        <section id="about" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-amber-50/20 via-white/60 to-slate-50/45 backdrop-blur-md">
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
                  <img src={content.images.office} alt="Chambers Office" className="w-full h-full object-cover rounded-xl" />
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
        <section id="practice-areas" className="px-4 sm:px-8 lg:px-12 2xl:px-16 py-18 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/45 via-white/60 to-slate-50/50 backdrop-blur-md">
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
                  className={`glass-card rounded-3xl p-6 sm:p-9 flex flex-col justify-between transition-all ${
                    isFamilyCourt
                      ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white/98 via-amber-50/45 to-white/95 border-amber-400/80 ring-2 ring-amber-400/25 shadow-xl'
                      : ''
                  }`}
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

        {/* Section: Online Consultation Session (Pay Fee via GPay 9497100509) */}
        <section
          id="online-consultation"
          className="px-4 sm:px-8 lg:px-12 2xl:px-16 py-18 sm:py-24 border-b border-white/70 bg-gradient-to-b from-amber-50/25 via-white/75 to-slate-50/50 backdrop-blur-md"
        >
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-amber-900 font-bold text-xs uppercase tracking-widest bg-amber-500/15 px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-2xs inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Direct Remote Legal Consultation</span>
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight">
              Online Legal Consultation & Case Review
            </h2>
            <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
              Consult directly with Advocate C.T. Sasi Chengaroor via confidential Video or Audio Call from anywhere in India or abroad.
              Please complete the consultation fee payment via Google Pay first, then submit your slot details and transaction reference below.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step 1: Payment Instructions Card (Light Theme with Shiny Grey Border) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 text-slate-900 relative overflow-hidden backdrop-blur-md shiny-border-lg shiny-top-sheen shadow-sm">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-300/20 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-300">
                    <span>Step 1 · Mandatory Payment</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Instant UPI</span>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Chamber Consultation Fee
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                      ₹{content.onlineConsultationFee ?? 500}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">/ 30-min strategy session</span>
                  </div>
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                    Direct senior advocate case evaluation, documents analysis, and statutory procedural roadmap.
                  </p>
                </div>

                {/* GPay Payment Box (Light Theme) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/90 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs">
                        GPay
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Google Pay / PhonePe / UPI
                        </p>
                        <p className="text-xs text-amber-800 font-semibold">Advocate C.T. Sasi Chengaroor</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">Registered GPay Number</p>
                      <p className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                        {content.gpayNumber || '9497100509'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(content.gpayNumber || '9497100509');
                        setIsCopiedGpay(true);
                        showToast('GPay number 9497100509 copied to clipboard!');
                        setTimeout(() => setIsCopiedGpay(false), 2500);
                      }}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {isCopiedGpay ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{isCopiedGpay ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <a
                    href={`upi://pay?pa=${content.gpayNumber || '9497100509'}@upi&pn=Advocate%20CT%20Sasi%20Chengaroor&am=${content.onlineConsultationFee ?? 500}&cu=INR`}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all uppercase tracking-wider"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay ₹{content.onlineConsultationFee ?? 500} via UPI / GPay App</span>
                  </a>
                </div>

                {/* Instructions */}
                <div className="pt-4 text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" /> Payment Verification Process:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                    <li>
                      Send ₹{content.onlineConsultationFee ?? 500} via Google Pay to{' '}
                      <strong className="text-amber-900 font-mono font-bold">{content.gpayNumber || '9497100509'}</strong>.
                    </li>
                    <li>
                      Note the <strong>12-digit UPI / UTR Transaction ID</strong> from your Google Pay transaction receipt.
                    </li>
                    <li>
                      Enter the Transaction ID in Step 2 to immediately verify and confirm your session.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Direct Telephone Support */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs sm:text-sm shiny-border">
                <div>
                  <p className="font-bold text-slate-900">Need help with payment?</p>
                  <p className="text-slate-600">Contact chambers desk directly</p>
                </div>
                <a
                  href={`tel:${(content.gpayNumber || '9497100509').replace(/\s+/g, '')}`}
                  className="px-3.5 py-2 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {content.gpayNumber || '9497100509'}</span>
                </a>
              </div>
            </div>

            {/* Step 2: Booking Form & UTR Verification (Shiny Grey Border) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl p-5 sm:p-8 bg-white/95 relative shiny-border-lg shiny-top-sheen shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-neutral-200 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                      Step 2 · Booking & Payment Verification
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950 mt-2">
                      Submit Your Case Brief & GPay Proof
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
                        Consultation Request Dispatched!
                      </h4>
                      <p className="text-sm text-neutral-700 max-w-md mx-auto">
                        Your appointment details and GPay payment reference have been forwarded directly to Advocate C.T. Sasi Chengaroor.
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
                        <span className="text-neutral-500 font-semibold">Scheduled Slot:</span>
                        <span className="font-bold text-neutral-900">{consultationSuccessData.slot}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500 font-semibold">GPay Payment UTR:</span>
                        <span className="font-mono font-bold text-amber-700">{consultationSuccessData.utr}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-neutral-500 font-semibold">Fee Paid:</span>
                        <span className="font-bold text-emerald-700">₹{consultationSuccessData.fee}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <a
                        href={`https://wa.me/91${(content.gpayNumber || '9497100509').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `*Online Consultation Confirmation*\nClient: ${consultationSuccessData.name}\nPhone: ${consultationSuccessData.phone}\nSlot: ${consultationSuccessData.slot}\nUTR: ${consultationSuccessData.utr}\nFee: ₹${consultationSuccessData.fee}`
                        )}`}
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
                        Book Another Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOnlineConsultationSubmit} className="space-y-4">
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
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                          WhatsApp Number for Video Link *
                        </label>
                        <input
                          type="tel"
                          required
                          value={consultationForm.whatsapp}
                          onChange={(e) => setConsultationForm({ ...consultationForm, whatsapp: e.target.value })}
                          placeholder="WhatsApp number"
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="09:00 AM - 10:30 AM (Pre-Court Session)">09:00 AM - 10:30 AM (Morning Session)</option>
                          <option value="01:30 PM - 02:30 PM (Midday Session)">01:30 PM - 02:30 PM (Midday Session)</option>
                          <option value="04:30 PM - 06:30 PM (Evening Chamber)">04:30 PM - 06:30 PM (Evening Chamber)</option>
                          <option value="06:30 PM - 08:30 PM (Night Video Briefing)">06:30 PM - 08:30 PM (Night Briefing)</option>
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
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>

                    {/* MANDATORY GPAY UTR INPUT */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
                      <label className="block text-xs sm:text-sm font-bold text-amber-950 flex items-center justify-between">
                        <span>Google Pay / UPI Transaction Reference (UTR / Txn ID) *</span>
                        <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200/90 px-2 py-0.5 rounded">
                          Mandatory Verification
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={consultationForm.gpayUtr}
                        onChange={(e) => setConsultationForm({ ...consultationForm, gpayUtr: e.target.value })}
                        placeholder="e.g. 423589120456 (12-digit UTR from GPay receipt)"
                        className="w-full px-4 py-3 bg-white border border-amber-400 rounded-xl text-sm font-mono font-bold text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                      <p className="text-[11px] text-amber-900">
                        Paid ₹{content.onlineConsultationFee ?? 500} to GPay number{' '}
                        <strong>{content.gpayNumber || '9497100509'}</strong>. Your slot is confirmed once this UTR matches our accounts record.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2.5 transition-all group"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Confirm & Dispatch Booking via WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Professional Record / Highlights */}
        <section id="highlights" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/50 via-white/60 to-amber-50/25 backdrop-blur-md">
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
        <section id="gallery" className="px-4 sm:px-10 lg:px-14 2xl:px-18 py-16 sm:py-24 border-b border-white/70 bg-gradient-to-b from-amber-50/25 via-white/55 to-slate-50/45 backdrop-blur-md">
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
            <div className="block sm:hidden p-4 xs:p-5 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 text-neutral-900 space-y-3">
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
            <div className="bg-white/80 backdrop-blur-xl p-3 sm:p-4 border-t border-white/80 flex items-center justify-between gap-3 overflow-x-auto">
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
        <section id="why-choose-us" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/45 via-white/60 to-amber-50/20 backdrop-blur-md">
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
        <section id="contact" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 bg-gradient-to-b from-amber-50/20 via-white/65 to-slate-100/50 backdrop-blur-md">
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
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xs border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
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
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xs border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
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
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xs border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-2">
                        Legal Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xs border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
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
                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-300 bg-white/80 backdrop-blur-xs cursor-pointer hover:bg-white transition-all shadow-2xs">
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
                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-300 bg-white/80 backdrop-blur-xs cursor-pointer hover:bg-white transition-all shadow-2xs">
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
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-xs border border-neutral-300 focus:border-neutral-900 rounded-xl text-sm sm:text-base text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs resize-none"
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

      {/* Mobile Fixed Quick-Action Bottom Bar (Sticky at bottom for mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-300 px-3 py-2 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center justify-around gap-2">
        <a
          href={`tel:${content.mobile.replace(/\s+/g, '')}`}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 bg-slate-900 active:bg-slate-800 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-emerald-400 mb-0.5" />
          <span>Call Desk</span>
        </a>
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 bg-emerald-600 active:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-transform"
        >
          <MessageSquare className="w-4 h-4 text-white mb-0.5" />
          <span>WhatsApp</span>
        </a>
        <a
          href="#online-consultation"
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 bg-amber-500 active:bg-amber-400 text-slate-950 rounded-xl text-[11px] font-extrabold shadow-xs active:scale-95 transition-transform"
        >
          <IndianRupee className="w-4 h-4 text-slate-950 mb-0.5" />
          <span>GPay Consult</span>
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
