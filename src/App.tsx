import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Pill,
  FileText,
  Stethoscope,
  Settings as SettingsIcon,
  AlertOctagon,
  AlertTriangle,
  Glasses,
  HeartPulse,
  Activity,
  Globe
} from 'lucide-react';
import {
  UserProfile,
  Medication,
  MedicalReport,
  Doctor,
  ParsedOcrData,
  VitalRecord,
  VaccinationRecord,
  InsuranceRecord
} from './types';
import {
  getProfile,
  saveProfile,
  getMedications,
  saveMedications,
  getReports,
  saveReports,
  getDoctors,
  saveDoctors,
  getVitals,
  saveVitals,
  getVaccinations,
  saveVaccinations,
  getInsurance,
  saveInsurance,
  getPin,
  expiryStatus
} from './utils/storage';
import { playAlarmTone, playDoseChime } from './utils/audio';
import { getSeniorModeConfig, saveSeniorModeConfig } from './utils/seniorMode';
import { speakText } from './utils/speech';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLocale } from './utils/i18n';

// Primary Views
import { CardView } from './components/CardView';
import { MedsView } from './components/MedsView';
import { ReportsView } from './components/ReportsView';
import { DoctorsView } from './components/DoctorsView';
import { SettingsView } from './components/SettingsView';
import { HealthHubView } from './components/HealthHubView';

// Modals & Overlays
import { SosOverlay } from './components/SosOverlay';
import { PinPadModal } from './components/PinPadModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ExpiryAlarmModal } from './components/ExpiryAlarmModal';
import { AiOcrConfirmModal } from './components/AiOcrConfirmModal';
import { BloodTestModal } from './components/BloodTestModal';
import { ReportViewerModal } from './components/ReportViewerModal';
import { OutOfRangeModal } from './components/OutOfRangeModal';
import { FirstResponderView } from './components/FirstResponderView';
import { EmergencyPhraseCarousel } from './components/EmergencyPhraseCarousel';

export default function App() {
  const { t, currentLang, setLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState<'card' | 'meds' | 'health' | 'reports' | 'docs' | 'settings'>('card');

  // Senior Citizen Accessibility Mode State
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => getSeniorModeConfig().isSeniorMode);

  // Single User Application Data States
  const [profile, setProfile] = useState<UserProfile>(getProfile);
  const [meds, setMeds] = useState<Medication[]>(getMedications);
  const [reports, setReports] = useState<MedicalReport[]>(getReports);
  const [doctors, setDoctors] = useState<Doctor[]>(getDoctors);
  const [vitals, setVitals] = useState<VitalRecord[]>(getVitals);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(getVaccinations);
  const [insurance, setInsurance] = useState<InsuranceRecord | undefined>(getInsurance);

  const handleSaveVitals = (records: VitalRecord[]) => {
    setVitals(records);
    saveVitals(records);
  };

  const handleSaveVaccinations = (records: VaccinationRecord[]) => {
    setVaccinations(records);
    saveVaccinations(records);
  };

  const handleSaveInsurance = (record?: InsuranceRecord) => {
    setInsurance(record);
    saveInsurance(record);
  };

  // Modal Control States
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isBloodTestModalOpen, setIsBloodTestModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<MedicalReport | null>(null);
  const [isOutOfRangeModalOpen, setIsOutOfRangeModalOpen] = useState(false);
  const [outOfRangeFilterReportId, setOutOfRangeFilterReportId] = useState<string | null>(null);
  const [isFirstResponderOpen, setIsFirstResponderOpen] = useState<boolean>(false);
  const [isPhrasesOpen, setIsPhrasesOpen] = useState<boolean>(false);

  // Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerCallback, setScannerCallback] = useState<((code: string, medInfo?: any) => void) | null>(null);

  // OCR Modal
  const [ocrData, setOcrData] = useState<ParsedOcrData | null>(null);
  const [ocrImage, setOcrImage] = useState<string | undefined>(undefined);

  // Expiry Alarm Modal
  const [isExpiryAlarmOpen, setIsExpiryAlarmOpen] = useState(false);
  const [expiredMedsList, setExpiredMedsList] = useState<Medication[]>([]);

  // PIN Pad Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'verify' | 'setup'>('verify');
  const [pinOnSuccess, setPinOnSuccess] = useState<(() => void) | null>(null);

  // Sync senior mode class with document body
  useEffect(() => {
    if (isSeniorMode) {
      document.body.classList.add('senior-mode-active');
    } else {
      document.body.classList.remove('senior-mode-active');
    }
    saveSeniorModeConfig({ isSeniorMode });
  }, [isSeniorMode]);

  const handleToggleSeniorMode = () => {
    setIsSeniorMode(prev => {
      const next = !prev;
      saveSeniorModeConfig({ isSeniorMode: next });
      return next;
    });
  };

  // Reload all states from storage helper
  const reloadData = () => {
    setProfile(getProfile());
    setMeds(getMedications());
    setReports(getReports());
    setDoctors(getDoctors());
    setVitals(getVitals());
    setVaccinations(getVaccinations());
    setInsurance(getInsurance());
  };

  // 1. Initial Expiry Alarm Check on Startup
  useEffect(() => {
    const expiredOrSoon = meds.filter((m) => {
      const s = expiryStatus(m.expiryDate);
      return s && (s.cls === 'exp' || s.cls === 'warn');
    });

    if (expiredOrSoon.length > 0) {
      setExpiredMedsList(expiredOrSoon);
      const timer = setTimeout(() => {
        setIsExpiryAlarmOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 2. Periodic Expiry Alarm & Minute Dose Check
  useEffect(() => {
    const doseInterval = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayDateStr = now.toISOString().split('T')[0];

      meds.forEach((m) => {
        if (m.time === currentHHMM && !m.takenToday) {
          const reminderKey = `mc_dose_notif_${m.id}_${todayDateStr}_${currentHHMM}`;
          if (!localStorage.getItem(reminderKey)) {
            localStorage.setItem(reminderKey, '1');
            playDoseChime();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('💊 EMC — Medication Reminder', {
                body: `Time to take ${m.name} (${m.dose})`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      });
    }, 30000);

    return () => clearInterval(doseInterval);
  }, [meds]);

  // Security PIN Protected Actions
  const withPinLock = (action: () => void) => {
    const pin = getPin();
    if (pin) {
      setPinMode('verify');
      setPinOnSuccess(() => action);
      setIsPinModalOpen(true);
    } else {
      action();
    }
  };

  const handleOpenProfileEdit = () => {
    withPinLock(() => {
      setIsProfileEditOpen(true);
    });
  };

  const handleSaveProfile = (updated: UserProfile) => {
    saveProfile(updated);
    setProfile(updated);
  };

  const handleSaveMeds = (updatedMeds: Medication[]) => {
    saveMedications(updatedMeds);
    setMeds(updatedMeds);
  };

  const handleSaveReports = (updatedReports: MedicalReport[]) => {
    saveReports(updatedReports);
    setReports(updatedReports);
  };

  const handleSaveDoctors = (updatedDoctors: Doctor[]) => {
    saveDoctors(updatedDoctors);
    setDoctors(updatedDoctors);
  };

  const handleOpenScanner = (onDetected: (code: string, medInfo?: any) => void) => {
    setScannerCallback(() => onDetected);
    setIsScannerOpen(true);
  };

  const handleOcrComplete = (data: ParsedOcrData, image?: string) => {
    setOcrData(data);
    setOcrImage(image);
  };

  const handleOcrImportComplete = (createdReport?: MedicalReport) => {
    reloadData();
    if (createdReport) {
      setSelectedReportForView(createdReport);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF8F3] text-[#1A0E06] flex justify-center selection:bg-[#DC7009]/20 selection:text-[#A84B06]">
      {/* Container adapts width for senior mode readability */}
      <main className={`w-full min-h-screen flex flex-col relative px-3 sm:px-5 pt-3 pb-24 shadow-2xl bg-[#FEF8F3] transition-all ${
        isSeniorMode ? 'max-w-xl' : 'max-w-md'
      }`}>
        {/* Top Header Bar with Language Switcher & Prominent Senior Mode Toggle */}
        <header className="flex items-center justify-between pb-3 px-1 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A84B06] to-[#DC7009] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              ✚
            </div>
            <div className="min-w-0">
              <span className="font-black text-sm sm:text-base tracking-tight text-[#1A0E06] block leading-tight truncate">
                {t('app_title')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <select
                id="header-language-select"
                value={currentLang}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="appearance-none bg-white text-gray-800 border border-gray-300 hover:border-[#DC7009] pl-2.5 pr-6 py-1.5 rounded-full font-black text-xs cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                title="Select App Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <Globe size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>

            {/* Prominent Senior Citizen Mode Quick Toggle Button */}
            <button
              id="senior-mode-header-toggle"
              onClick={handleToggleSeniorMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs transition-all active:scale-95 shadow-sm border ${
                isSeniorMode
                  ? 'bg-[#DC7009] text-white border-[#DC7009] ring-2 ring-orange-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-orange-50'
              }`}
              title="Switch Senior Citizen Easy Mode (Big text, big icons, simple English)"
            >
              <span className="text-sm">🧓</span>
              <span className="hidden sm:inline">{t('senior_label')}: <strong>{isSeniorMode ? t('senior_on') : t('senior_off')}</strong></span>
              <span className="sm:hidden"><strong>{isSeniorMode ? t('senior_on') : t('senior_off')}</strong></span>
            </button>

            {expiredMedsList.length > 0 && (
              <button
                onClick={() => setIsExpiryAlarmOpen(true)}
                className="px-2.5 py-1.5 rounded-full bg-red-100 text-red-700 text-[11px] font-black flex items-center gap-1 border border-red-200 animate-pulse"
                title={t('expiry_alerts')}
              >
                <AlertTriangle size={12} /> {expiredMedsList.length}
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              title={t('settings')}
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <div className="flex-1">
          {activeTab === 'card' && (
            <CardView
              profile={profile}
              meds={meds}
              onOpenEdit={handleOpenProfileEdit}
              isSeniorMode={isSeniorMode}
              onOpenFirstResponder={() => setIsFirstResponderOpen(true)}
              onOpenPhrases={() => setIsPhrasesOpen(true)}
            />
          )}

          {activeTab === 'meds' && (
            <MedsView
              meds={meds}
              onSaveMeds={handleSaveMeds}
              onOpenScanner={handleOpenScanner}
              isSeniorMode={isSeniorMode}
            />
          )}

          {activeTab === 'health' && (
            <HealthHubView
              vitals={vitals}
              onSaveVitals={handleSaveVitals}
              vaccinations={vaccinations}
              onSaveVaccinations={handleSaveVaccinations}
              insurance={insurance}
              onSaveInsurance={handleSaveInsurance}
              doctors={doctors}
              onSaveDoctors={handleSaveDoctors}
              isSeniorMode={isSeniorMode}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              reports={reports}
              onSaveReports={handleSaveReports}
              onOpenBloodTestModal={() => setIsBloodTestModalOpen(true)}
              onOpenReportViewer={(rep) => setSelectedReportForView(rep)}
              onOcrComplete={handleOcrComplete}
              onOpenOutOfRangeModal={(reportId) => {
                setOutOfRangeFilterReportId(reportId || null);
                setIsOutOfRangeModalOpen(true);
              }}
              isSeniorMode={isSeniorMode}
            />
          )}

          {activeTab === 'docs' && (
            <DoctorsView
              doctors={doctors}
              onSaveDoctors={handleSaveDoctors}
              isSeniorMode={isSeniorMode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              onOpenPinSetup={() => {
                setPinMode('setup');
                setPinOnSuccess(() => reloadData);
                setIsPinModalOpen(true);
              }}
              onOpenPinVerify={(onOk) => {
                setPinMode('verify');
                setPinOnSuccess(() => onOk);
                setIsPinModalOpen(true);
              }}
              onDataReset={reloadData}
              isSeniorMode={isSeniorMode}
              onToggleSeniorMode={handleToggleSeniorMode}
            />
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <nav className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DC7009]/20 shadow-xl flex justify-around items-center px-2 py-2 mx-auto transition-all ${
          isSeniorMode ? 'max-w-xl py-2.5' : 'max-w-md'
        }`}>
          {/* Card View */}
          <button
            onClick={() => setActiveTab('card')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'card'
                ? 'text-[#DC7009] font-black scale-105'
                : 'text-[#A08060] hover:text-gray-900 font-semibold'
            }`}
          >
            <CreditCard size={isSeniorMode ? 24 : 20} className={activeTab === 'card' ? 'stroke-[2.5]' : ''} />
            <span className={isSeniorMode ? 'text-xs font-black' : 'text-[10px]'}>{t('nav_card')}</span>
          </button>

          {/* Medications View */}
          <button
            onClick={() => setActiveTab('meds')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'meds'
                ? 'text-[#DC7009] font-black scale-105'
                : 'text-[#A08060] hover:text-gray-900 font-semibold'
            }`}
          >
            <Pill size={isSeniorMode ? 24 : 20} className={activeTab === 'meds' ? 'stroke-[2.5]' : ''} />
            <span className={isSeniorMode ? 'text-xs font-black' : 'text-[10px]'}>{t('nav_meds')}</span>
          </button>

          {/* SOS Pulsing Center Button */}
          <button
            onClick={() => setIsSosOpen(true)}
            className={`flex flex-col items-center justify-center -mt-6 rounded-full bg-gradient-to-tr from-[#C0392B] to-[#FF3B30] text-white shadow-xl shadow-red-500/40 sos-pulse active:scale-90 transition-transform ${
              isSeniorMode ? 'w-16 h-16' : 'w-14 h-14'
            }`}
            title={t('sos_title')}
          >
            <AlertOctagon size={isSeniorMode ? 28 : 24} className="animate-pulse" />
            <span className={`font-black tracking-wider ${isSeniorMode ? 'text-[11px]' : 'text-[9px]'}`}>{t('nav_sos')}</span>
          </button>

          {/* Health Hub View (Vitals, Vaccines, Insurance) */}
          <button
            onClick={() => setActiveTab('health')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'health'
                ? 'text-[#DC7009] font-black scale-105'
                : 'text-[#A08060] hover:text-gray-900 font-semibold'
            }`}
          >
            <Activity size={isSeniorMode ? 24 : 20} className={activeTab === 'health' ? 'stroke-[2.5]' : ''} />
            <span className={isSeniorMode ? 'text-xs font-black' : 'text-[10px]'}>{t('nav_health')}</span>
          </button>

          {/* Reports View */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ${
              activeTab === 'reports'
                ? 'text-[#DC7009] font-black scale-105'
                : 'text-[#A08060] hover:text-gray-900 font-semibold'
            }`}
          >
            <FileText size={isSeniorMode ? 24 : 20} className={activeTab === 'reports' ? 'stroke-[2.5]' : ''} />
            <span className={isSeniorMode ? 'text-xs font-black' : 'text-[10px]'}>{t('nav_reports')}</span>
          </button>
        </nav>

        {/* Global Overlays & Modals */}
        {/* 1. SOS Emergency Overlay */}
        <SosOverlay
          isOpen={isSosOpen}
          onClose={() => setIsSosOpen(false)}
          profile={profile}
          onOpenFirstResponder={() => setIsFirstResponderOpen(true)}
          onOpenPhrases={() => setIsPhrasesOpen(true)}
        />

        {/* 2. Security PIN Pad Modal */}
        <PinPadModal
          isOpen={isPinModalOpen}
          mode={pinMode}
          onClose={() => {
            setIsPinModalOpen(false);
            setPinOnSuccess(null);
          }}
          onSuccess={() => {
            if (pinOnSuccess) pinOnSuccess();
          }}
        />

        {/* 3. Profile Edit Modal */}
        <ProfileEditModal
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
        />

        {/* 4. Barcode Camera Scanner Modal */}
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => {
            setIsScannerOpen(false);
            setScannerCallback(null);
          }}
          onDetected={(code, medInfo) => {
            if (scannerCallback) scannerCallback(code, medInfo);
          }}
          existingMeds={meds}
        />

        {/* 4b. First Responder High-Contrast Bystander Mode */}
        {isFirstResponderOpen && (
          <FirstResponderView
            profile={profile}
            meds={meds}
            onClose={() => setIsFirstResponderOpen(false)}
          />
        )}

        {/* 4c. Non-Verbal Multilingual Emergency Flashcards */}
        {isPhrasesOpen && (
          <EmergencyPhraseCarousel
            onClose={() => setIsPhrasesOpen(false)}
            isSeniorMode={isSeniorMode}
          />
        )}

        {/* 5. OCR AI Confirmation Modal */}
        {ocrData && (
          <AiOcrConfirmModal
            isOpen={!!ocrData}
            data={ocrData}
            reportImage={ocrImage}
            onClose={() => {
              setOcrData(null);
              setOcrImage(undefined);
            }}
            onImportComplete={handleOcrImportComplete}
          />
        )}

        {/* 6. Blood Test Manual Entry Modal */}
        <BloodTestModal
          isOpen={isBloodTestModalOpen}
          onClose={() => setIsBloodTestModalOpen(false)}
          onSave={(report) => {
            handleSaveReports([report, ...reports]);
          }}
        />

        {/* 7. Detailed Report Viewer Modal */}
        <ReportViewerModal
          isOpen={!!selectedReportForView}
          report={selectedReportForView}
          onClose={() => setSelectedReportForView(null)}
          onDelete={(id) => {
            handleSaveReports(reports.filter(r => r.id !== id));
          }}
        />

        {/* 8. Expiry Alarm Modal */}
        <ExpiryAlarmModal
          isOpen={isExpiryAlarmOpen}
          meds={expiredMedsList}
          onClose={() => setIsExpiryAlarmOpen(false)}
          onViewMeds={() => {
            setIsExpiryAlarmOpen(false);
            setActiveTab('meds');
          }}
        />

        {/* 9. Out of Range Parameters Modal */}
        <OutOfRangeModal
          isOpen={isOutOfRangeModalOpen}
          reports={reports}
          initialReportId={outOfRangeFilterReportId}
          onClose={() => {
            setIsOutOfRangeModalOpen(false);
            setOutOfRangeFilterReportId(null);
          }}
          onOpenReportViewer={(rep) => {
            setSelectedReportForView(rep);
          }}
        />
      </main>
    </div>
  );
}
