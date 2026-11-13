import { UserProfile, Medication, MedicalReport, Doctor, VitalRecord, VaccinationRecord, InsuranceRecord } from '../types';
import {
  SAMPLE_PROFILE,
  SAMPLE_MEDICATIONS,
  SAMPLE_REPORTS,
  SAMPLE_DOCTORS,
  SAMPLE_VITALS,
  SAMPLE_VACCINATIONS,
  SAMPLE_INSURANCE,
  BLANK_PROFILE
} from '../data/sampleData';

const PREFIX = 'mc_';

export const Storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      console.error('Storage quota exceeded or storage unavailable');
      return false;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  }
};

export const getProfile = (): UserProfile => {
  return Storage.get<UserProfile>('profile', SAMPLE_PROFILE);
};
export const saveProfile = (p: UserProfile): boolean => Storage.set('profile', p);

export const getMedications = (): Medication[] => {
  return Storage.get<Medication[]>('meds', SAMPLE_MEDICATIONS);
};
export const saveMedications = (m: Medication[]): boolean => Storage.set('meds', m);

export const getReports = (): MedicalReport[] => {
  return Storage.get<MedicalReport[]>('reports', SAMPLE_REPORTS);
};
export const saveReports = (r: MedicalReport[]): boolean => Storage.set('reports', r);

export const getDoctors = (): Doctor[] => {
  return Storage.get<Doctor[]>('doctors', SAMPLE_DOCTORS);
};
export const saveDoctors = (d: Doctor[]): boolean => Storage.set('doctors', d);

export const getVitals = (): VitalRecord[] => Storage.get<VitalRecord[]>('vitals', SAMPLE_VITALS);
export const saveVitals = (v: VitalRecord[]): boolean => Storage.set('vitals', v);

export const getVaccinations = (): VaccinationRecord[] => Storage.get<VaccinationRecord[]>('vaccinations', SAMPLE_VACCINATIONS);
export const saveVaccinations = (vc: VaccinationRecord[]): boolean => Storage.set('vaccinations', vc);

export const getInsurance = (): InsuranceRecord | undefined => Storage.get<InsuranceRecord | undefined>('insurance', SAMPLE_INSURANCE);
export const saveInsurance = (ins?: InsuranceRecord): boolean => Storage.set('insurance', ins);

export const getPin = (): string | null => localStorage.getItem(PREFIX + 'pin');
export const savePin = (pin: string | null): void => {
  if (pin) localStorage.setItem(PREFIX + 'pin', pin);
  else localStorage.removeItem(PREFIX + 'pin');
};

export const exportAllDataJSON = (): string => {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    profile: getProfile(),
    medications: getMedications(),
    reports: getReports(),
    doctors: getDoctors(),
    vitals: getVitals(),
    vaccinations: getVaccinations(),
    insurance: getInsurance()
  };
  return JSON.stringify(data, null, 2);
};

export const importAllDataJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) saveProfile(data.profile);
    if (data.medications) saveMedications(data.medications);
    if (data.reports) saveReports(data.reports);
    if (data.doctors) saveDoctors(data.doctors);
    if (data.vitals) saveVitals(data.vitals);
    if (data.vaccinations) saveVaccinations(data.vaccinations);
    if (data.insurance) saveInsurance(data.insurance);
    return true;
  } catch (err) {
    console.error('Failed to import JSON', err);
    return false;
  }
};

export const resetToSampleData = (): void => {
  saveProfile(SAMPLE_PROFILE);
  saveMedications(SAMPLE_MEDICATIONS);
  saveReports(SAMPLE_REPORTS);
  saveDoctors(SAMPLE_DOCTORS);
  saveVitals(SAMPLE_VITALS);
  saveVaccinations(SAMPLE_VACCINATIONS);
  saveInsurance(SAMPLE_INSURANCE);
};

export const clearAllData = (): void => {
  const keys = ['profile', 'meds', 'reports', 'doctors', 'vitals', 'vaccinations', 'insurance', 'pin'];
  keys.forEach(k => Storage.remove(k));
  saveProfile(BLANK_PROFILE);
  saveMedications([]);
  saveReports([]);
  saveDoctors([]);
  saveVitals([]);
  saveVaccinations([]);
  saveInsurance(undefined);
  savePin(null);
  // Clear dose notification trackers if any in localStorage
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mc_dose_notif_')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage errors
  }
};

export const genId = (prefix = 'ID'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

export const calcAge = (dob: string): number | null => {
  if (!dob) return null;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const maskPhone = (phone: string, shouldMask = false): string => {
  if (!shouldMask || !phone) return phone;
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length < 7) return phone;
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-3);
  return `${start}••••${end}`;
};

export const expiryStatus = (exp?: string): { cls: 'exp' | 'warn' | 'safe'; label: string; days: number } | null => {
  if (!exp) return null;
  // exp is YYYY-MM
  const expDate = new Date(exp + '-01');
  // End of that month
  expDate.setMonth(expDate.getMonth() + 1);
  expDate.setDate(0);

  const now = new Date();
  const days = Math.round((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { cls: 'exp', label: '⛔ Expired', days };
  }
  if (days <= 30) {
    return { cls: 'warn', label: `⚠️ ${days}d left`, days };
  }
  return { cls: 'safe', label: `✓ ${exp}`, days };
};
