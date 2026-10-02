import { SiteContent } from '../types/content';
import heroChambersImg from '../assets/images/hero_law_chambers_1790923017149.jpg';
import portraitImg from '../assets/images/advocate_sasi_portrait_1790923031092.jpg';
import officeImg from '../assets/images/dominant_towers_office_1790923044219.jpg';
import galleryLibraryImg from '../assets/images/gallery_law_library_1790925153003.jpg';

export const DEFAULT_CONTENT: SiteContent = {
  clientName: 'Advocate C.T. Sasi Chengaroor',
  designation: 'Advocate & Notary',
  firmName: 'The Dominant Law Chambers',
  address: 'Dominant Towers, Near Khadi Board, Vanchiyoor P.O, Thiruvananthapuram - 695035, Kerala',
  landline: '0471-3172377',
  mobile: '+91 9497100509',
  whatsappNumber: '919497100509',
  locationFocus: 'District Courts, Thiruvananthapuram & Chengaroor, Kerala',
  officeHours: 'Mon - Sat: 9:00 AM – 1:30 PM & 4:30 PM – 8:00 PM',
  courtHours: 'District Court Sessions: 10:30 AM – 4:30 PM',

  heroBadge: 'Senior Legal Counsel & Notary Public',
  heroHeadline: 'Trusted Legal Representation & Advocacy',
  heroSubheadline:
    'Delivering effective, client-centric legal solutions in District Courts. Practicing with integrity, deep procedural acumen, and seasoned court advocacy across Thiruvananthapuram and Chengaroor, Kerala.',
  heroStat1Val: '25+ Yrs',
  heroStat1Label: 'Court Experience',
  heroStat2Val: '1,200+',
  heroStat2Label: 'Briefs Argued',
  heroStat3Val: 'Govt Regd',
  heroStat3Label: 'Advocate & Notary',

  aboutBadge: 'About the Advocate',
  aboutTitle: 'Advocate C.T. Sasi Chengaroor',
  aboutSubtitle: 'Advocate & Notary · Lead Counsel at The Dominant Law Chambers',
  aboutBio1:
    'With more than two decades of distinguished advocacy before the District & Sessions Courts and specialized tribunals across Kerala, Advocate C.T. Sasi Chengaroor brings uncompromising dedication, strategic acumen, and deep procedural depth to every legal brief.',
  aboutBio2:
    'From the bustling legal corridor of Vanchiyoor, Thiruvananthapuram to Chengaroor, Advocate Sasi has forged an exceptional reputation for untangling intricate property title disputes, delivering decisive criminal defence advocacy, and providing compassionate yet resolute guidance in sensitive family and matrimonial matters.',
  aboutBio3:
    'In his official capacity as a Government-appointed Notary, he administers critical notarizations, affidavits, statutory declarations, commercial contracts, and international visa documentation with precision, ensuring full compliance with Indian statutory requirements.',
  aboutPillars: [
    'Thorough Case Law & Precedent Research',
    'Uncompromising Client Confidentiality',
    'Honest Prognosis of Court Prospects',
    'Transparent Judicial Court Procedures',
  ],

  practiceAreas: [
    {
      id: 'civil-litigation',
      title: 'Civil Litigation',
      iconName: 'Scale',
      summary:
        'Comprehensive representation in contractual disputes, injunction suits, declaratory decrees, damage recovery, and commercial litigation before District and Subordinate Courts.',
      points: [
        'Breach of contract & specific performance actions',
        'Temporary and perpetual injunction petitions',
        'Money recovery & civil damages lawsuits',
        'Appeals and revisions before District & Sub Courts',
      ],
      documentsNeeded: [
        'Original or certified copy of disputed contract / agreement',
        'Relevant correspondence / legal notices and postal receipts',
        'Proof of payment or financial transactions',
      ],
      courtForum: 'District & Sessions Court, Sub Courts & Munsiff Courts, Trivandrum',
    },
    {
      id: 'criminal-defence',
      title: 'Criminal Defence',
      iconName: 'ShieldCheck',
      summary:
        'Tenacious court defence strategies representing accused individuals in trial, bail proceedings, revisions, and appeals across minor infractions and serious criminal charges.',
      points: [
        'Regular & anticipatory bail applications',
        'Trial defence in Sessions & Magistrate Courts',
        'Section 138 NI Act (cheque bounce cases)',
        'Quashing petitions and criminal revision representations',
      ],
      documentsNeeded: [
        'Copy of First Information Report (FIR) or Police Charge Sheet',
        'Bail summons or notices from police station / court',
        'Identity and surety credentials',
      ],
      courtForum: 'Sessions Court, Chief Judicial Magistrate (CJM) & Magistrate Courts',
    },
    {
      id: 'family-law',
      title: 'Family Law',
      iconName: 'Users',
      summary:
        'Empathetic, confidential legal support for matrimonial disputes, mutual consent divorce, contested proceedings, child custody battles, alimony settlements, and maintenance.',
      points: [
        'Mutual consent divorce & contested divorce petitions',
        'Child custody, guardianship & visitation rights',
        'Permanent alimony and interim monthly maintenance suits',
        'Domestic Violence Act defense & matrimonial compromise',
      ],
      documentsNeeded: [
        'Marriage registration certificate & wedding photographs',
        'Birth certificates of minor children (if custody involved)',
        'Financial proof / income affidavits / assets schedule',
      ],
      courtForum: 'Family Court, Thiruvananthapuram & District Family Tribunals',
    },
    {
      id: 'property-disputes',
      title: 'Property Disputes',
      iconName: 'Home',
      summary:
        'In-depth domain expertise in Kerala land laws, ancestral partition suits, boundary demarcations, encroachment eviction, and resolving encumbered land ownership conflicts.',
      points: [
        'Ancestral land partition suits & final decrees',
        'Title search, verification & encumbrance clearance',
        'Boundary encroachment & survey conflicts',
        'Injunction against illegal trespass & land grabbing',
      ],
      documentsNeeded: [
        'Title deeds (Janmam, Sale deed, Gift deed, Settlement, Will)',
        'Prior title deeds (30 years chain of title)',
        'Land tax receipts, survey sketch (Thandaper & Resurvey FMB)',
        'Possession certificate & Encumbrance Certificate (EC)',
      ],
      courtForum: 'Subordinate Judges Courts & Munsiff Courts across Kerala',
    },
    {
      id: 'debt-recovery',
      title: 'Debt Recovery & Financial Disputes',
      iconName: 'FileText',
      summary:
        'Swift and decisive recovery actions for unpaid debts, promissory note claims, commercial defaults, and business creditor recovery mechanisms.',
      points: [
        'Summary recovery suits under Order 37 CPC',
        'Legal demand notices & pre-litigation negotiations',
        'Promissory note & loan agreement enforcement',
        'Execution petitions for decree realization & asset attachment',
      ],
      documentsNeeded: [
        'Promissory note, loan agreement or invoice vouchers',
        'Bank statement reflecting dishonour or fund transfer',
        'Copies of dispatched notices and acknowledgement cards',
      ],
      courtForum: 'Civil Courts & Debt Recovery Tribunals (DRT)',
    },
    {
      id: 'notary-services',
      title: 'Notary Public Services',
      iconName: 'Gavel',
      summary:
        'Statutory Notary Public services at Dominant Towers, Vanchiyoor for legal verifications, passport & visa affidavits, sale agreements, power of attorney, and statutory affidavits.',
      points: [
        'General & Special Power of Attorney (GPA / SPA)',
        'Court, embassy & educational affidavits',
        'Attestation of commercial contracts & declarations',
        'Notarized true copy certifications',
      ],
      documentsNeeded: [
        'Original documents requiring notarial certification',
        'Government Photo ID proof of all executing signatories',
        'Two passport size photographs',
      ],
      courtForum: 'The Dominant Law Chambers, Dominant Towers, Vanchiyoor',
    },
  ],

  highlights: [
    {
      id: 'hl-1',
      title: 'District Courts Mastery',
      metric: '25+',
      description:
        'Continuous active appearance before District & Sessions Courts, CJM, Sub Courts, and Munsiff Courts with comprehensive understanding of local civil and criminal jurisprudence.',
      subtext: ['Thiruvananthapuram District Judiciary', 'Chengaroor & Pathanamthitta Jurisdictions'],
    },
    {
      id: 'hl-2',
      title: 'Property & Family Resolution',
      metric: '85%+',
      description:
        'High rate of favorable decrees and amicable out-of-court family settlements, preventing endless generational inheritance lawsuits and emotional trauma for clients.',
      subtext: ['Title Deed Validation & Partition', 'Mediation & Alimony Compromises'],
    },
    {
      id: 'hl-3',
      title: 'Statutory Notarization',
      metric: '100%',
      description:
        'Government-authorized Notary Public providing prompt, strictly compliant legal validation for commercial deeds, bank securities, affidavits, and foreign visa attestations.',
      subtext: ['Central/State Notarial Registry', 'Immediate Desk Attestations'],
    },
  ],

  whyChooseUs: [
    {
      id: 'w-1',
      title: 'Comprehensive Legal Knowledge',
      description:
        'In-depth mastery of the Civil Procedure Code, Indian Penal Code, Bharatiya Nyaya Sanhita, Kerala Land Reforms, and family matrimonial jurisprudence.',
      iconName: 'Scale',
    },
    {
      id: 'w-2',
      title: 'Personalized Solutions',
      description:
        'No cookie-cutter templates. Every legal strategy is custom-built around your unique factual matrix, evidence availability, and personal priorities.',
      iconName: 'ShieldCheck',
    },
    {
      id: 'w-3',
      title: 'Proven Track Record',
      description:
        'A commanding presence in the District Courts of Thiruvananthapuram and Chengaroor backed by hundreds of satisfied clients and successfully argued matters.',
      iconName: 'Award',
    },
    {
      id: 'w-4',
      title: 'Commitment to Justice',
      description:
        'Ethical advocacy that prioritizes genuine client welfare, honest prognosis of case merits, transparent fee structures, and steadfast integrity.',
      iconName: 'Briefcase',
    },
  ],

  galleryImages: [
    {
      id: 'gal-1',
      url: galleryLibraryImg,
      title: 'Chambers Law Library & Case Archives',
      caption: 'Extensive repository of Supreme Court, High Court, and Kerala Law Times reports supporting diligent legal research.',
      category: 'Chambers',
    },
    {
      id: 'gal-2',
      url: officeImg,
      title: 'Dominant Towers Consultation Suite',
      caption: 'Private and comfortable conference chambers for confidential client meetings and notary document execution in Vanchiyoor.',
      category: 'Office',
    },
    {
      id: 'gal-3',
      url: heroChambersImg,
      title: 'Executive Conference & Dispute Mediation Room',
      caption: 'Equipped for pre-trial negotiations, family dispute mediation, and comprehensive case preparation.',
      category: 'Facilities',
    },
    {
      id: 'gal-4',
      url: portraitImg,
      title: 'Advocate C.T. Sasi Chengaroor',
      caption: 'Senior Advocate & Notary Public with over 25 years of courtroom practice in District Courts, Thiruvananthapuram.',
      category: 'Counsel',
    },
  ],

  images: {
    portrait: portraitImg,
    heroChambers: heroChambersImg,
    office: officeImg,
    favicon: '',
    logo: '',
  },
};
