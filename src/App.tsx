/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
const STORAGE_PWD_KEY = 'CHAMBERS_ADMIN_PWD_PLATFORM_V1';
const DEFAULT_PWD = 'Getthrough2435';

export default function App() {
  // Content State persisted to LocalStorage
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONTENT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_CONTENT;
  });

  // Admin Master Password State
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_PWD_KEY) || DEFAULT_PWD;
    } catch {
      return DEFAULT_PWD;
    }
  });

  // Admin UI State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
      if (newContent.galleryImages && newContent.galleryImages.length > 0) {
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

  // Change Master Password
  const handleUpdatePassword = (newPass: string) => {
    setAdminPassword(newPass);
    try {
      localStorage.setItem(STORAGE_PWD_KEY, newPass);
      showToast('Admin password changed successfully!');
    } catch {
      // Ignored
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminPanel(false);
    showToast('Admin logged out.');
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
      case 'Award':
        return <Award className="w-5 h-5 text-neutral-800" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-neutral-800" />;
      default:
        return <Scale className="w-5 h-5 text-neutral-800" />;
    }
  };

  return (
    <div className="platform-canvas min-h-screen text-neutral-800 font-sans antialiased selection:bg-neutral-900 selection:text-white py-0 sm:py-6 lg:py-8 px-0 sm:px-4 lg:px-6 2xl:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-neutral-700 text-xs font-semibold flex items-center gap-2">
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

      {/* Expansive Architectural Monolith Platform Container */}
      <div className="monolith-platform max-w-[1540px] 2xl:max-w-[1680px] mx-auto rounded-none sm:rounded-3xl overflow-hidden relative shadow-[0_32px_80px_-20px_rgba(15,23,42,0.07)]">
        
        {/* Top Legal Authority Strip (Clean & Crisp, NO /getinsideadmin button) */}
        <div className="bg-neutral-900 text-neutral-300 px-6 sm:px-10 lg:px-14 2xl:px-18 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <span className="flex items-center gap-2 text-amber-300 font-semibold tracking-wide">
              <Stamp className="w-3.5 h-3.5 text-amber-400" />
              <span>{content.designation} · Govt. of India / Kerala</span>
            </span>
            <span className="hidden md:inline text-neutral-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-neutral-300 font-normal">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{content.locationFocus}</span>
            </span>
            <span className="hidden xl:inline text-neutral-600">|</span>
            <span className="hidden xl:flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Chambers Active Today · Dominant Towers</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-neutral-300">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Office: {content.landline}</span>
            </span>
            <a
              href={`tel:${content.mobile.replace(/\s+/g, '')}`}
              className="text-white hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct: {content.mobile}</span>
            </a>
          </div>
        </div>

        {/* Translucent Main Navigation Header */}
        <header className="glass-header px-6 sm:px-10 lg:px-14 2xl:px-18 h-20 flex items-center justify-between sticky top-0 z-40">
          
          {/* Logo / Brand Mark */}
          <a href="#hero" className="flex items-center gap-3.5 group">
            {content.images.logo ? (
              <img
                src={content.images.logo}
                alt={content.firmName}
                className="h-11 w-auto max-w-[150px] object-contain rounded"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Scale className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-neutral-900 group-hover:text-amber-800 transition-colors">
                {content.firmName}
              </span>
              <span className="text-[11px] tracking-wider uppercase text-neutral-500 font-semibold">
                {content.clientName}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#about" className="hover:text-neutral-950 transition-colors">
              About
            </a>
            <a href="#practice-areas" className="hover:text-neutral-950 transition-colors">
              Practice Disciplines
            </a>
            <a href="#highlights" className="hover:text-neutral-950 transition-colors">
              Court Record
            </a>
            <a href="#gallery" className="hover:text-neutral-950 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Chambers Gallery</span>
            </a>
            <a href="#why-choose-us" className="hover:text-neutral-950 transition-colors">
              Why Choose Us
            </a>
            <a href="#contact" className="hover:text-neutral-950 transition-colors">
              Chambers & Contact
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-900 bg-white/80 hover:bg-white border border-neutral-300 rounded-xl transition-all shadow-xs"
            >
              <span>Consultation</span>
            </a>
            <a
              href={`tel:${content.mobile.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-neutral-950 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-neutral-200 px-6 pt-3 pb-6 space-y-3 shadow-md">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950 border-b border-neutral-100"
            >
              About Advocate Sasi
            </a>
            <a
              href="#practice-areas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950 border-b border-neutral-100"
            >
              Practice Disciplines
            </a>
            <a
              href="#highlights"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950 border-b border-neutral-100"
            >
              Court Record & Highlights
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950 border-b border-neutral-100"
            >
              Chambers & Court Gallery
            </a>
            <a
              href="#why-choose-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950 border-b border-neutral-100"
            >
              Why Choose Us
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-neutral-800 hover:text-neutral-950 border-b border-neutral-100"
            >
              Chambers & Address
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-neutral-900 rounded-xl"
              >
                <Phone className="w-3.5 h-3.5" /> Call: {content.mobile}
              </a>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 rounded-xl"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Direct WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Hero Section: Majestic Dual-Column Layout with Grand Desktop Presence */}
        <section id="hero" className="relative px-6 sm:px-10 lg:px-14 2xl:px-18 pt-16 sm:pt-20 pb-20 sm:pb-24 border-b border-white/70 bg-gradient-to-b from-white/75 via-slate-50/50 to-amber-50/20 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center">
            
            {/* Left Hero Narrative */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              <div className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-neutral-800 text-xs font-semibold tracking-wide">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{content.heroBadge}</span>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500 font-normal">Vanchiyoor Court District</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.08] text-balance">
                {content.heroHeadline}
              </h1>

              <div className="h-1.5 w-20 bg-neutral-900 rounded-full" />

              <p className="text-base sm:text-xl text-neutral-600 leading-relaxed max-w-2xl font-normal">
                {content.heroSubheadline}
              </p>

              {/* Statistics Grid with Translucent Glass Panels */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 py-5 border-y border-white/80 max-w-2xl text-left">
                <div className="glass-card p-4 sm:p-5 rounded-2xl">
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">{content.heroStat1Val}</p>
                  <p className="text-xs text-neutral-500 font-medium mt-1">{content.heroStat1Label}</p>
                </div>
                <div className="glass-card p-4 sm:p-5 rounded-2xl">
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">{content.heroStat2Val}</p>
                  <p className="text-xs text-neutral-500 font-medium mt-1">{content.heroStat2Label}</p>
                </div>
                <div className="glass-card p-4 sm:p-5 rounded-2xl">
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">{content.heroStat3Val}</p>
                  <p className="text-xs text-neutral-500 font-medium mt-1">{content.heroStat3Label}</p>
                </div>
              </div>

              {/* CTAs: Clean Black + Emerald Contrast */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-md group"
                >
                  <Calendar className="w-4 h-4 text-neutral-300 group-hover:scale-110 transition-transform" />
                  <span>Schedule Consultation</span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md group"
                >
                  <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Direct WhatsApp Chat</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-500 pt-1 font-medium">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Complete Client Privilege
                </span>
                <span>·</span>
                <span className="flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-amber-600" /> Govt. Appointed Notary Public
                </span>
                <span>·</span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400" /> Vanchiyoor Court District
                </span>
              </div>

            </div>

            {/* Right Hero Image Card: Grand Architectural Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl p-3 glass-card shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-100">
                  <img
                    src={content.images.portrait}
                    alt={content.clientName}
                    className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />

                  {/* Translucent floating badge on image */}
                  <div className="absolute bottom-4 left-4 right-4 glass-card p-5 rounded-2xl shadow-xl border border-white/90">
                    <p className="font-serif text-lg sm:text-xl font-bold text-neutral-900">{content.clientName}</p>
                    <p className="text-xs text-neutral-600 font-semibold mt-0.5">{content.designation}</p>
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                      <span className="font-medium">{content.firmName}</span>
                      <a href="#contact" className="text-neutral-900 hover:text-amber-700 font-bold flex items-center gap-1">
                        <span>Book Slot</span>
                        <span>&rarr;</span>
                      </a>
                    </div>
                  </div>
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
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Chambers Headquarters</span>
                  <h4 className="font-serif text-2xl font-bold text-neutral-900 mt-1">{content.firmName}</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{content.address}</p>
                </div>

                <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 shadow-2xs">
                      <Stamp className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <strong className="text-neutral-900 block font-serif text-sm">Notary Public Authority</strong>
                      <span className="text-neutral-600">Appointed by the Government to execute notarial acts, attest deeds, verify statutory affidavits, and certify declarations.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 shadow-2xs">
                      <Scale className="w-4 h-4 text-neutral-800" />
                    </div>
                    <div>
                      <strong className="text-neutral-900 block font-serif text-sm">District Court Jurisdiction</strong>
                      <span className="text-neutral-600">Practicing regularly across Thiruvananthapuram District Judiciary, CJM, Sub Courts, Munsiff Courts, and Chengaroor.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200 shadow-2xs">
                      <BookOpen className="w-4 h-4 text-neutral-800" />
                    </div>
                    <div>
                      <strong className="text-neutral-900 block font-serif text-sm">Procedural Rigor & Transparency</strong>
                      <span className="text-neutral-600">Delivering practical dispute settlements, unvarnished merit opinions, and resolute courtroom representation.</span>
                    </div>
                  </div>
                </div>

                {/* Office Suite Photo */}
                <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-white/80 relative glass-card p-1 shadow-md">
                  <img src={content.images.office} alt="Chambers Office" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/85 backdrop-blur-sm text-[11px] text-white px-3.5 py-1.5 rounded-xl flex items-center justify-between">
                    <span>Dominant Towers Suite, Vanchiyoor</span>
                    <span className="text-amber-400 font-semibold">Open Mon - Sat</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${content.landline.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-3 px-4 text-xs font-semibold text-neutral-800 bg-white/80 border border-neutral-300 rounded-xl hover:bg-white transition-colors shadow-2xs"
                  >
                    Office: {content.landline}
                  </a>
                  <a
                    href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-3 px-4 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-2xs"
                  >
                    Direct: {content.mobile}
                  </a>
                </div>

              </div>
            </div>

            {/* Right Narrative Profile */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 sm:space-y-8">
              
              <div className="space-y-2">
                <span className="text-neutral-500 font-semibold text-xs tracking-widest uppercase">
                  {content.aboutBadge}
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight text-balance">
                  {content.aboutTitle}
                </h2>
                <p className="text-base font-medium text-neutral-600">{content.aboutSubtitle}</p>
              </div>

              <div className="space-y-5 text-neutral-600 leading-relaxed text-sm sm:text-base font-normal">
                <p>{content.aboutBio1}</p>
                <p>{content.aboutBio2}</p>
                <p>{content.aboutBio3}</p>
              </div>

              {/* Core Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {content.aboutPillars.map((p, i) => (
                  <div key={i} className="glass-card flex items-center gap-3 text-xs sm:text-sm text-neutral-800 font-medium p-3.5 rounded-2xl border border-white/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="#practice-areas"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-amber-800 group"
                >
                  <span>Explore Practice Disciplines</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

            </div>

          </div>
        </section>

        {/* Section: Practice Areas with Asymmetric Editorial Bento Grid */}
        <section id="practice-areas" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/45 via-white/60 to-slate-50/50 backdrop-blur-md">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-neutral-500 font-semibold text-xs tracking-widest uppercase">
              Practice Disciplines
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Specialized Legal Practice Areas
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Targeted courtroom advocacy, dispute settlement, and statutory certifications protecting client rights across Kerala District Courts.
            </p>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {content.practiceAreas.map((area, idx) => {
              // Highlight the first practice area as a marquee Bento Card (2 columns on large screen)
              const isMarquee = idx === 0;
              return (
                <div
                  key={area.id || idx}
                  className={`glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between ${
                    isMarquee ? 'lg:col-span-2 bg-gradient-to-br from-white/95 via-amber-50/20 to-white/90' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-2xs">
                        {renderIcon(area.iconName)}
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        {area.courtForum}
                      </span>
                    </div>

                    <h3 className={`font-serif font-bold text-neutral-900 mb-3 ${isMarquee ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
                      {area.title}
                    </h3>

                    <p className={`text-neutral-600 leading-relaxed mb-6 ${isMarquee ? 'text-sm sm:text-base' : 'text-xs'}`}>
                      {area.summary}
                    </p>
                    
                    <div className="border-t border-neutral-100 pt-4 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Key Proceedings:</p>
                      <ul className="text-xs text-neutral-700 space-y-2">
                        {area.points.slice(0, isMarquee ? 4 : 3).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveArea(area)}
                      className="font-bold uppercase tracking-wider text-neutral-900 hover:text-amber-800 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Procedural Scope</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`https://wa.me/${content.whatsappNumber}?text=Hello%20${encodeURIComponent(
                        content.clientName
                      )},%20I%20need%20legal%20guidance%20on%20${encodeURIComponent(area.title)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 transition-colors shadow-2xs"
                      title="WhatsApp Query"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Professional Record / Highlights */}
        <section id="highlights" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/50 via-white/60 to-amber-50/25 backdrop-blur-md">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-neutral-500 font-semibold text-xs tracking-widest uppercase">
              Judicial Record
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Court Highlights & Specialization
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Decades of active courtroom appearance across the District Judiciary of Thiruvananthapuram and Chengaroor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {content.highlights.map((hl) => (
              <div key={hl.id} className="glass-card rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-4xl sm:text-5xl font-bold text-neutral-900">{hl.metric}</span>
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-2xs">
                      <Gavel className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-neutral-900 mb-3">{hl.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">{hl.description}</p>
                </div>
                <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-500 space-y-1.5 font-medium">
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
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
                Facing an urgent court summons, property conflict, or dispute?
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600">
                Early procedural counsel decisively protects your legal position before District Courts.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#contact"
                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors whitespace-nowrap shadow-xs"
              >
                Book Chamber Appointment
              </a>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Section: Chambers & Court Practice Gallery (Auto-Sliding Slideshow) */}
        <section id="gallery" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-amber-50/25 via-white/55 to-slate-50/45 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
              <span className="text-neutral-500 font-semibold text-xs tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Chambers Visual Tour</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
                Chambers & Practice Gallery
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base max-w-xl leading-relaxed">
                A glimpse inside The Dominant Law Chambers, our extensive law library, consultation suites, and judicial advocacy environment in Vanchiyoor, Thiruvananthapuram.
              </p>
            </div>

            {/* Slideshow Control Buttons */}
            <div className="flex items-center gap-2 self-start md:self-end">
              <button
                onClick={() => setIsSlidePaused(!isSlidePaused)}
                className="px-3.5 py-2.5 glass-card hover:bg-white text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
                title={isSlidePaused ? 'Resume Auto-Slide' : 'Pause Auto-Slide'}
              >
                {isSlidePaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
                <span className="hidden sm:inline">{isSlidePaused ? 'Resume Slideshow' : 'Auto-Sliding'}</span>
              </button>

              <button
                onClick={handlePrevSlide}
                className="p-2.5 glass-card hover:bg-white text-neutral-800 rounded-xl shadow-2xs transition-colors"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextSlide}
                className="p-2.5 glass-card hover:bg-white text-neutral-800 rounded-xl shadow-2xs transition-colors"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Slideshow Stage */}
          <div
            className="relative rounded-3xl overflow-hidden glass-card border border-white/80 shadow-2xl group"
            onMouseEnter={() => setIsSlidePaused(true)}
            onMouseLeave={() => setIsSlidePaused(false)}
          >
            {/* Slide Image Frame */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[580px] w-full overflow-hidden bg-neutral-950">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent" />
                </div>
              ))}

              {/* Floating Caption / Detail Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xl z-20">
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

            {/* Thumbnail Strip / Navigation Indicator Buttons */}
            <div className="bg-white/80 backdrop-blur-xl p-4 border-t border-white/80 flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center gap-2.5">
                {galleryList.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all whitespace-nowrap ${
                      idx === currentSlideIndex
                        ? 'bg-neutral-900 text-white font-bold shadow-xs'
                        : 'glass-card hover:bg-white text-neutral-600'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${idx === currentSlideIndex ? 'bg-amber-400' : 'bg-neutral-400'}`} />
                    <span className="hidden sm:inline">{item.title}</span>
                    <span className="sm:hidden">0{idx + 1}</span>
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-neutral-400 font-medium px-2 shrink-0 hidden md:block">
                Hover to pause slideshow
              </div>
            </div>
          </div>
        </section>

        {/* Section: Why Choose Chambers */}
        <section id="why-choose-us" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 border-b border-white/70 bg-gradient-to-b from-slate-50/45 via-white/60 to-amber-50/20 backdrop-blur-md">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-neutral-500 font-semibold text-xs tracking-widest uppercase">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Why Choose {content.firmName}
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
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
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 mb-3">{box.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{box.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Chambers Directory & Interactive Consultation Form */}
        <section id="contact" className="px-6 sm:px-10 lg:px-14 2xl:px-18 py-20 sm:py-24 bg-gradient-to-b from-amber-50/20 via-white/65 to-slate-100/50 backdrop-blur-md">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-neutral-500 font-semibold text-xs tracking-widest uppercase">
              Consultations & Location
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              Schedule Your Legal Consultation
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Visit our chambers at Dominant Towers, Vanchiyoor or submit your inquiry for an immediate response.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12">
            
            {/* Left: Chambers Directory & Map */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="glass-card p-8 sm:p-10 rounded-3xl space-y-6">
                
                <div className="border-b border-neutral-200/80 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Official Chamber</span>
                  <h3 className="font-serif text-2xl font-bold text-neutral-900 mt-1">{content.firmName}</h3>
                  <p className="text-xs text-neutral-600">{content.clientName} ({content.designation})</p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-neutral-900 font-semibold">Chambers Address</p>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-0.5 whitespace-pre-line">
                        {content.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <Phone className="w-4 h-4 text-neutral-900 shrink-0" />
                    <div>
                      <p className="text-neutral-900 font-semibold">Office Landline</p>
                      <a href={`tel:${content.landline.replace(/\s+/g, '')}`} className="text-xs sm:text-sm text-neutral-800 font-semibold hover:underline">
                        {content.landline}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-neutral-900 font-semibold">Mobile & Direct WhatsApp</p>
                      <a href={`tel:${content.mobile.replace(/\s+/g, '')}`} className="text-xs sm:text-sm text-emerald-700 font-semibold hover:underline block">
                        {content.mobile}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 pt-2 border-t border-neutral-200/80">
                    <Clock className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-neutral-900 font-semibold">Chamber & Court Timings</p>
                      <p className="text-xs text-neutral-600">{content.officeHours}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{content.courtHours}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Direct WhatsApp
                  </a>
                  <a
                    href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Call Chambers
                  </a>
                </div>

              </div>

              {/* Google Map Card */}
              <div className="glass-card rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3.5 px-1 text-xs">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-700" /> Chambers at Vanchiyoor
                  </span>
                  <a
                    href="https://maps.google.com/?q=Near+Khadi+Board+Vanchiyoor+Thiruvananthapuram+Kerala"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-700 hover:text-neutral-950 font-semibold flex items-center gap-1"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
                  <iframe
                    title="Chambers Location Vanchiyoor"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.012586616452!2d76.942005!3d8.4975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05bb9910d54035%3A0x72d17466ad504543!2sVanchiyoor%2C%20Thiruvananthapuram%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
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
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                    Request Legal Consultation
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1.5">
                    Provide the background of your matter. Information submitted is treated with strict advocate-client privilege.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Anand Kumar"
                        className="w-full px-4 py-3 bg-white/75 backdrop-blur-xs border border-white/90 focus:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-2">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-3 bg-white/75 backdrop-blur-xs border border-white/90 focus:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 bg-white/75 backdrop-blur-xs border border-white/90 focus:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-2">
                        Legal Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white/75 backdrop-blur-xs border border-white/90 focus:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs"
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
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">
                      Preferred Consultation Mode *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-white/85 bg-white/70 backdrop-blur-xs cursor-pointer hover:bg-white/95 transition-all">
                        <input
                          type="radio"
                          name="consultationMode"
                          checked={formData.mode === 'In-Person at Chambers (Vanchiyoor)'}
                          onChange={() =>
                            setFormData({ ...formData, mode: 'In-Person at Chambers (Vanchiyoor)' })
                          }
                          className="accent-neutral-900 w-4 h-4"
                        />
                        <span className="text-neutral-800 font-medium">In-Person at Chambers (Vanchiyoor)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-white/85 bg-white/70 backdrop-blur-xs cursor-pointer hover:bg-white/95 transition-all">
                        <input
                          type="radio"
                          name="consultationMode"
                          checked={formData.mode === 'WhatsApp / Phone Consultation'}
                          onChange={() =>
                            setFormData({ ...formData, mode: 'WhatsApp / Phone Consultation' })
                          }
                          className="accent-neutral-900 w-4 h-4"
                        />
                        <span className="text-neutral-800 font-medium">WhatsApp / Telephonic Consultation</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-2">
                      Summary of Legal Matter *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Briefly state property survey number/location, court jurisdiction, nature of dispute, or documents ready for notary attestation..."
                      className="w-full px-4 py-3 bg-white/75 backdrop-blur-xs border border-white/90 focus:border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all shadow-2xs resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Submit via WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyInquiry}
                      className="inline-flex items-center justify-center gap-2 py-4 px-6 glass-card hover:bg-white text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
                      title="Copy inquiry text"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Details</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 text-center pt-2">
                    Submitting connects directly to Advocate Sasi's chamber WhatsApp at{' '}
                    <span className="font-semibold text-neutral-700">{content.mobile}</span>.
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
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400">
                    <Scale className="w-5 h-5" />
                  </div>
                )}
                <span className="font-serif text-xl font-bold text-white">{content.firmName}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md">
                Chambers of <strong>{content.clientName}</strong> ({content.designation}). Dedicated legal advocacy across the District Judiciary of Kerala.
              </p>
              <div className="text-xs text-neutral-500">
                <p>{content.address}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Navigation</p>
              <ul className="text-xs space-y-2 text-neutral-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Counsel</a></li>
                <li><a href="#practice-areas" className="hover:text-white transition-colors">Practice Disciplines</a></li>
                <li><a href="#highlights" className="hover:text-white transition-colors">Court Record</a></li>
                <li><a href="#gallery" className="hover:text-white transition-colors">Chambers Gallery</a></li>
                <li><a href="#why-choose-us" className="hover:text-white transition-colors">Why Choose Us</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Chambers Contact</p>
              <div className="text-xs text-neutral-400 space-y-2">
                <p>Office: {content.landline}</p>
                <p>Mobile: {content.mobile}</p>
                <p>Vanchiyoor P.O, Thiruvananthapuram</p>
              </div>
            </div>
          </div>

          {/* Bar Council Compliance Notice & Clean Links */}
          <div className="pt-8 space-y-4">
            <p className="text-[11px] text-neutral-500 leading-relaxed max-w-5xl">
              <strong>Notice:</strong> As per the rules of the Bar Council of India, advocates are prohibited from soliciting work or advertising. This website is meant solely for informational purposes to provide details regarding Advocate C.T. Sasi Chengaroor and The Dominant Law Chambers upon specific user request.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 pt-3 border-t border-neutral-900">
              <p>&copy; {new Date().getFullYear()} {content.firmName}. Advocate C.T. Sasi Chengaroor.</p>
              <button
                onClick={() => setShowCodeModal(true)}
                className="hover:text-neutral-300 flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <Code className="w-3.5 h-3.5" /> Standalone Single HTML
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating WhatsApp Action Button */}
      <aside aria-label="Direct WhatsApp Contact" className="fixed bottom-6 right-6 z-50 flex items-center group">
        <div className="hidden sm:block mr-3 bg-neutral-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl border border-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Chat with Advocate Sasi
        </div>
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Direct WhatsApp with ${content.clientName}`}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
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
                <h3 className="font-serif text-xl font-bold text-neutral-900">{activeArea.title}</h3>
                <p className="text-xs text-neutral-500 font-semibold">{activeArea.courtForum}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">{activeArea.summary}</p>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
              <div>
                <p className="font-bold text-neutral-900 mb-1.5 uppercase tracking-wider text-[11px]">
                  Procedural Scope & Actions
                </p>
                <ul className="space-y-1.5 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80">
                  {activeArea.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-neutral-900 mb-1.5 uppercase tracking-wider text-[11px]">
                  Recommended Documents for Consultation
                </p>
                <ul className="space-y-1.5 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80">
                  {activeArea.documentsNeeded.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-neutral-800">
                      <FileText className="w-3.5 h-3.5 text-neutral-600 mt-0.5 shrink-0" />
                      <span>{doc}</span>
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
                className="flex-1 py-3 px-4 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
              >
                Consult on WhatsApp
              </a>
              <button
                onClick={() => setActiveArea(null)}
                className="px-4 py-3 text-xs font-semibold border border-neutral-300 rounded-xl hover:bg-neutral-50 text-neutral-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Gallery Modal */}
      {selectedGalleryModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedGalleryModal(null)}
        >
          <div
            className="max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGalleryModal(null)}
              className="absolute top-4 right-4 z-10 p-2.5 bg-neutral-950/70 hover:bg-neutral-950 text-white rounded-full transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/10] max-h-[70vh] w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedGalleryModal.url}
                alt={selectedGalleryModal.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 bg-neutral-900 border-t border-neutral-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                  {selectedGalleryModal.category || 'Chambers Gallery'}
                </span>
                <h4 className="font-serif text-xl font-bold mt-1">{selectedGalleryModal.title}</h4>
                {selectedGalleryModal.caption && (
                  <p className="text-xs text-neutral-400 mt-0.5">{selectedGalleryModal.caption}</p>
                )}
              </div>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase transition-colors shrink-0"
              >
                Inquire via WhatsApp
              </a>
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
        currentPasswordHash={adminPassword}
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
        currentPasswordHash={adminPassword}
        onUpdatePassword={handleUpdatePassword}
        onLogout={handleAdminLogout}
      />
    </div>
  );
}
