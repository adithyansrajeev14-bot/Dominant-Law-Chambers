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

  heroBadge: 'Senior Advocate & Govt. Authorized Notary Public',
  heroHeadline: 'Commanding Legal Counsel & Stately Courtroom Advocacy',
  heroSubheadline:
    'Over 25 years of proven courtroom practice across the District Judiciary, Family Courts, MACT & High Court of Kerala. Lead Counsel at The Dominant Law Chambers, Vanchiyoor, Thiruvananthapuram.',
  heroStat1Val: '25+ Yrs',
  heroStat1Label: 'Courtroom Practice',
  heroStat2Val: 'Family Court',
  heroStat2Label: 'Primary Chamber Focus',
  heroStat3Val: 'Govt. Notary',
  heroStat3Label: 'Central Authorized',

  aboutBadge: 'Lead Counsel Profile',
  aboutTitle: 'Advocate C.T. Sasi Chengaroor',
  aboutSubtitle: 'Senior Advocate & Notary Public · Lead Counsel at The Dominant Law Chambers',
  aboutBio1:
    'Over 25 years of continuous trial and appellate advocacy across the District Judiciary, Family Courts, Motor Accidents Claims Tribunal (MACT), Administrative Tribunals, and the High Court of Kerala.',
  aboutBio2:
    'Primary chamber focus centered on Family Court matrimonial matters—delivering strategic, empathetic advocacy in contested and mutual divorce, child custody, and maintenance settlements.',
  aboutBio3:
    'Government-appointed Notary Public executing statutory verifications, international visa documentation, and affidavits from The Dominant Law Chambers at Vanchiyoor.',
  aboutPillars: [
    'Family Court Matrimonial Specialization',
    'MACT Compensation & High Court Writs',
    'Administrative Tribunals (CAT / KAT)',
    'Prompt Bail & Criminal Defense',
  ],

  practiceAreas: [
    {
      id: 'family-law',
      title: 'Family Court & Matrimonial Law',
      iconName: 'Users',
      isMainFocus: true,
      summary:
        'Primary chamber specialization: compassionate, tactical representation in mutual & contested divorce, child custody, maintenance, and domestic violence settlements.',
      points: [
        'Mutual consent & contested divorce proceedings',
        'Child custody, guardianship & visitation orders',
        'Interim & permanent maintenance / alimony claims',
        'Domestic Violence Act (DV) defense & mediation',
      ],
      documentsNeeded: [
        'Marriage certificate & identity proof',
        'Custody records / birth certificates (if applicable)',
        'Income proof & financial disclosure statements',
      ],
      courtForum: 'Family Court, Thiruvananthapuram & Appellate Benches',
    },
    {
      id: 'mact-claims',
      title: 'MACT (Motor Accident Claims)',
      iconName: 'Award',
      summary:
        'Dedicated claim filing and maximal compensation recovery for motor accident victims, permanent disability, and third-party insurer liability disputes.',
      points: [
        'Accidental injury & permanent disability compensation',
        'Fatal accident claims for dependents & legal heirs',
        'Third-party insurer liability & negotiation',
        'Appellate enhancement of inadequate awards',
      ],
      documentsNeeded: [
        'FIR copy, vehicle inspection report & scene mahazar',
        'Medical treatment records & disability certificate',
        'Income proof, salary certificates & dependency proof',
      ],
      courtForum: 'Motor Accidents Claims Tribunal (MACT), Trivandrum',
    },
    {
      id: 'high-court-cases',
      title: 'High Court Litigation & Writs',
      iconName: 'Scale',
      summary:
        'Constitutional writ petitions under Article 226, civil & criminal appellate briefs, emergency stay orders, and quashing petitions before the High Court of Kerala.',
      points: [
        'Writ Petitions (Article 226) against statutory inaction',
        'First & Second Civil Appeals and Criminal Revisions',
        'Section 482 CrPC quashing petitions',
        'Emergency interim stay orders & bail appeals',
      ],
      documentsNeeded: [
        'Certified copies of lower court orders & pleadings',
        'Impugned government notifications or orders',
        'Vakalatnama & client authorization',
      ],
      courtForum: 'High Court of Kerala, Ernakulam Bench',
    },
    {
      id: 'administrative-tribunals',
      title: 'Administrative Tribunals (CAT / KAT)',
      iconName: 'FileText',
      summary:
        'Advocacy for central and state government employees, teachers, and public sector personnel in departmental and service disputes.',
      points: [
        'Central (CAT) & Kerala Administrative Tribunal (KAT)',
        'Disciplinary inquiries, charge sheets & penalties',
        'Promotion, seniority list & pay scale disputes',
        'Pension, gratuity & retirement benefits recovery',
      ],
      documentsNeeded: [
        'Appointment, seniority & promotion orders',
        'Charge sheet, reply & inquiry report',
        'Departmental appeals & representation records',
      ],
      courtForum: 'Central (CAT) & Kerala State Administrative Tribunal (KAT)',
    },
    {
      id: 'civil-litigation',
      title: 'Civil Litigation & Land Disputes',
      iconName: 'Home',
      summary:
        'Decisive courtroom advocacy in Kerala land tenure, ancestral partition suits, boundary disputes, injunctions, and title declarations.',
      points: [
        'Ancestral partition suits & final decree execution',
        'Injunction against illegal trespass & encroachment',
        'Specific performance of property agreements',
        'Title search, verification & encumbrance clearance',
      ],
      documentsNeeded: [
        'Registered title deeds, prior deeds (chain of title)',
        'Land tax receipts, survey sketch & resurvey FMB',
        'Possession certificate & Encumbrance Certificate (EC)',
      ],
      courtForum: 'District & Sessions Court, Sub Courts & Munsiff Courts',
    },
    {
      id: 'criminal-defence',
      title: 'Criminal Defence & Bail',
      iconName: 'ShieldCheck',
      summary:
        'Immediate courtroom representation for regular bail, anticipatory bail, trial defense, and criminal revisions across Trivandrum courts.',
      points: [
        'Urgent regular & anticipatory bail applications',
        'Sessions & Magistrate Court trial representation',
        'Section 138 NI Act (cheque dishonor cases)',
        'Compounding of offenses & private complaints',
      ],
      documentsNeeded: [
        'FIR copy, police charge sheet or court summons',
        'Bail notices or station communications',
        'Surety documentation & identity credentials',
      ],
      courtForum: 'Sessions Court & Chief Judicial Magistrate (CJM)',
    },
    {
      id: 'notary-services',
      title: 'Notary Public Services',
      iconName: 'Gavel',
      summary:
        'Government-appointed Notary Public executing prompt, legally compliant statutory authentications, deeds, affidavits, and foreign visa attestations.',
      points: [
        'General & Special Power of Attorney (GPA / SPA)',
        'Court, embassy & educational affidavits',
        'Commercial contracts & bank guarantee attestation',
        'Certified true copy desk authentications',
      ],
      documentsNeeded: [
        'Original documents requiring notarial certification',
        'Valid government photo identification',
        'Two passport size photographs',
      ],
      courtForum: 'Central Govt. Notary Desk, The Dominant Law Chambers',
    },
  ],

  highlights: [
    {
      id: 'hl-1',
      title: 'Courtroom Mastery',
      metric: '25+',
      description:
        'Decades of active representation across District Courts, Family Courts, MACT, and the High Court of Kerala.',
      subtext: ['Thiruvananthapuram District Judiciary', 'High Court of Kerala & Tribunals'],
    },
    {
      id: 'hl-2',
      title: 'Family Court Settlements',
      metric: '85%+',
      description:
        'High rate of favorable decrees and amicable out-of-court family settlements, protecting client dignity and child welfare.',
      subtext: ['Matrimonial Mediation', 'Alimony & Custody Agreements'],
    },
    {
      id: 'hl-3',
      title: 'Statutory Notarization',
      metric: '100%',
      description:
        'Government-authorized Notary Public providing prompt, strictly compliant legal validation at Dominant Towers, Vanchiyoor.',
      subtext: ['Central Notarial Registry', 'Immediate Desk Attestations'],
    },
  ],

  whyChooseUs: [
    {
      id: 'w-1',
      title: 'Comprehensive Legal Mastery',
      description:
        'Deep command of civil, criminal, family court, motor accident, and service jurisprudence across Kerala courts.',
      iconName: 'Scale',
    },
    {
      id: 'w-2',
      title: 'Family Court Specialization',
      description:
        'Primary chamber focus: sensitive, tactical matrimonial advocacy that shields children and protects financial rights.',
      iconName: 'Users',
    },
    {
      id: 'w-3',
      title: 'Proven Judicial Record',
      description:
        'Over 25 years of commanding courtroom presence backed by hundreds of successfully argued matters and settlements.',
      iconName: 'Award',
    },
    {
      id: 'w-4',
      title: 'Integrity & Clear Prognosis',
      description:
        'Honest assessment of legal prospects, transparent fees, and unwavering dedication to genuine client welfare.',
      iconName: 'ShieldCheck',
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
