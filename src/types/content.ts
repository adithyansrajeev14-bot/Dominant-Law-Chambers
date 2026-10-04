export interface PracticeAreaItem {
  id: string;
  title: string;
  iconName: string;
  summary: string;
  points: string[];
  documentsNeeded: string[];
  courtForum: string;
  isMainFocus?: boolean;
}

export interface HighlightItem {
  id: string;
  title: string;
  metric: string;
  description: string;
  subtext: string[];
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface GalleryImageItem {
  id: string;
  url: string;
  title: string;
  caption?: string;
  category?: string;
}

export interface SiteContent {
  clientName: string;
  designation: string;
  firmName: string;
  address: string;
  landline: string;
  mobile: string;
  whatsappNumber: string;
  locationFocus: string;
  officeHours: string;
  courtHours: string;

  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroStat1Val: string;
  heroStat1Label: string;
  heroStat2Val: string;
  heroStat2Label: string;
  heroStat3Val: string;
  heroStat3Label: string;

  aboutBadge: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutBio1: string;
  aboutBio2: string;
  aboutBio3: string;
  aboutPillars: string[];

  practiceAreas: PracticeAreaItem[];
  highlights: HighlightItem[];
  whyChooseUs: WhyChooseItem[];
  galleryImages: GalleryImageItem[];

  onlineConsultationFee?: number;
  gpayNumber?: string;
  upiId?: string;

  images: {
    portrait: string;
    heroChambers: string;
    office: string;
    favicon?: string;
    logo?: string;
    backgroundImage?: string;
  };
}
