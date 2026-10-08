import { SiteContent } from '../types/content';
import heroChambersImg from '../assets/images/hero_law_chambers.webp';
import portraitImg from '../assets/images/advocate_sasi_portrait.webp';
import officeImg from '../assets/images/dominant_towers_office.webp';
import chamberLogoImg from '../assets/images/chamber_logo.webp';
import chamberWoodBg from '../assets/images/chamber_wood_bg_1791118232828.jpg';

import gallery1Img from '../assets/images/gallery_1.webp';
import gallery2Img from '../assets/images/gallery_2.webp';
import gallery3Img from '../assets/images/gallery_3.webp';
import gallery4Img from '../assets/images/gallery_4.webp';
import gallery5Img from '../assets/images/gallery_5.webp';
import gallery6Img from '../assets/images/gallery_6.webp';

export const DEFAULT_CONTENT: SiteContent = {
  clientName: 'Advocate C.T. Sasi Chengaroor',
  designation: 'Advocate & Notary',
  firmName: 'The Dominant Law Chambers',
  address: 'Dominant Towers, Near Khadi Board, Vanchiyoor P.O, Thiruvananthapuram - 695035, Kerala',
  landline: '0471-3172377',
  mobile: '+91 9497100509',
  whatsappNumber: '919497100509',
  locationFocus: 'District Courts, Thiruvananthapuram & Chengaroor, Kerala',
  officeHours: 'Mon - Sat: 9:00 AM – 1:30 PM & 3:00 PM – 8:00 PM',
  courtHours: 'District Court Sessions: 10:30 AM – 4:30 PM',

  heroBadge: 'Senior Advocate & Govt. Authorized Notary Public',
  heroHeadline: 'Advocate C.T. Sasi Chengaroor',
  heroSubheadline:
    'Over 25 years of proven courtroom practice across the District Judiciary, Family Courts, MACT, Administrative Tribunals & High Court of Kerala. Lead Counsel at The Dominant Law Chambers, Vanchiyoor.',
  heroStat1Val: '25+ Yrs',
  heroStat1Label: 'Court Practice',
  heroStat2Val: 'Family Court',
  heroStat2Label: 'Primary Focus',
  heroStat3Val: 'Govt. Notary',
  heroStat3Label: 'Central Authorized',

  aboutBadge: 'Lead Counsel Profile',
  aboutTitle: 'Advocate C.T. Sasi Chengaroor',
  aboutSubtitle: 'Senior Advocate & Notary Public · Lead Counsel, The Dominant Law Chambers',
  aboutBio1:
    'Advocate C.T. Sasi Chengaroor brings over 25 years of distinguished courtroom practice across the District Judiciary, Family Courts, Motor Accidents Claims Tribunal (MACT), Administrative Tribunals, and the High Court of Kerala.',
  aboutBio2:
    'The chamber’s primary focus is Family Court and Matrimonial Law—providing strategic, empathetic advocacy in divorce, child custody, visitation rights, and maintenance settlements.',
  aboutBio3:
    'Appointed by the Government as Notary Public, offering prompt statutory affidavits, deed authentications, and visa verifications at Dominant Towers, Vanchiyoor.',
  aboutPillars: [
    'Family Court Matrimonial Focus',
    'MACT Motor Accident Claims',
    'High Court Writs & Appeals',
    'Administrative Tribunals (CAT/KAT)',
  ],

  practiceAreas: [
    {
      id: 'family-law',
      title: 'Family Court & Matrimonial Law',
      iconName: 'Users',
      isMainFocus: true,
      summary:
        'Primary chamber specialization: compassionate, strategic legal representation in divorce, child custody, maintenance, and matrimonial disputes.',
      points: [
        'Mutual consent & contested divorce',
        'Child custody, guardianship & visitation',
        'Interim & permanent maintenance claims',
        'Domestic Violence Act defense & mediation',
      ],
      documentsNeeded: [
        'Marriage certificate & ID proof',
        'Children birth certificates (if applicable)',
        'Income statements & financial disclosures',
      ],
      courtForum: 'Family Court, Thiruvananthapuram & Appellate Benches',
    },
    {
      id: 'mact-claims',
      title: 'MACT (Motor Accident Claims)',
      iconName: 'Car',
      summary:
        'Filing and recovery of maximum compensation for road accident victims, permanent disability, and insurance disputes.',
      points: [
        'Accidental injury & disability compensation',
        'Fatal accident claims for dependents',
        'Third-party insurance liability recovery',
        'Appellate enhancement of awards',
      ],
      documentsNeeded: [
        'FIR copy & scene mahazar',
        'Medical treatment & disability records',
        'Income proof & dependency certificates',
      ],
      courtForum: 'Motor Accidents Claims Tribunal (MACT), Trivandrum',
    },
    {
      id: 'high-court-cases',
      title: 'High Court Cases & Writs',
      iconName: 'Scale',
      summary:
        'Constitutional writ petitions under Article 226, civil & criminal appeals, emergency stay orders, and quashing petitions.',
      points: [
        'Article 226 Writ Petitions',
        'Civil & Criminal Appeals / Revisions',
        'Section 482 CrPC quashing petitions',
        'Urgent interim stay orders & bail appeals',
      ],
      documentsNeeded: [
        'Certified copies of lower court orders',
        'Impugned government orders / notifications',
        'Vakalatnama authorization',
      ],
      courtForum: 'High Court of Kerala, Ernakulam Bench',
    },
    {
      id: 'administrative-tribunals',
      title: 'Administrative Tribunals (CAT / KAT)',
      iconName: 'FileText',
      summary:
        'Advocacy for Central and Kerala State Government employees in service matters, disciplinary inquiries, pensions, and promotions.',
      points: [
        'Central (CAT) & Kerala (KAT) Tribunals',
        'Disciplinary inquiries & charge sheets',
        'Seniority lists & promotion disputes',
        'Pension, gratuity & retirement benefits',
      ],
      documentsNeeded: [
        'Appointment & promotion orders',
        'Charge sheet, reply & inquiry records',
        'Departmental appeal submissions',
      ],
      courtForum: 'Central (CAT) & Kerala State (KAT) Tribunals',
    },
    {
      id: 'civil-litigation',
      title: 'Civil Litigation & Land Disputes',
      iconName: 'Home',
      summary:
        'Courtroom advocacy in Kerala property suits, ancestral partition, injunctions, and land title disputes.',
      points: [
        'Ancestral partition & final decrees',
        'Injunctions against illegal trespass',
        'Specific performance of property contracts',
        'Title verification & encumbrance clearing',
      ],
      documentsNeeded: [
        'Registered title deeds & prior deeds',
        'Land tax receipts & survey sketch',
        'Possession & Encumbrance Certificates',
      ],
      courtForum: 'District & Sessions Court, Sub Courts & Munsiff Courts',
    },
    {
      id: 'criminal-defence',
      title: 'Criminal Cases, Bail & Sessions Trials',
      iconName: 'ShieldCheck',
      summary:
        'Immediate representation for regular bail, anticipatory bail, trial defense, and criminal appeals in Sessions & CJM Courts.',
      points: [
        'Regular & Anticipatory bail applications',
        'Sessions & Magistrate Court trial defense',
        'Section 138 NI Act (cheque bounce)',
        'Compounding of offenses & revisions',
      ],
      documentsNeeded: [
        'FIR copy, charge sheet or court summons',
        'Bail notices or station papers',
        'Surety documentation & ID credentials',
      ],
      courtForum: 'District & Sessions Court, CJM & Magistrate Courts',
    },
    {
      id: 'arbitration-disputes',
      title: 'Arbitration & Commercial Dispute Resolution',
      iconName: 'Scale',
      summary:
        'Representation in institutional and ad-hoc arbitrations under the Arbitration & Conciliation Act for contract and commercial disputes.',
      points: [
        'Commercial contract & partnership arbitration',
        'Appointment of arbitrator petitions (Sec 11)',
        'Interim protection measures (Sec 9 & Sec 17)',
        'Challenging and enforcement of arbitral awards',
      ],
      documentsNeeded: [
        'Commercial contract / agreement with arbitration clause',
        'Notice invoking arbitration & reply correspondence',
        'Pleadings and claim statement records',
      ],
      courtForum: 'Arbitral Tribunals & Commercial Courts, Kerala',
    },
    {
      id: 'cooperative-tribunal',
      title: 'Cooperative Tribunal & Societies Cases',
      iconName: 'Landmark',
      summary:
        'Statutory appeals, surcharge proceedings, and dispute resolution under the Kerala Cooperative Societies Act.',
      points: [
        'Disputes under Sec 69 Kerala Cooperative Societies Act',
        'Appeals and revisions before Kerala Cooperative Tribunal',
        'Surcharge proceedings and inspection defenses',
        'Society elections and committee disqualifications',
      ],
      documentsNeeded: [
        'Impugned order of Registrar / Joint Registrar',
        'Cooperative society bylaws & membership records',
        'Inspection reports & audit objections',
      ],
      courtForum: 'Kerala Cooperative Tribunal & Registrar Courts',
    },
    {
      id: 'lok-ayukta',
      title: 'Lok Ayukta & Anti-Corruption Proceedings',
      iconName: 'Award',
      summary:
        'Decisive advocacy before the Kerala Lok Ayukta and Upa Lok Ayukta in cases of maladministration, corruption, and official favoritism.',
      points: [
        'Complaints under Kerala Lok Ayukta Act, 1999',
        'Investigations into public servant corruption & abuse of power',
        'Challenging illegal official decisions and maladministration',
        'Defending statutory inquiries and securing interim directions',
      ],
      documentsNeeded: [
        'Complainant affidavit and detailed statement of facts',
        'Official RTI replies and corroborative government records',
        'Details of public servants and impugned official acts',
      ],
      courtForum: 'Kerala Lok Ayukta & Upa Lok Ayukta, Trivandrum',
    },
    {
      id: 'notary-services',
      title: 'Notary Public Services',
      iconName: 'Gavel',
      summary:
        'Government-appointed Notary Public executing prompt statutory attestations, affidavits, and visa verifications.',
      points: [
        'General & Special Power of Attorney',
        'Court, embassy & visa affidavits',
        'Commercial contracts attestation',
        'Certified true copy attestations',
      ],
      documentsNeeded: [
        'Original documents for certification',
        'Valid government photo identification',
        'Passport size photographs',
      ],
      courtForum: 'Govt. Notary Desk, The Dominant Law Chambers',
    },
  ],

  onlineConsultationFee: 500,
  gpayNumber: '9497100509',
  upiId: 'adv.ctsasi-1@okaxis',

  highlights: [
    {
      id: 'hl-1',
      title: 'Courtroom Mastery',
      metric: '25+',
      description:
        'Decades of active courtroom practice across District Courts, MACT, and High Court.',
      subtext: ['District Judiciary Trivandrum', 'High Court of Kerala & Tribunals'],
    },
    {
      id: 'hl-2',
      title: 'Family Court Settlements',
      metric: '85%+',
      description:
        'High success in favorable decrees and amicable out-of-court family settlements.',
      subtext: ['Matrimonial Mediation', 'Alimony & Custody Settlements'],
    },
    {
      id: 'hl-3',
      title: 'Govt. Notary Desk',
      metric: '100%',
      description:
        'Government-authorized Notary Public providing prompt, certified legal validation.',
      subtext: ['Central Notarial Registry', 'Immediate Attestations'],
    },
  ],

  whyChooseUs: [
    {
      id: 'w-1',
      title: '25+ Years Court Practice',
      description:
        'Deep courtroom trial experience across District Courts, Family Courts, MACT & High Court.',
      iconName: 'Award',
    },
    {
      id: 'w-2',
      title: 'Family Court Specialization',
      description:
        'Primary chamber focus: sensitive, tactical matrimonial advocacy protecting family rights.',
      iconName: 'Users',
    },
    {
      id: 'w-3',
      title: 'MACT & Tribunal Advocacy',
      description:
        'Maximal compensation recovery in accident claims and government service dispute representation.',
      iconName: 'Scale',
    },
    {
      id: 'w-4',
      title: 'Direct Counsel & Integrity',
      description:
        'Honest assessment of legal merits, transparent fees, and dedicated client attention.',
      iconName: 'ShieldCheck',
    },
  ],

  galleryImages: [
    {
      id: 'gal-1791185540250-0-4hla',
      url: gallery1Img,
      title: 'Welcome to The Dominant Law Chambers',
      caption: 'The entrance to our chambers, with our team of advocates listed on the board. Call us on 0471-3172377.',
      category: 'Chambers',
    },
    {
      id: 'gal-1791185554675-0-60il',
      url: gallery2Img,
      title: 'Dominant Towers, Home of The Dominant Law Chambers',
      caption: 'Our chambers at Dominant Towers, where clients are welcomed and every case receives careful attention.',
      category: 'Chambers',
    },
    {
      id: 'gal-1791185564464-0-dp0z',
      url: gallery3Img,
      title: 'Advocate C.T. Sasi at His Chamber',
      caption: 'Advocate C.T. Sasi, Senior Advocate and head of The Dominant Law Chambers, in his office.',
      category: 'Chambers',
    },
    {
      id: 'gal-1791185574196-0-zre3',
      url: gallery4Img,
      title: 'Advocate C.T. Sasi',
      caption: 'Experience, integrity and dedication to justice: Advocate C.T. Sasi, The Dominant Law Chambers.',
      category: 'Chambers',
    },
    {
      id: 'gal-1791185586408-0-wimq',
      url: gallery5Img,
      title: 'The Advocates of The Dominant Law Chambers',
      caption: 'Led by Advocate C.T. Sasi, our team of advocates is committed to client-focused, ethical legal practice.',
      category: 'Chambers',
    },
    {
      id: 'gal-1791185606219-0-6hrm',
      url: gallery6Img,
      title: 'The Dominant Law Chambers Family',
      caption: 'Our advocates, associates and support staff, the team behind The Dominant Law Chambers.',
      category: 'Chambers',
    },
  ],

  images: {
    portrait: portraitImg,
    heroChambers: heroChambersImg,
    office: officeImg,
    favicon: '/favicon.ico',
    logo: chamberLogoImg,
    backgroundImage: chamberWoodBg,
  },
};
