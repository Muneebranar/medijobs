import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import { Application } from '../models/Application.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedJobs = [
  {
    id: 'med-job-101',
    title: 'Chief Interventional Cardiologist',
    hospital: 'Johns Hopkins Medicine',
    hospitalLogo: 'JHM',
    hospitalType: 'Academic Medical Center (Magnet Designated)',
    department: 'Cardiovascular Institute & Catheterization Lab',
    category: 'clinical-doctors',
    location: { city: 'Baltimore', state: 'MD', country: 'United States', isRemoteOrHybrid: false },
    shiftType: 'On-Call & Weekend',
    employmentType: 'Full-Time',
    experienceLevel: 'Senior Consultant / Department Head',
    salary: { min: 420000, max: 560000, period: 'year', currency: 'USD' },
    signOnBonus: '$50,000 Signing Incentive',
    urgent: true,
    verifiedHospital: true,
    tier: 'urgent',
    postedDate: '2026-09-22',
    applicantCount: 14,
    description: 'Lead our high-volume Level 1 Cardiac Emergency Catheterization Center performing complex PCI, TAVR, MitraClip, and mechanical circulatory support implantations.',
    responsibilities: [
      'Lead tertiary cardiovascular catheterization laboratory procedures.',
      'Supervise cardiology fellowship trainees and direct clinical bedside teaching.',
      'Maintain door-to-balloon quality metrics under 60 minutes.',
      'Participate in rotational STEMI 24/7 call schedules.'
    ],
    requirements: [
      'MD or DO from accredited medical school with fellowship in Interventional Cardiology.',
      'Active Board Certification in Internal Medicine and Cardiovascular Disease.',
      'Minimum 7+ years of post-fellowship interventional cath lab clinical leadership.'
    ],
    licensuresRequired: ['Active Maryland State Medical License', 'Federal DEA Registration', 'ACLS/BLS Provider'],
    benefits: ['Top-tier clinical compensation with RVU incentives', 'Lifetime malpractice tail coverage', '$7,500 Annual CME', '403(b) with 8% match', 'Relocation allowance up to $25,000'],
    workingHours: 'Scheduled cath lab blocks (4 days/wk) + 1:5 rotational call',
    aboutHospital: 'Johns Hopkins Medicine is a world-renowned health enterprise consistently ranked among the top hospitals globally.',
    contactEmail: 'physician-careers@jhmi.edu',
    visaSponsorship: true,
    malpracticeCoverage: 'Comprehensive $1M/$3M with Lifetime Tail',
    cmeAllowance: '$7,500/year'
  },
  {
    id: 'med-job-102',
    title: 'Lead ICU / Critical Care Charge Nurse',
    hospital: 'Mayo Clinic',
    hospitalLogo: 'MAYO',
    hospitalType: 'Trauma Level 1 Academic Medical Center',
    department: 'Medical & Surgical Intensive Care Unit (MICU/SICU)',
    category: 'nursing',
    location: { city: 'Rochester', state: 'MN', country: 'United States', isRemoteOrHybrid: false },
    shiftType: 'Night Shift (12h)',
    employmentType: 'Full-Time',
    experienceLevel: 'Mid-Career Specialist',
    salary: { min: 118000, max: 145000, period: 'year', currency: 'USD' },
    signOnBonus: '$20,000 Sign-on Bonus',
    urgent: true,
    verifiedHospital: true,
    tier: 'featured',
    postedDate: '2026-09-23',
    applicantCount: 28,
    description: 'Direct bedside clinical care in our 36-bed state-of-the-art Medical-Surgical ICU managing ECMO, CRRT, and mechanical ventilation.',
    responsibilities: [
      'Direct bedside nursing for critically ill patients requiring advanced hemodynamic monitoring.',
      'Serve as Unit Charge Nurse during night shifts, orchestrating patient flow and code triage.',
      'Uphold strict infection prevention protocols and CAUTI/CLABSI zero-harm standards.'
    ],
    requirements: [
      'BSN required; MSN preferred.',
      'Minimum 4+ years of adult ICU or trauma critical care bedside experience.',
      'Active Critical Care Registered Nurse (CCRN) certification.'
    ],
    licensuresRequired: ['Minnesota Registered Nurse (RN) License or Compact License', 'ACLS', 'PALS'],
    benefits: ['Night shift differential ($7.50/hr)', 'Tuition reimbursement up to $8,000/yr', 'Zero-deductible network medical care', 'Pension plan + 403(b)'],
    workingHours: 'Three 12-hour night shifts (7:00 PM - 7:30 AM), rotating weekends',
    aboutHospital: 'Mayo Clinic has been recognized as the #1 Hospital in the Nation for numerous consecutive years.',
    contactEmail: 'nursing-talent@mayoclinic.org',
    visaSponsorship: true,
    malpracticeCoverage: 'Institutional Liability Protection',
    cmeAllowance: '$3,500/year'
  },
  {
    id: 'med-job-103',
    title: 'Senior Neuro-Radiologist & MRI Specialist',
    hospital: 'Cleveland Clinic',
    hospitalLogo: 'CCF',
    hospitalType: 'Specialty & Tertiary Referral Center',
    department: 'Imaging Institute & Neurological Diagnostic Center',
    category: 'diagnostics',
    location: { city: 'Cleveland', state: 'OH', country: 'United States', isRemoteOrHybrid: true },
    shiftType: 'Day Shift (8h)',
    employmentType: 'Full-Time',
    experienceLevel: 'Mid-Career Specialist',
    salary: { min: 390000, max: 480000, period: 'year', currency: 'USD' },
    signOnBonus: '$35,000 Relocation & Incentive',
    urgent: false,
    verifiedHospital: true,
    tier: 'featured',
    postedDate: '2026-09-20',
    applicantCount: 9,
    description: 'Interpret advanced 3T/7T functional MRI, CT perfusion, diffusion tensor imaging, and stroke angiography. Hybrid PACS tele-workstation options available.',
    responsibilities: [
      'Interpret complex neuro-imaging studies: brain MRI, spine reconstruction, fMRI.',
      'Conduct multidisciplinary tumor board reviews and neuro-vascular stroke emergency reviews.',
      'Consult with neurosurgeons and neuro-oncologists on stereotactic radiation planning.'
    ],
    requirements: [
      'MD/DO with Diagnostic Radiology residency and 1-year Neuroradiology Fellowship.',
      'American Board of Radiology (ABR) certified or board-eligible with CAQ.',
      'Demonstrated diagnostic volume efficiency and high accuracy benchmarks.'
    ],
    licensuresRequired: ['Ohio State Medical Board License', 'DEA Certificate', 'BLS'],
    benefits: ['Hybrid: 3 days on-campus + 2 days remote PACS', 'Full malpractice coverage with tail', '$6,000 Annual CME stipend', '401(a) and 457(b) match'],
    workingHours: 'Monday - Friday (8:00 AM - 4:30 PM), minimal nighthawk backup',
    aboutHospital: 'Cleveland Clinic is a nonprofit multispecialty academic medical center that integrates clinical care with research and education.',
    contactEmail: 'radiology-recruitment@ccf.org',
    visaSponsorship: true,
    malpracticeCoverage: 'Comprehensive with Prior Acts & Tail',
    cmeAllowance: '$6,000/year'
  },
  {
    id: 'med-job-104',
    title: 'Lead Clinical Oncology Pharmacist',
    hospital: 'Memorial Sloan Kettering Cancer Center',
    hospitalLogo: 'MSK',
    hospitalType: 'National Comprehensive Cancer Center (NCI)',
    department: 'Department of Pharmacy & Cellular Therapeutics',
    category: 'pharmacy',
    location: { city: 'New York', state: 'NY', country: 'United States', isRemoteOrHybrid: false },
    shiftType: 'Day Shift (8h)',
    employmentType: 'Full-Time',
    experienceLevel: 'Mid-Career Specialist',
    salary: { min: 155000, max: 188000, period: 'year', currency: 'USD' },
    signOnBonus: '$15,000 Sign-on Bonus',
    urgent: false,
    verifiedHospital: true,
    tier: 'standard',
    postedDate: '2026-09-18',
    applicantCount: 19,
    description: 'Oversee therapeutic dosing of complex antineoplastic regimens, CAR-T cell immunotherapies, and supportive care for inpatient hematology-oncology patients.',
    responsibilities: [
      'Provide comprehensive pharmacotherapy evaluations for adult inpatient oncology and bone marrow transplant patients.',
      'Verify investigational antineoplastic chemotherapy orders in clinical trial protocols.',
      'Monitor therapeutic drug levels, renal dosage adjustments, and acute toxicities.'
    ],
    requirements: [
      'PharmD from an ACPE-accredited college of pharmacy.',
      'PGY1 Pharmacy Residency plus PGY2 Oncology Residency.',
      'Board Certified Oncology Pharmacist (BCOP) credential highly desired.'
    ],
    licensuresRequired: ['New York State Pharmacist License', 'BCOP Certification', 'BLS'],
    benefits: ['Competitive NYC salary with clinical incentive bonuses', 'MSK defined contribution pension', '24 vacation days + 12 holidays', 'Subsidized transit pass'],
    workingHours: 'Monday - Friday (8:30 AM - 5:00 PM), 1-in-6 weekend rotation',
    aboutHospital: 'Memorial Sloan Kettering is the world’s oldest and largest private cancer center committed to exceptional patient care.',
    contactEmail: 'pharmacy-careers@mskcc.org',
    visaSponsorship: true,
    malpracticeCoverage: 'Hospital Professional Liability',
    cmeAllowance: '$3,500/year'
  },
  {
    id: 'med-job-105',
    title: 'Senior Trauma & Emergency General Surgeon',
    hospital: 'King’s College Hospital',
    hospitalLogo: 'KCH',
    hospitalType: 'Major Trauma Centre & NHS Foundation Trust',
    department: 'Division of Emergency Surgery & Major Trauma',
    category: 'clinical-doctors',
    location: { city: 'London', state: 'Greater London', country: 'United Kingdom', isRemoteOrHybrid: false },
    shiftType: 'Rotational (Day/Night)',
    employmentType: 'Full-Time',
    experienceLevel: 'Senior Consultant / Department Head',
    salary: { min: 125000, max: 165000, period: 'year', currency: 'GBP' },
    signOnBonus: 'NHS Relocation Package',
    urgent: true,
    verifiedHospital: true,
    tier: 'urgent',
    postedDate: '2026-09-24',
    applicantCount: 8,
    description: 'Spearhead emergency surgical resuscitation for penetrating and blunt trauma, emergency laparotomies, and critical surgical care in a fast-paced tertiary setting.',
    responsibilities: [
      'Direct Major Trauma Team activations and deliver immediate operative damage control surgery.',
      'Perform acute emergency laparotomies, vascular control, and soft tissue reconstructions.',
      'Supervise surgical registrars and clinical fellows from King’s College London.'
    ],
    requirements: [
      'Full and specialist GMC registration with Licence to Practise (or eligible for CCT).',
      'FRCS (Gen Surg) or equivalent international qualification.',
      'Advanced fellowship in Major Trauma / Acute Care Surgery.'
    ],
    licensuresRequired: ['GMC Specialist Register for General Surgery', 'ATLS Provider/Instructor', 'Enhanced DBS'],
    benefits: ['NHS Consultant Contract with 10 Programmed Activities', 'NHS Pension Scheme', '32 days annual leave + 8 bank holidays', 'Study leave budget £1,500/yr'],
    workingHours: 'Rotational shift pattern covering daytime elective theater and night trauma call',
    aboutHospital: 'King’s College Hospital NHS Foundation Trust is one of London’s largest teaching hospitals with a world-renowned major trauma service.',
    contactEmail: 'trauma-recruitment@kch.nhs.uk',
    visaSponsorship: true,
    malpracticeCoverage: 'NHS Clinical Negligence Scheme for Trusts (CNST)',
    cmeAllowance: '£1,500/year'
  },
  {
    id: 'med-job-106',
    title: 'Critical Care Flight & Transport Registered Nurse',
    hospital: 'AirMed International & St. Jude Medical',
    hospitalLogo: 'STJ',
    hospitalType: 'Pediatric Specialty & Critical Transport',
    department: 'Critical Care Air Ambulance Transport Team',
    category: 'nursing',
    location: { city: 'Memphis', state: 'TN', country: 'United States', isRemoteOrHybrid: false },
    shiftType: 'Rotational (Day/Night)',
    employmentType: 'Full-Time',
    experienceLevel: 'Mid-Career Specialist',
    salary: { min: 105000, max: 132000, period: 'year', currency: 'USD' },
    signOnBonus: '$18,000 Sign-on Bonus',
    urgent: true,
    verifiedHospital: true,
    tier: 'urgent',
    postedDate: '2026-09-21',
    applicantCount: 16,
    description: 'Deliver autonomous, protocol-driven emergency resuscitation, advanced airway management, and hemodynamic stabilization aboard ICU aircraft.',
    responsibilities: [
      'Provide advanced emergency nursing care in rotorcraft and long-range fixed-wing airborne intensive care.',
      'Execute emergency RSI intubations, chest tube management, and arterial line monitoring.',
      'Manage continuous infusion of inotropes, blood products, and ventilatory parameters.'
    ],
    requirements: ['BSN with minimum 3+ years emergency department or ICU experience.', 'CFRN or CTRN certification within 18 months.', 'Compliant with aviation weight restrictions.'],
    licensuresRequired: ['Multistate Compact RN License', 'BLS, ACLS, PALS, NRP', 'TPATC or ATLS Audit'],
    benefits: ['Modified 24h schedule (4 days off between cycles)', 'Flight pay differential + hazard insurance', 'Full flight gear allowance', '401(k) with 100% match up to 5%'],
    workingHours: '24-hour shift schedule (24 on / 72 off) with built-in rest periods',
    aboutHospital: 'St. Jude Children’s Research Hospital is leading the way the world understands, treats, and defeats childhood cancer.',
    contactEmail: 'flight-careers@stjude.org',
    visaSponsorship: true,
    malpracticeCoverage: 'Comprehensive Aviation & Medical Malpractice',
    cmeAllowance: '$3,000/year'
  }
];

export const seedCandidates = [
  {
    id: 'cand-001',
    name: 'Dr. Marcus Vance, MD, FACC',
    title: 'Board Certified Interventional Cardiologist',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=280',
    specialty: 'Cardiovascular Disease & Cath Lab Interventions',
    credentials: 'MD (Harvard), FACC, FSCAI',
    licenseNumber: 'PMC-MD-892401',
    licenseStatus: 'Verified Active',
    yearsExperience: 11,
    currentLocation: 'Boston, MA (Open to Relocation)',
    availability: '30 Days Notice',
    desiredSalary: '$480,000 / year',
    skills: ['Complex PCI', 'TAVR & MitraClip', 'Mechanical Circulatory Support', 'Intravascular Ultrasound (IVUS)', 'STEMI On-Call'],
    education: 'Harvard Medical School (MD) | Brigham and Women’s Hospital (Fellowship)',
    blurred: true
  },
  {
    id: 'cand-002',
    name: 'Elena Rostova, MSN, RN, CCRN',
    title: 'Lead Critical Care / ECMO Specialist Nurse',
    avatar: 'https://images.unsplash.com/photo-1594824813628-9844e3931649?auto=format&fit=crop&q=80&w=280',
    specialty: 'Intensive Care Unit (ICU) & Extracorporeal Support',
    credentials: 'MSN, BSN, CCRN, CMC',
    licenseNumber: 'RN-STATE-928174',
    licenseStatus: 'Verified Active',
    yearsExperience: 8,
    currentLocation: 'Chicago, IL (Midwest Preferred)',
    availability: 'Immediate (2 weeks)',
    desiredSalary: '$135,000 / year',
    skills: ['ECMO Cannula Management', 'CRRT Prismaflex', 'Ventilator Graphics', 'Rapid Response Team Leader'],
    education: 'University of Illinois at Chicago (MSN) | Rush University Medical Center (Residency)',
    blurred: true
  },
  {
    id: 'cand-003',
    name: 'Dr. Tariq Al-Mansoor, MD, FRCS',
    title: 'Consultant Trauma & Acute Care Surgeon',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=280',
    specialty: 'Emergency General Surgery & Trauma Resuscitation',
    credentials: 'MBBS, FRCS (Gen Surg), FACS',
    licenseNumber: 'GMC-SPEC-712903',
    licenseStatus: 'Verified Active',
    yearsExperience: 14,
    currentLocation: 'London, UK (Open to Gulf & US Visas)',
    availability: 'Open to Locum Tenens',
    desiredSalary: '£155,000 / $380,000',
    skills: ['Damage Control Laparotomy', 'Surgical Airway', 'Vascular Shunts', 'NELA Audits', 'ATLS Course Director'],
    education: 'Imperial College London (MBBS) | Royal College of Surgeons of England',
    blurred: true
  }
];

export async function runSeed() {
  const conn = await connectDB();
  if (!conn) {
    console.log('[Seed] MongoDB not online. Skipping live seed (data loaded into memory fallback).');
    return;
  }

  try {
    console.log('[Seed] Seeding MongoDB with clinical collections...');
    await Job.deleteMany({});
    await Job.insertMany(seedJobs);
    console.log(`[Seed] Seeded ${seedJobs.length} Jobs into MongoDB.`);

    await Candidate.deleteMany({});
    await Candidate.insertMany(seedCandidates);
    console.log(`[Seed] Seeded ${seedCandidates.length} Candidates into MongoDB.`);

    console.log('[Seed] Database initialization complete.');
  } catch (err) {
    console.error('[Seed Error]', err);
  } finally {
    await mongoose.connection.close();
  }
}

// If executed directly from CLI: node seed/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  runSeed().then(() => process.exit(0));
}
