import { UserProfile, Medication, MedicalReport, Doctor, VitalRecord, VaccinationRecord, InsuranceRecord } from '../types';

export const BLANK_PROFILE: UserProfile = {
  id: 'EMC-00001',
  fullName: '',
  dob: '',
  gender: 'Other',
  bloodGroup: 'Unknown',
  weight: '',
  allergies: [],
  conditions: [],
  organDonor: false,
  insurancePolicy: '',
  emergencyNotes: '',
  contacts: []
};

export const SAMPLE_PROFILE: UserProfile = {
  id: 'EMC-A1B2C',
  fullName: 'Meera Joshi',
  dob: '1966-08-14',
  gender: 'Female',
  bloodGroup: 'B+',
  weight: '62',
  allergies: ['Penicillin', 'Sulfa drugs', 'Peanuts (Groundnut)'],
  conditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension (High BP)', 'Hypothyroidism'],
  organDonor: true,
  insurancePolicy: 'Star Health Optima #SH-8842109',
  emergencyNotes: 'Carries emergency candy for hypoglycemia. Sensitive to NSAIDs.',
  contacts: [
    {
      id: 'c1',
      name: 'Dr. Kavya Joshi',
      phone: '+91 9840012345',
      relationship: 'Daughter (Physician)',
      isPrimary: true,
      isMasked: false
    },
    {
      id: 'c2',
      name: 'Rajesh Joshi',
      phone: '+91 9840054321',
      relationship: 'Spouse',
      isPrimary: false,
      isMasked: false
    }
  ]
};

// Calculate dates relative to today for realistic expiry demos
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1-indexed

const formatMonth = (y: number, m: number) => {
  const adjustedYear = y + Math.floor((m - 1) / 12);
  const adjustedMonth = ((m - 1) % 12) + 1;
  return `${adjustedYear}-${String(adjustedMonth).padStart(2, '0')}`;
};

export const SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: 'm1',
    name: 'Metformin 500mg',
    genericName: 'Metformin',
    dose: '1 tablet with dinner',
    freq: 'BD',
    tod: 'night',
    time: '20:30',
    cond: 'Type 2 Diabetes Mellitus',
    barcode: '8901030843752',
    expiryDate: formatMonth(currentYear, currentMonth + 8),
    stock: 24,
    notes: 'Take after meals to avoid GI upset'
  },
  {
    id: 'm2',
    name: 'Telma 40 (Telmisartan)',
    genericName: 'Telmisartan',
    dose: '1 tablet in morning',
    freq: 'OD',
    tod: 'morning',
    time: '08:00',
    cond: 'Essential Hypertension (High BP)',
    barcode: '8901117210118',
    expiryDate: formatMonth(currentYear, currentMonth + 14),
    stock: 18,
    notes: 'Check BP weekly'
  },
  {
    id: 'm3',
    name: 'Thyronorm 50mcg',
    genericName: 'Levothyroxine',
    dose: '1 tablet empty stomach',
    freq: 'OD',
    tod: 'morning',
    time: '06:30',
    cond: 'Hypothyroidism',
    barcode: '8901086001201',
    expiryDate: formatMonth(currentYear, currentMonth), // Expiring this month!
    stock: 4,
    notes: 'Wait 45 mins before tea/coffee'
  },
  {
    id: 'm4',
    name: 'Dolo 650 (Paracetamol)',
    genericName: 'Paracetamol',
    dose: '1 tablet SOS for fever/pain',
    freq: 'PRN',
    tod: 'any',
    time: '14:00',
    cond: 'Pain & Fever',
    barcode: '8901148212136',
    expiryDate: formatMonth(currentYear, currentMonth - 1), // Expired!
    stock: 6,
    notes: 'Max 3 tablets in 24 hours'
  }
];

export const SAMPLE_REPORTS: MedicalReport[] = [
  {
    id: 'r1',
    title: 'Comprehensive Metabolic & Lipid Panel',
    cat: 'blood',
    date: '2025-01-18',
    doctor: 'Metropolis Diagnostics',
    notes: 'HbA1c slightly elevated at 7.2%. Fasting sugar well controlled.',
    btData: [
      {
        g: 'Blood Sugar & Glycemic Control',
        results: [
          { n: 'Fasting Blood Sugar (FBS)', u: 'mg/dL', mn: 70, mx: 99, val: '112', status: 'high' },
          { n: 'HbA1c (Glycated Hemoglobin)', u: '%', mn: 4.0, mx: 5.6, val: '7.2', status: 'high' }
        ]
      },
      {
        g: 'Lipid Profile',
        results: [
          { n: 'Total Cholesterol', u: 'mg/dL', mn: 125, mx: 200, val: '178', status: 'normal' },
          { n: 'HDL Cholesterol (Good)', u: 'mg/dL', mn: 40, mx: 60, val: '48', status: 'normal' },
          { n: 'LDL Cholesterol (Bad)', u: 'mg/dL', mn: 0, mx: 100, val: '94', status: 'normal' },
          { n: 'Triglycerides', u: 'mg/dL', mn: 50, mx: 150, val: '138', status: 'normal' }
        ]
      },
      {
        g: 'Thyroid Profile (TFT)',
        results: [
          { n: 'TSH (Thyroid Stimulating)', u: 'μIU/mL', mn: 0.4, mx: 4.2, val: '2.8', status: 'normal' }
        ]
      }
    ]
  },
  {
    id: 'r2',
    title: 'CBC & Kidney Function Report',
    cat: 'blood',
    date: '2024-11-10',
    doctor: 'Apollo Diagnostics',
    notes: 'Normal kidney markers and hemoglobin.',
    btData: [
      {
        g: 'Complete Blood Count (CBC)',
        results: [
          { n: 'Hemoglobin (Hb)', u: 'g/dL', mn: 12.0, mx: 17.5, val: '13.4', status: 'normal' },
          { n: 'WBC Count (TLC)', u: 'cells/cu.mm', mn: 4000, mx: 11000, val: '6800', status: 'normal' },
          { n: 'Platelet Count', u: 'lakh/cu.mm', mn: 1.5, mx: 4.5, val: '2.4', status: 'normal' }
        ]
      },
      {
        g: 'Kidney Function Test (RFT / KFT)',
        results: [
          { n: 'Serum Creatinine', u: 'mg/dL', mn: 0.6, mx: 1.2, val: '0.85', status: 'normal' },
          { n: 'Blood Urea', u: 'mg/dL', mn: 15, mx: 40, val: '24', status: 'normal' }
        ]
      }
    ]
  }
];

export const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Suresh Gupta, MD',
    spec: 'Consultant Cardiologist & Diabetologist',
    phone: '+91 9840011223',
    hosp: 'Apollo Hospitals, Chennai',
    addr: 'Greams Road, Thousand Lights, Chennai',
    email: 'suresh.gupta@apollo.in',
    notes: 'Review appointment every 3 months. Next: April 2025'
  },
  {
    id: 'd2',
    name: 'Dr. Anita Roy, MD (Endocrinology)',
    spec: 'Endocrinologist & Thyroid Specialist',
    phone: '+91 9840077889',
    hosp: 'Fortis Malar Hospital',
    addr: 'Gandhi Nagar, Adyar, Chennai',
    email: 'anita.roy@fortishealthcare.com',
    notes: 'Monitor TSH levels twice a year.'
  }
];

export const SAMPLE_VITALS: VitalRecord[] = [
  {
    id: 'v1',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    type: 'bp',
    systolic: 132,
    diastolic: 84,
    notes: 'Morning reading before Telma 40'
  },
  {
    id: 'v2',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    type: 'bp',
    systolic: 126,
    diastolic: 82,
    notes: 'Post evening walk'
  },
  {
    id: 'v3',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    type: 'bp',
    systolic: 122,
    diastolic: 80,
    notes: 'Optimal control'
  },
  {
    id: 'v4',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    type: 'sugar',
    sugarValue: 124,
    sugarType: 'fasting',
    notes: 'Fasting blood glucose'
  },
  {
    id: 'v5',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    type: 'sugar',
    sugarValue: 112,
    sugarType: 'fasting',
    notes: 'Fasting blood glucose'
  },
  {
    id: 'v6',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    type: 'spo2',
    spo2: 98,
    notes: 'Room air'
  },
  {
    id: 'v7',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    type: 'pulse',
    pulse: 72,
    notes: 'Resting pulse'
  },
  {
    id: 'v8',
    profileId: 'EMC-A1B2C',
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    type: 'weight',
    weight: 62.4,
    notes: 'Weekly weigh-in'
  }
];

export const SAMPLE_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac-1',
    profileId: 'EMC-A1B2C',
    vaccineName: 'COVID-19 Booster (Covishield / Spikevax)',
    category: 'adult',
    administeredDate: '2023-04-12',
    doseNumber: 'Precaution / Booster Dose',
    clinic: 'Apollo Medical Centre',
    batchNumber: 'COV-88491-B',
    notes: 'No adverse reaction reported'
  },
  {
    id: 'vac-2',
    profileId: 'EMC-A1B2C',
    vaccineName: 'Pneumococcal (Pneumonia) PCV13',
    category: 'geriatric',
    administeredDate: '2022-10-18',
    dueDate: '2027-10-18',
    doseNumber: 'Single Lifetime Dose',
    clinic: 'Fortis Malar Hospital',
    notes: 'Recommended for diabetic & hypertension patients'
  },
  {
    id: 'vac-3',
    profileId: 'EMC-A1B2C',
    vaccineName: 'Annual Influenza (Flu) Shot',
    category: 'geriatric',
    administeredDate: '2024-09-05',
    dueDate: '2025-09-05',
    doseNumber: 'Annual Seasonal Flu',
    clinic: 'Metropolis Clinic'
  }
];

export const SAMPLE_INSURANCE: InsuranceRecord = {
  id: 'ins-1',
  profileId: 'EMC-A1B2C',
  provider: 'Star Health & Allied Insurance Co.',
  policyNumber: 'SH-8842109-2025',
  memberId: 'MEM-IN-49201',
  tpaName: 'Medi Assist Healthcare TPA',
  helpline: '1800-425-2255',
  validTill: '2027-03-31',
  notes: 'Includes Cashless Hospitalization & Senior Floater Sum Insured: ₹10,00,000'
};
