import React, { useState } from 'react';
import { Phone, ShieldAlert, Heart, AlertTriangle, X, Share2, Volume2, Check } from 'lucide-react';
import { UserProfile, Medication } from '../types';
import { LanguageToggle, SupportedLocale, getLocaleStrings } from './LanguageToggle';
import { speakText } from '../utils/speech';

interface FirstResponderViewProps {
  profile: UserProfile;
  meds: Medication[];
  onClose: () => void;
  isSeniorMode?: boolean;
}

export const FirstResponderView: React.FC<FirstResponderViewProps> = ({
  profile,
  meds,
  onClose,
  isSeniorMode = false
}) => {
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [copied, setCopied] = useState(false);
  const t = getLocaleStrings(locale);

  const primaryContact = profile.contacts?.find(c => c.isPrimary) || profile.contacts?.[0];

  const handleCall = () => {
    if (primaryContact?.phone) {
      window.location.href = `tel:${primaryContact.phone}`;
    }
  };

  const handleSpeakSummary = () => {
    const speech = `Emergency Medical Card for ${profile.fullName}. Blood group is ${profile.bloodGroup}. Allergies include: ${
      profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None documented'
    }. Medical conditions: ${
      profile.conditions.length > 0 ? profile.conditions.join(', ') : 'None documented'
    }. Primary emergency contact is ${primaryContact?.name || 'Caregiver'} at ${primaryContact?.phone || 'unlisted'}.`;
    speakText(speech);
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="first-responder-mode-overlay"
      className="fixed inset-0 z-50 bg-[#0F0804] text-white flex flex-col p-4 sm:p-6 overflow-y-auto"
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <span className="font-black text-xs uppercase tracking-widest text-red-400">
            FIRST RESPONDER / BYSTANDER MODE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="fr-speak-btn"
            type="button"
            onClick={handleSpeakSummary}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Read emergency info aloud"
          >
            <Volume2 size={20} />
          </button>
          <button
            id="fr-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Exit First Responder Mode"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="pt-3 pb-4 flex justify-center">
        <LanguageToggle currentLang={locale} onLanguageChange={setLocale} size="sm" />
      </div>

      {/* Main Bystander Card */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-between gap-5">
        {/* Patient Identity & Giant Blood Group */}
        <div className="rounded-3xl bg-[#1D120A] border-2 border-[#DC7009] p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                PATIENT NAME
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {profile.fullName || 'Emergency Patient'}
              </h1>
              <p className="text-sm text-gray-300 mt-0.5">
                {profile.dob ? `DOB: ${profile.dob}` : ''} {profile.gender ? `• ${profile.gender}` : ''}
              </p>
            </div>

            {/* 48pt Giant Blood Group */}
            <div className="shrink-0 text-center bg-red-600/20 border-2 border-red-500 px-4 py-2 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-red-300 block">
                {t.blood_group}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-red-500 leading-none">
                {profile.bloodGroup || 'UNK'}
              </span>
            </div>
          </div>
        </div>

        {/* Life-Threatening Allergies (Amber/Red Badges) */}
        <div className="rounded-3xl bg-[#1D120A] border border-amber-500/40 p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <ShieldAlert size={20} />
            <h2 className="text-xs font-black uppercase tracking-wider">
              {t.critical_allergies}
            </h2>
          </div>
          {profile.allergies && profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((all, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 font-black text-sm tracking-wide flex items-center gap-1.5"
                >
                  <AlertTriangle size={14} className="text-amber-400" />
                  {all}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic font-medium">
              No known drug or food allergies documented
            </p>
          )}
        </div>

        {/* Medical Conditions */}
        <div className="rounded-3xl bg-[#1D120A] border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <Heart size={20} />
            <h2 className="text-xs font-black uppercase tracking-wider">
              {t.medical_conditions}
            </h2>
          </div>
          {profile.conditions && profile.conditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.conditions.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/15"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No pre-existing conditions recorded</p>
          )}
        </div>

        {/* Active Medications Summary */}
        {meds && meds.length > 0 && (
          <div className="rounded-3xl bg-[#1D120A] border border-white/10 p-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              {t.active_medications} ({meds.length})
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {meds.slice(0, 5).map((m, i) => (
                <span key={i} className="px-2.5 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-200 border border-white/10">
                  {m.name} {m.dose}
                </span>
              ))}
              {meds.length > 5 && (
                <span className="text-xs text-gray-400 font-bold px-2 py-1">
                  +{meds.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Primary Call-Now Giant Button */}
        <div className="mt-auto pt-2">
          {primaryContact ? (
            <button
              id="first-responder-call-primary"
              type="button"
              onClick={handleCall}
              className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-red-600 to-[#DC7009] hover:from-red-500 hover:to-[#EB8524] text-white font-black text-lg sm:text-xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform animate-pulse"
            >
              <Phone size={26} className="fill-white" />
              <span>
                {t.call_primary}: {primaryContact.name} ({primaryContact.phone})
              </span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-white/10 text-center text-sm font-bold text-gray-300">
              No emergency contact set
            </div>
          )}

          <p className="text-center text-[11px] text-gray-400 font-medium mt-3 px-2">
            {t.bystander_instruction}
          </p>

          <div className="flex justify-center mt-3">
            <button
              type="button"
              onClick={handleShareLink}
              className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-white/10 transition-colors"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied!' : 'Copy Emergency Card Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
