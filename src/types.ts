export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  isMasked?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  weight: string;
  photo?: string;
  allergies: string[];
  conditions: string[];
  contacts: EmergencyContact[];
  organDonor?: boolean;
  insurancePolicy?: string;
  emergencyNotes?: string;
}

export interface Medication {
  id: string | number;
  name: string;
  genericName?: string;
  dose: string;
  freq: string; // 'OD' (Once daily), 'BD' (Twice daily), 'TDS' (Thrice daily), 'QID', 'PRN' (As needed), 'SOS'
  tod: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
  time: string; // HH:MM
  cond?: string;
  barcode?: string;
  expiryDate?: string; // YYYY-MM
  stock?: number;
  daysSupply?: number; // Days of supply remaining
  refillDate?: string; // Calculated or manual refill date
  notes?: string;
  takenToday?: boolean;
}

export interface VitalRecord {
  id: string;
  profileId: string;
  timestamp: string; // ISO string
  type: 'bp' | 'sugar' | 'spo2' | 'pulse' | 'weight';
  systolic?: number;
  diastolic?: number;
  sugarValue?: number;
  sugarType?: 'fasting' | 'post-prandial' | 'random';
  pulse?: number;
  spo2?: number;
  weight?: number;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  profileId: string;
  vaccineName: string;
  category: 'pediatric' | 'adult' | 'geriatric' | 'travel';
  administeredDate: string;
  dueDate?: string;
  doseNumber?: string;
  batchNumber?: string;
  clinic?: string;
  notes?: string;
}

export interface InsuranceRecord {
  id: string;
  profileId: string;
  provider: string;
  policyNumber: string;
  memberId: string;
  tpaName?: string;
  helpline?: string;
  cardImageFront?: string;
  cardImageBack?: string;
  validTill?: string;
  notes?: string;
}

export interface BloodTestResult {
  n: string; // Name
  u: string; // Unit
  mn: number; // Min
  mx: number; // Max
  val: string; // User value
  status?: 'normal' | 'low' | 'high';
  refRange?: string;
}

export interface BloodTestGroupData {
  g: string; // Group Name
  results: BloodTestResult[];
}

export interface MedicalReport {
  id: string;
  title: string;
  cat: 'blood' | 'prescription' | 'radiology' | 'discharge' | 'other';
  date: string;
  doctor?: string;
  notes?: string;
  file?: string; // base64 or object URL
  fileType?: string;
  btData?: BloodTestGroupData[];
}

export interface Doctor {
  id: string;
  name: string;
  spec: string;
  phone: string;
  hosp?: string;
  addr?: string;
  email?: string;
  notes?: string;
}

export interface ParsedOcrData {
  bloodTests: { groupName: string; tests: BloodTestResult[] }[];
  medications: Partial<Medication>[];
  date: string;
  doctorOrLab: string;
  rawText: string;
}

export interface SeniorModeConfig {
  isSeniorMode: boolean;
  fontSize: 'standard' | 'large' | 'extra-large';
  speechNarration: boolean;
}

export interface FamilyProfile {
  id: string;
  name: string;
  relationship: string; // 'Self', 'Mother', 'Father', 'Spouse', 'Child', 'Grandparent', etc.
  isPrimary: boolean;
  avatar?: string;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  profile: UserProfile;
  medications: Medication[];
  reports: MedicalReport[];
  doctors: Doctor[];
  vitals?: VitalRecord[];
  vaccinations?: VaccinationRecord[];
  insurance?: InsuranceRecord;
  createdAt?: string;
}


