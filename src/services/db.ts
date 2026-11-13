import { FamilyProfile, UserProfile, Medication, MedicalReport, Doctor } from '../types';
import { getProfile, getMedications, getReports, getDoctors } from '../utils/storage';

const DB_NAME = 'MedCardOS_DB';
const DB_VERSION = 1;
const ACTIVE_PROFILE_KEY = 'mc_active_profile_id';

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('profiles')) {
        const store = db.createObjectStore('profiles', { keyPath: 'id' });
        store.createIndex('isPrimary', 'isPrimary', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getActiveProfileId(): string {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'primary';
  } catch {
    return 'primary';
  }
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch (err) {
    console.error('Failed to set active profile id:', err);
  }
}

export async function saveProfile(profile: FamilyProfile): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      store.put(profile);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB saveProfile error:', err);
    return false;
  }
}

export async function getAllProfiles(): Promise<FamilyProfile[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const req = store.getAll();

      req.onsuccess = () => {
        const result = req.result as FamilyProfile[];
        if (result && result.length > 0) {
          resolve(result);
        } else {
          // Initialize with default primary profile from current localStorage data
          const defaultProfile = createDefaultPrimaryProfile();
          saveProfile(defaultProfile).then(() => resolve([defaultProfile]));
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('IndexedDB getAllProfiles error:', err);
    return [createDefaultPrimaryProfile()];
  }
}

export async function getActiveProfile(profileId?: string): Promise<FamilyProfile> {
  const targetId = profileId || getActiveProfileId();
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const req = store.get(targetId);

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as FamilyProfile);
        } else {
          // Fallback to primary or create default
          const defaultProfile = createDefaultPrimaryProfile();
          saveProfile(defaultProfile).then(() => resolve(defaultProfile));
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('IndexedDB getActiveProfile error:', err);
    return createDefaultPrimaryProfile();
  }
}

export async function deleteProfile(profileId: string): Promise<boolean> {
  if (profileId === 'primary') {
    console.warn('Cannot delete primary profile');
    return false;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profiles', 'readwrite');
      const store = tx.objectStore('profiles');
      store.delete(profileId);
      tx.oncomplete = () => {
        if (getActiveProfileId() === profileId) {
          setActiveProfileId('primary');
        }
        resolve(true);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('IndexedDB deleteProfile error:', err);
    return false;
  }
}

function createDefaultPrimaryProfile(): FamilyProfile {
  const currentProfile = getProfile();
  const currentMeds = getMedications();
  const currentReports = getReports();
  const currentDocs = getDoctors();

  return {
    id: 'primary',
    name: currentProfile.fullName || 'Self',
    relationship: 'Self',
    isPrimary: true,
    avatar: '👤',
    bloodGroup: currentProfile.bloodGroup || 'O+',
    allergies: currentProfile.allergies || ['Penicillin', 'Sulfa Drugs'],
    conditions: currentProfile.conditions || ['Hypertension'],
    profile: currentProfile,
    medications: currentMeds.length > 0 ? currentMeds : [
      {
        id: '1',
        name: 'Telmisartan 40mg',
        dose: '1 tablet (40mg)',
        freq: 'OD',
        tod: 'morning',
        time: '08:00',
        cond: 'Hypertension',
        stock: 30
      }
    ],
    reports: currentReports,
    doctors: currentDocs,
    createdAt: new Date().toISOString()
  };
}
