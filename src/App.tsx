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
  Award,
  Briefcase,
  Calendar,
  Download,
  Code,
  ShieldAlert,
  Lock,
  Edit3,
  LogOut,
  Stamp,
  BookOpen,
} from 'lucide-react';

import { SiteContent, PracticeAreaItem } from './types/content';
import { DEFAULT_CONTENT } from './data/defaultContent';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';

const STORAGE_CONTENT_KEY = 'CHAMBERS_CONTENT_LIGHT_V5';
const STORAGE_PWD_KEY = 'CHAMBERS_ADMIN_PWD_LIGHT_V5';
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

  // Keystroke listener for typing "/getinsideadmin"
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

  // Check URL pathname/hash/query for "/getinsideadmin"
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path.includes('getinsideadmin') || hash.includes('getinsideadmin') || search.includes('getinsideadmin')) {
      if (isAdminLoggedIn) {
        setShowAdminPanel(true);
      } else {
        setShowLoginModal(true);
      }
    }
  }, [isAdminLoggedIn]);

  // Save Content to LocalStorage
  const handleSaveContent = (newContent: SiteContent) => {
    setContent(newContent);
    try {
      localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(newContent));
      showToast('Website content, branding & media saved successfully!');
    } catch {
      showToast('Saved to memory (storage quota warning).');
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
        return <ShieldCheck className="w-5 h-5 text-amber-700" />;
      case 'Users':
        return <Users className="w-5 h-5 text-amber-700" />;
      case 'Home':
        return <Home className="w-5 h-5 text-amber-700" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-amber-700" />;
      case 'Gavel':
        return <Gavel className="w-5 h-5 text-amber-700" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-700" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-amber-700" />;
      default:
        return <Scale className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <div className="light-platform-bg subtle-dot-pattern min-h-screen text-slate-800 font-sans antialiased selection:bg-amber-600 selection:text-white py-0 sm:py-6 px-0 sm:px-4 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Control Bar when Logged In */}
      {isAdminLoggedIn && (
        <div className="max-w-7xl mx-auto mb-3 bg-amber-600 text-white px-4 py-2 text-xs font-medium rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-semibold">Chambers Master Console · Admin Active</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-slate-900 text-white hover:bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details, Logo & Favicon</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Comforting Warm Elevated Platform Container */}
      <div className="max-w-7xl mx-auto rounded-none sm:rounded-2xl border-x-0 sm:border border-slate-200/90 light-glass-surface-elevated overflow-hidden relative shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06)]">
        
        {/* Top Header Bar with Trust Markers */}
        <div className="bg-slate-900 text-slate-200 px-4 sm:px-8 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Stamp className="w-3.5 h-3.5" />
              <span>{content.designation} · Govt. of India / Kerala</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{content.locationFocus}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-200">
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Office: {content.landline}</span>
            </span>
            <a
              href={`tel:${content.mobile.replace(/\s+/g, '')}`}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{content.mobile}</span>
            </a>
            <button
              onClick={() => {
                if (isAdminLoggedIn) setShowAdminPanel(true);
                else setShowLoginModal(true);
              }}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors border border-slate-700 px-2 py-0.5 rounded bg-slate-800"
              title="Enter /getinsideadmin"
            >
              <Lock className="w-3 h-3" />
              <span>/getinsideadmin</span>
            </button>
          </div>
        </div>

        {/* Translucent Main Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 h-20 flex items-center justify-between shadow-xs transition-all">
          
          {/* Logo / Brand Mark */}
          <a href="#hero" className="flex items-center gap-3.5 group">
            {content.images.logo ? (
              <img
                src={content.images.logo}
                alt={content.firmName}
                className="h-11 w-auto max-w-[140px] object-contain rounded"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-600/30 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform shadow-xs">
                <Scale className="w-6 h-6" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-amber-800 transition-colors">
                {content.firmName}
              </span>
              <span className="text-[11px] tracking-wider uppercase text-amber-800 font-semibold">
                {content.clientName}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-slate-900 transition-colors">
              About
            </a>
            <a href="#practice-areas" className="hover:text-slate-900 transition-colors">
              Practice Areas
            </a>
            <a href="#highlights" className="hover:text-slate-900 transition-colors">
              Highlights
            </a>
            <a href="#why-choose-us" className="hover:text-slate-900 transition-colors">
              Why Choose Us
            </a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">
              Contact & Chambers
            </a>
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${content.mobile.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-950 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-slate-200 px-6 pt-3 pb-6 space-y-3 shadow-md">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-amber-800 border-b border-slate-100"
            >
              About Advocate Sasi
            </a>
            <a
              href="#practice-areas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-amber-800 border-b border-slate-100"
            >
              Practice Areas
            </a>
            <a
              href="#highlights"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-amber-800 border-b border-slate-100"
            >
              Court Highlights
            </a>
            <a
              href="#why-choose-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-amber-800 border-b border-slate-100"
            >
              Why Choose Us
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 hover:text-amber-800 border-b border-slate-100"
            >
              Chambers & Address
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 rounded-lg"
              >
                <Phone className="w-3.5 h-3.5" /> Call: {content.mobile}
              </a>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 rounded-lg"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Direct WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Hero Section: Warm, Reassuring & Prestigious */}
        <section id="hero" className="relative px-6 sm:px-12 lg:px-16 pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-amber-50/50 via-white to-slate-50/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-50/80 text-amber-900 text-xs font-semibold tracking-wide">
                <Award className="w-4 h-4 text-amber-700" />
                <span>{content.heroBadge}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                {content.heroHeadline}
              </h1>

              <div className="h-1 w-20 bg-amber-600 rounded-full"></div>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {content.heroSubheadline}
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-6 py-4 border-y border-slate-200/90 max-w-xl text-left">
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-800">{content.heroStat1Val}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{content.heroStat1Label}</p>
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-800">{content.heroStat2Val}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{content.heroStat2Label}</p>
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-800">{content.heroStat3Val}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{content.heroStat3Label}</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-all shadow-md shadow-amber-800/15"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Consultation</span>
                </a>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-700/15"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Direct WhatsApp Chat</span>
                </a>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Confidential Case Review</span>
                <span>·</span>
                <span className="flex items-center gap-1.5"><Stamp className="w-4 h-4 text-amber-700" /> Official Notary Public</span>
              </div>

            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-2xl p-3 bg-white border border-slate-200/90 shadow-xl">
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-slate-100">
                  <img
                    src={content.images.portrait}
                    alt={content.clientName}
                    className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Translucent floating badge on image */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-md">
                    <p className="font-serif text-base font-bold text-slate-900">{content.clientName}</p>
                    <p className="text-xs text-amber-800 font-semibold">{content.designation}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>{content.firmName}</span>
                      <a href="#contact" className="text-amber-700 hover:text-amber-800 font-bold">
                        Book Slot &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section: About Advocate Sasi */}
        <section id="about" className="px-6 sm:px-12 lg:px-16 py-20 border-b border-slate-200/80 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Chambers Overview Card */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="light-glass-surface rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200 shadow-sm">
                
                <div className="pb-4 border-b border-slate-200">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700">Chambers Suite</span>
                  <h4 className="font-serif text-xl font-bold text-slate-900 mt-1">{content.firmName}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{content.address}</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                      <Stamp className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-serif text-sm">Notary Public Authority</strong>
                      <span className="text-slate-600">Appointed by the Government to execute notarial acts, attest deeds, verify affidavits, and certify legal declarations.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-serif text-sm">District Court Jurisdiction</strong>
                      <span className="text-slate-600">Practicing regularly across Thiruvananthapuram District Judiciary, CJM, Sub Courts, Munsiff Courts, and Chengaroor.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-serif text-sm">Procedural Rigor & Transparency</strong>
                      <span className="text-slate-600">Delivering practical dispute settlements, unvarnished merit opinions, and resolute courtroom representation.</span>
                    </div>
                  </div>
                </div>

                {/* Office Photo */}
                <div className="rounded-xl overflow-hidden aspect-[16/9] border border-slate-200 relative">
                  <img src={content.images.office} alt="Chambers Office" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-sm text-[11px] text-white px-3 py-1 rounded-lg">
                    Dominant Towers Suite, Vanchiyoor Court District
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${content.landline.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-2.5 px-3 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Office: {content.landline}
                  </a>
                  <a
                    href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-2.5 px-3 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Direct: {content.mobile}
                  </a>
                </div>

              </div>
            </div>

            {/* Right Narrative Profile */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              
              <div className="space-y-1">
                <span className="text-amber-800 font-semibold text-xs tracking-widest uppercase">
                  {content.aboutBadge}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  {content.aboutTitle}
                </h2>
                <p className="text-sm font-medium text-slate-600">{content.aboutSubtitle}</p>
              </div>

              <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                <p>{content.aboutBio1}</p>
                <p>{content.aboutBio2}</p>
                <p>{content.aboutBio3}</p>
              </div>

              {/* Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {content.aboutPillars.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="#practice-areas"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 group"
                >
                  <span>Explore Practice Disciplines</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

            </div>

          </div>
        </section>

        {/* Section: Practice Areas */}
        <section id="practice-areas" className="px-6 sm:px-12 lg:px-16 py-20 border-b border-slate-200/80 bg-slate-50/60">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-amber-800 font-semibold text-xs tracking-widest uppercase">
              Practice Disciplines
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Specialized Legal Practice Areas
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Targeted courtroom advocacy and dispute resolution designed to protect client rights across Kerala District Courts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.practiceAreas.map((area, idx) => (
              <div
                key={area.id || idx}
                className="light-glass-card rounded-2xl p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
                    {renderIcon(area.iconName)}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">
                    {area.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{area.summary}</p>
                  
                  <ul className="text-xs text-slate-700 space-y-2 border-t border-slate-100 pt-3">
                    {area.points.slice(0, 3).map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveArea(area)}
                    className="font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 text-xs flex items-center gap-1"
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
                    className="p-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                    title="WhatsApp Query"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Professional Record */}
        <section id="highlights" className="px-6 sm:px-12 lg:px-16 py-20 border-b border-slate-200/80 bg-white">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-amber-800 font-semibold text-xs tracking-widest uppercase">
              Track Record
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Judicial Record & Highlights
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Decades of active courtroom appearance across the District Judiciary of Thiruvananthapuram and Chengaroor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.highlights.map((hl) => (
              <div key={hl.id} className="light-glass-card rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-4xl font-bold text-amber-800">{hl.metric}</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                    <Gavel className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{hl.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{hl.description}</p>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  {hl.subtext.map((sub, i) => (
                    <p key={i}>· {sub}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Callout Bar */}
          <div className="mt-12 p-6 sm:p-8 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-bold text-slate-900">
                Have an urgent court summons or pending dispute?
              </h4>
              <p className="text-xs text-slate-600">
                Early procedural counsel decisively protects your legal position.
              </p>
            </div>
            <a
              href="#contact"
              className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shadow-sm"
            >
              Book Chamber Appointment
            </a>
          </div>
        </section>

        {/* Section: Why Choose Chambers */}
        <section id="why-choose-us" className="px-6 sm:px-12 lg:px-16 py-20 border-b border-slate-200/80 bg-slate-50/50">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-amber-800 font-semibold text-xs tracking-widest uppercase">
              Core Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Why Choose {content.firmName}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Four fundamental pillars that govern our representation of every brief.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.whyChooseUs.map((box) => (
              <div key={box.id} className="light-glass-card rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-4">
                  {renderIcon(box.iconName)}
                </div>
                <h3 className="font-serif text-base font-bold text-slate-900 mb-2">{box.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{box.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Chambers & Consultation Contact Form */}
        <section id="contact" className="px-6 sm:px-12 lg:px-16 py-20 bg-amber-50/30">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
            <span className="text-amber-800 font-semibold text-xs tracking-widest uppercase">
              Consultations & Location
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Schedule Your Consultation
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Visit our chambers at Dominant Towers, Vanchiyoor or submit your inquiry for an immediate response.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Chambers Directory */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="light-glass-surface p-8 rounded-2xl space-y-6 border border-slate-200 shadow-sm">
                
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">Official Chamber</span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">{content.firmName}</h3>
                  <p className="text-xs text-slate-600">{content.clientName} ({content.designation})</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-900 font-semibold">Address</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5 whitespace-pre-line">
                        {content.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <p className="text-slate-900 font-semibold">Office Landline</p>
                      <a href={`tel:${content.landline.replace(/\s+/g, '')}`} className="text-xs text-amber-800 font-semibold hover:underline">
                        {content.landline}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-slate-900 font-semibold">Mobile & WhatsApp</p>
                      <a href={`tel:${content.mobile.replace(/\s+/g, '')}`} className="text-xs text-emerald-700 font-semibold hover:underline block">
                        {content.mobile}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-900 font-semibold">Chamber & Court Timings</p>
                      <p className="text-xs text-slate-600">{content.officeHours}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{content.courtHours}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Direct WhatsApp
                  </a>
                  <a
                    href={`tel:${content.mobile.replace(/\s+/g, '')}`}
                    className="flex-1 text-center py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Call Chambers
                  </a>
                </div>

              </div>

              {/* Map */}
              <div className="light-glass-surface rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 px-1 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" /> Chambers at Vanchiyoor
                  </span>
                  <a
                    href="https://maps.google.com/?q=Near+Khadi+Board+Vanchiyoor+Thiruvananthapuram+Kerala"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:underline font-semibold flex items-center gap-1 text-xs"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <iframe
                    title="Vanchiyoor Chambers Map"
                    className="w-full h-full border-0"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.044150535303!2d76.94165!3d8.4975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05bba65b6f0001%3A0x1000000000000000!2sVanchiyoor%2C%20Thiruvananthapuram%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

            </div>

            {/* Right: Consultation Form */}
            <div className="lg:col-span-7">
              <div className="light-glass-surface rounded-2xl p-8 border border-slate-200 shadow-sm">
                
                <div className="mb-6 border-b border-slate-200 pb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">Consultation Form</span>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 mt-1">Send Confidential Case Brief</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Your brief will be formatted and transmitted directly to {content.clientName}.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="client-name" className="block text-xs font-semibold text-slate-700 mb-1">
                        Client Full Name *
                      </label>
                      <input
                        type="text"
                        id="client-name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Thomas Mathew"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="client-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        id="client-phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="client-email" className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        id="client-email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. thomas@example.com"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="legal-category" className="block text-xs font-semibold text-slate-700 mb-1">
                        Matter Category *
                      </label>
                      <select
                        id="legal-category"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors"
                      >
                        {content.practiceAreas.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title}
                          </option>
                        ))}
                        <option value="General Legal Advice">General Legal Advisory</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="case-message" className="block text-xs font-semibold text-slate-700 mb-1">
                      Brief Case Summary *
                    </label>
                    <textarea
                      id="case-message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Outline key facts, court location (Trivandrum/Chengaroor), dates of upcoming summons or hearings..."
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">Consultation Preference:</span>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consultation-mode"
                          value="In-Person at Chambers (Vanchiyoor)"
                          checked={formData.mode === 'In-Person at Chambers (Vanchiyoor)'}
                          onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                          className="accent-amber-700"
                        />
                        <span>In-Person Chamber Consultation (Vanchiyoor)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="consultation-mode"
                          value="Telephonic / WhatsApp Consultation"
                          checked={formData.mode === 'Telephonic / WhatsApp Consultation'}
                          onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                          className="accent-amber-700"
                        />
                        <span>Telephonic / WhatsApp Call</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-700/15"
                    >
                      Submit via WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={copyInquiry}
                      className="py-3 px-5 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Inquiry</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1">
                    * Submitting this request allows Advocate Sasi's chambers to review preliminary facts and does not automatically retain counsel.
                  </p>

                </form>

              </div>
            </div>

          </div>
        </section>

        {/* Bar Council Compliance Disclaimer */}
        <aside className="bg-slate-100 text-slate-600 py-6 px-6 sm:px-12 lg:px-16 border-t border-slate-200 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Bar Council of India Statutory Compliance</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-500 max-w-5xl">
              Under the Advocates Act, 1961, advocates in India are not permitted to advertise or solicit briefs. This portfolio is published exclusively to provide factual information at the voluntary behest of the user. Information herein does not constitute legal counsel or create an advocate-client relationship.
            </p>
          </div>
        </aside>

        {/* Footer inside Platform */}
        <footer className="bg-slate-900 text-slate-400 py-10 px-6 sm:px-12 lg:px-16 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                {content.images.logo ? (
                  <img src={content.images.logo} alt={content.firmName} className="h-9 w-auto max-w-[120px] object-contain rounded" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                    <Scale className="w-4 h-4" />
                  </div>
                )}
                <span className="font-serif text-lg font-bold text-white">{content.firmName}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Chambers of <strong>{content.clientName}</strong> ({content.designation}). Dedicated legal advocacy across the District Judiciary of Kerala.
              </p>
              <div className="text-xs text-slate-400">
                <p>{content.address}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Navigation</p>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li><a href="#about" className="hover:text-amber-400 transition-colors">About Counsel</a></li>
                <li><a href="#practice-areas" className="hover:text-amber-400 transition-colors">Practice Areas</a></li>
                <li><a href="#highlights" className="hover:text-amber-400 transition-colors">Court Record</a></li>
                <li><a href="#why-choose-us" className="hover:text-amber-400 transition-colors">Why Choose Us</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Contact</p>
              <div className="text-xs text-slate-300 space-y-1.5">
                <p>Office: {content.landline}</p>
                <p>Mobile: {content.mobile}</p>
                <p>Vanchiyoor P.O, Trivandrum</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} {content.firmName}. Advocate C.T. Sasi Chengaroor.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isAdminLoggedIn) setShowAdminPanel(true);
                  else setShowLoginModal(true);
                }}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors font-mono"
              >
                <Lock className="w-3 h-3" /> /getinsideadmin
              </button>
              <span>·</span>
              <button
                onClick={() => setShowCodeModal(true)}
                className="hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <Code className="w-3 h-3" /> Standalone Single HTML
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating WhatsApp Action Button */}
      <aside aria-label="Direct WhatsApp Contact" className="fixed bottom-6 right-6 z-50 flex items-center group">
        <div className="hidden sm:block mr-3 bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Chat with Advocate Sasi
        </div>
        <a
          href={directWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Direct WhatsApp with ${content.clientName}`}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
        </a>
      </aside>

      {/* Practice Area Detail Modal */}
      {activeArea && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveArea(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                {renderIcon(activeArea.iconName)}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">{activeArea.title}</h3>
                <p className="text-xs text-amber-800 font-semibold">{activeArea.courtForum}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">{activeArea.summary}</p>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <p className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px]">
                  Procedural Scope & Actions
                </p>
                <ul className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {activeArea.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px]">
                  Recommended Documents for Consultation
                </p>
                <ul className="space-y-1.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                  {activeArea.documentsNeeded.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
              <a
                href={`https://wa.me/${content.whatsappNumber}?text=Hello%20${encodeURIComponent(
                  content.clientName
                )},%20I%20wish%20to%20consult%20regarding%20${encodeURIComponent(activeArea.title)}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Consult on WhatsApp
              </a>
              <button
                onClick={() => setActiveArea(null)}
                className="px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone HTML File Exporter Modal */}
      {showCodeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Code className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif text-xl font-bold text-white">Standalone Single HTML File</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Self-contained single-page responsive portfolio with HTML5, Tailwind CSS via CDN, FontAwesome icons, and Vanilla JavaScript.
            </p>

            <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 mb-4">
              <p className="text-emerald-400"># Ready-to-run Single File: /public/standalone_portfolio.html</p>
              <p>You can download or open the standalone file directly in your browser without any build tools.</p>
              <div className="pt-2 text-slate-400 space-y-1">
                <p>✓ Complete HTML5 semantic structure</p>
                <p>✓ Tailwind CSS CDN loaded</p>
                <p>✓ FontAwesome 6 icons</p>
                <p>✓ Google Fonts (Playfair Display & Inter)</p>
                <p>✓ Full client details, WhatsApp integration & Vanilla JS</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <a
                href="/standalone_portfolio.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Standalone HTML
              </a>
              <a
                href="/standalone_portfolio.html"
                download="advocate_c_t_sasi_portfolio.html"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" /> Download HTML File
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
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

      {/* Admin Backside Content, Logo & Favicon Manager */}
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
