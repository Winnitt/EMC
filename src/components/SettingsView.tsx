import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Volume2,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Bell,
  Check,
  Lock,
  Unlock,
  Heart,
  HardDrive,
  Info,
  Glasses,
  CheckCircle2,
  Sparkles,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';
import { getPin, savePin, exportAllDataJSON, importAllDataJSON, resetToSampleData, clearAllData } from '../utils/storage';
import { playAlarmTone, playDoseChime } from '../utils/audio';
import { speakText } from '../utils/speech';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLocale } from '../utils/i18n';

interface SettingsViewProps {
  profile: UserProfile;
  onOpenPinSetup: () => void;
  onOpenPinVerify: (onOk: () => void) => void;
  onDataReset: () => void;
  isSeniorMode: boolean;
  onToggleSeniorMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onOpenPinSetup,
  onOpenPinVerify,
  onDataReset,
  isSeniorMode,
  onToggleSeniorMode
}) => {
  const { t, currentLang, setLanguage } = useI18n();
  const [toastMessage, setToastMessage] = useState('');
  const hasPin = !!getPin();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emc_backup_${profile.fullName.replace(/\s+/g, '_') || 'data'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup JSON file exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const ok = importAllDataJSON(content);
      if (ok) {
        onDataReset();
        showToast('Medical data restored successfully!');
      } else {
        alert('Failed to parse JSON backup file. Ensure it is a valid EMC backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleRemovePin = () => {
    onOpenPinVerify(() => {
      savePin(null);
      showToast('Security PIN removed.');
    });
  };

  const handleLoadDemoData = () => {
    if (confirm('Load sample patient demo records? This will replace current records.')) {
      resetToSampleData();
      onDataReset();
      showToast('Sample medical records loaded.');
    }
  };

  const handleClearAll = () => {
    if (confirm('WARNING: This will erase all your medical records, medications, and reports permanently. Continue?')) {
      clearAllData();
      onDataReset();
      showToast('All local data cleared.');
    }
  };

  const requestNotifs = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Notification permission granted!');
      } else {
        showToast('Notifications are blocked in browser settings.');
      }
    } else {
      showToast('Browser does not support notifications.');
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#1A0E06] text-white text-xs font-black shadow-xl border border-[#DC7009]/40 animate-in fade-in flex items-center gap-2">
          <Check size={16} className="text-[#34C759] stroke-[3]" /> {toastMessage}
        </div>
      )}

      {/* View Gradient Header */}
      <div className="gh-sets rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div className={`font-black tracking-widest uppercase opacity-90 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
          {t('settings_subtitle')}
        </div>
        <h1 className={`font-black tracking-tight ${isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-2xl'}`}>
          {t('settings_title')}
        </h1>
        <div className={`opacity-85 mt-1 font-medium ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
          {t('settings_subtitle')}
        </div>
      </div>

      {/* Language Selection Card (Shifted to Settings) */}
      <div id="settings-language-section" className="p-5 sm:p-6 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#DC7009]">
            <Globe size={18} className="text-[#DC7009]" />
            <span>{t('language_section_title') || 'Language / ഭാഷ / भाषा'}</span>
          </div>
          <span className="text-[11px] font-bold text-gray-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            {SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.nativeName || 'English'}
          </span>
        </div>
        <p className="text-gray-600 font-medium text-xs sm:text-sm">
          {t('language_section_desc') || 'Select your preferred language. The app name, medical cards, and emergency terminology will adapt.'}
        </p>

        {/* Language Grid with Malayalam, English, Hindi, etc. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
          {SUPPORTED_LANGUAGES.map(lang => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-btn-${lang.code}`}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  showToast(`Language set to ${lang.nativeName}`);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-orange-50 to-amber-100/90 border-[#DC7009] shadow-sm ring-2 ring-[#DC7009]/40'
                    : 'bg-gray-50/80 hover:bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-black text-sm sm:text-base ${isSelected ? 'text-[#A84B06]' : 'text-gray-900'}`}>
                    {lang.nativeName.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC7009] shadow-sm animate-pulse"></span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 font-semibold mt-1">
                  {lang.code === 'en' ? 'English' : lang.nativeName.match(/\((.*?)\)/)?.[1] || lang.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Senior Citizen Accessibility Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-md transition-all ${
        isSeniorMode
          ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-[#DC7009]'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
              isSeniorMode ? 'bg-[#DC7009] text-white shadow-md' : 'bg-orange-100 text-[#DC7009]'
            }`}>
              🧓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-gray-900 text-base sm:text-lg">
                  {t('senior_mode_title')}
                </h3>
                {isSeniorMode && (
                  <span className="bg-[#DC7009] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-gray-600 font-medium text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
                {t('senior_mode_desc')}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => {
                onToggleSeniorMode();
                if (!isSeniorMode) {
                  speakText('Senior Citizen mode is now turned on. Text is larger, buttons are bigger, and all medical words are simplified.');
                }
              }}
              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
                isSeniorMode ? 'bg-[#DC7009]' : 'bg-gray-300'
              }`}
              title={t('senior_mode_title')}
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform shadow-md ${
                  isSeniorMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quick Test Voice Narration */}
        <div className="mt-4 pt-3 border-t border-orange-200/60 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-gray-600 font-semibold">
            {isSeniorMode ? `🔊 ${t('read_meds_aloud')}` : t('senior_mode_title')}
          </span>
          <button
            onClick={() => speakText('Welcome to your Emergency Medical Card. Your health data is safe and ready on your device.')}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-orange-50 text-gray-800 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <Volume2 size={14} className="text-[#DC7009]" /> {t('voice_reading_active')}
          </button>
        </div>
      </div>

      {/* Security & PIN Lock */}
      <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#2D1B69]">
          <Shield size={16} /> {t('pin_title')}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className={`font-black text-gray-900 flex items-center gap-1.5 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
              {hasPin ? <Lock size={16} className="text-[#34C759]" /> : <Unlock size={16} className="text-gray-400" />}
              {t('pin_title')}
            </div>
            <div className={`text-gray-500 mt-0.5 font-medium ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
              {hasPin ? t('pin_desc') : 'No PIN configured (Open access)'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasPin ? (
              <>
                <button
                  onClick={onOpenPinSetup}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-black text-gray-700"
                >
                  {t('change_pin')}
                </button>
                <button
                  onClick={handleRemovePin}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-black text-red-600"
                >
                  {t('remove_pin')}
                </button>
              </>
            ) : (
              <button
                onClick={onOpenPinSetup}
                className="px-5 py-2.5 bg-[#2D1B69] text-white rounded-xl text-xs font-black shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                {t('set_pin')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alarm Sound & Notifications */}
      <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#DC7009]">
          <Volume2 size={16} /> {t('audio_alarms_title')}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>{t('test_alarm_btn')}</div>
              <div className="text-[11px] text-gray-500 font-medium">Loud siren for expired medicine boxes</div>
            </div>
            <button
              onClick={() => playAlarmTone(3)}
              className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#DC7009] font-black text-xs flex items-center gap-1.5 border border-[#DC7009]/20 active:scale-95"
            >
              <Volume2 size={14} /> {t('sound_siren')}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>{t('test_chime_btn')}</div>
              <div className="text-[11px] text-gray-500 font-medium">Pleasant reminder when taking daily pills</div>
            </div>
            <button
              onClick={() => playDoseChime()}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5 border border-emerald-200 active:scale-95"
            >
              <Volume2 size={14} /> {t('test_chime_btn')}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>{t('enable_notifs')}</div>
              <div className="text-[11px] text-gray-500 font-medium">Allow browser alerts for your morning & night pills</div>
            </div>
            <button
              onClick={requestNotifs}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs flex items-center gap-1.5"
            >
              <Bell size={14} /> {t('enable_notifs')}
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#0D5C3D]">
          <HardDrive size={16} /> {t('backup_title')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="p-4 rounded-2xl bg-[#FEF8F3] hover:bg-[#FEF2E0] border border-[#DC7009]/20 flex items-center gap-3 text-left transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DC7009] text-white flex items-center justify-center shrink-0">
              <Download size={20} />
            </div>
            <div>
              <div className="font-black text-xs text-gray-900">{t('download_backup_btn')}</div>
              <div className="text-[11px] text-gray-500 font-medium">{t('backup_title')}</div>
            </div>
          </button>

          <label className="p-4 rounded-2xl bg-[#FEF8F3] hover:bg-[#FEF2E0] border border-[#DC7009]/20 flex items-center gap-3 text-left cursor-pointer transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-[#0D5C3D] text-white flex items-center justify-center shrink-0">
              <Upload size={20} />
            </div>
            <div>
              <div className="font-black text-xs text-gray-900">{t('restore_backup_btn')}</div>
              <div className="text-[11px] text-gray-500 font-medium">{t('backup_title')}</div>
            </div>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="pt-2 border-t border-gray-100 flex gap-2.5">
          <button
            onClick={handleLoadDemoData}
            className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} /> {t('load_sample_btn')}
          </button>
          <button
            onClick={handleClearAll}
            className="py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} /> {t('erase_all_btn')}
          </button>
        </div>
      </div>

      {/* About & Architecture Info */}
      <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3 text-xs text-gray-600">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#1A0E06]">
          <Info size={16} className="text-[#DC7009]" /> 100% Private Offline App
        </div>
        <p className="leading-relaxed font-medium">
          All your medical records, allergy details, medicine lists, and blood test papers remain securely inside this phone or computer. No passwords or internet cloud login required.
        </p>
      </div>
    </div>
  );
};
