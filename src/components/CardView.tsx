import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Smartphone,
  Radio,
  Share2,
  Edit3,
  Phone,
  MessageSquare,
  Shield,
  Heart,
  Pill,
  Award,
  AlertCircle,
  FileCheck2,
  Check,
  Volume2,
  VolumeX,
  User
} from 'lucide-react';
import { UserProfile, Medication } from '../types';
import { calcAge, maskPhone } from '../utils/storage';
import { generateLockscreenWallpaper, printMedicalCard, writeNfcMedicalTag } from '../utils/emergency';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speech';
import { useI18n } from '../utils/i18n';

interface CardViewProps {
  profile: UserProfile;
  meds: Medication[];
  onOpenEdit: () => void;
  isSeniorMode?: boolean;
  onOpenFirstResponder?: () => void;
  onOpenPhrases?: () => void;
}

export const CardView: React.FC<CardViewProps> = ({
  profile,
  meds,
  onOpenEdit,
  isSeniorMode = false,
  onOpenFirstResponder,
  onOpenPhrases
}) => {
  const { t, currentLang, setLanguage } = useI18n();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isGeneratingWallpaper, setIsGeneratingWallpaper] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);

  const handleLanguageChange = (lang: any) => {
    setLanguage(lang);
    const labels: Record<string, string> = {
      hi: 'हिन्दी',
      mr: 'मराठी',
      ta: 'தமிழ்',
      bn: 'বাংলা',
      te: 'తెలుగు',
      en: 'English'
    };
    showToast(`Language set to ${labels[lang] || 'English'}`);
  };

  useEffect(() => {
    // Generate QR Code data URL containing Emergency ID & Summary
    const summaryData = JSON.stringify({
      app: 'EMC',
      id: profile.id,
      name: profile.fullName,
      blood: profile.bloodGroup,
      allergies: profile.allergies,
      conditions: profile.conditions,
      contacts: profile.contacts.map(c => ({ n: c.name, p: c.phone, r: c.relationship }))
    });

    QRCode.toDataURL(summaryData, {
      margin: 1,
      width: 320,
      color: {
        dark: '#1A0E06',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [profile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    printMedicalCard(profile, meds, qrDataUrl);
  };

  const handleWallpaper = async () => {
    if (!qrDataUrl) return;
    setIsGeneratingWallpaper(true);
    try {
      const url = await generateLockscreenWallpaper(profile, qrDataUrl);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emc_lockscreen_${profile.fullName.replace(/\s+/g, '_') || 'card'}.png`;
      a.click();
      showToast('Lock screen photo downloaded! Set it as your phone wallpaper.');
    } catch (err) {
      console.error(err);
      showToast('Could not generate wallpaper.');
    } finally {
      setIsGeneratingWallpaper(false);
    }
  };

  const handleNfc = async () => {
    showToast('Hold NFC sticker near your phone...');
    const res = await writeNfcMedicalTag(profile);
    showToast(res.message);
  };

  const handleShare = async () => {
    const summary = `🪪 EMERGENCY MEDICAL CARD\n\nName: ${profile.fullName || 'Not specified'}\nBlood Group: ${profile.bloodGroup}\nAllergies (Do NOT give): ${(profile.allergies || []).join(', ') || 'None'}\nHealth Conditions: ${(profile.conditions || []).join(', ') || 'None'}\n\nEmergency Contacts to Call:\n${(profile.contacts || []).map(c => `• ${c.name} (${c.relationship}): ${c.phone}`).join('\n') || 'None'}\n\n— Emergency Medical Card`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Medical Card — ${profile.fullName || 'Profile'}`,
          text: summary
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(summary);
      showToast('Medical details copied to clipboard!');
    }
  };

  const handleReadCardAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    const speechScript = `
      Emergency Medical Card for ${profile.fullName || 'Patient'}.
      Blood Group is ${profile.bloodGroup || 'Not specified'}.
      ${profile.dob ? `Age is ${calcAge(profile.dob)} years.` : ''}
      ${profile.allergies && profile.allergies.length > 0 ? `Important Allergies. Do not give: ${profile.allergies.join(', ')}.` : 'No known drug allergies.'}
      ${profile.conditions && profile.conditions.length > 0 ? `Health conditions include: ${profile.conditions.join(', ')}.` : ''}
      ${profile.contacts && profile.contacts.length > 0 ? `In case of emergency, call primary contact ${profile.contacts[0].name}, ${profile.contacts[0].relationship}, at ${profile.contacts[0].phone}.` : ''}
    `;

    setSpeaking(true);
    speakText(speechScript, () => setSpeaking(false));
  };

  const age = calcAge(profile.dob);

  return (
    <div className={`space-y-5 pb-24 ${isSeniorMode ? 'senior-card-container' : ''}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#1A0E06] text-white text-sm font-bold shadow-xl border border-[#DC7009]/40 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <Check size={16} className="text-[#34C759]" /> {toastMessage}
        </div>
      )}

      {/* Senior Mode Announcement Banner */}
      {isSeniorMode && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 font-bold">
              👓
            </div>
            <div>
              <div className="font-extrabold text-sm text-amber-950">
                {t('senior_easy_banner')}
              </div>
              <div className="text-xs text-amber-900/80">
                {t('senior_easy_desc')}
              </div>
            </div>
          </div>

          <button
            onClick={handleReadCardAloud}
            className={`px-3.5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0 ${
              speaking
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-[#0D5C3D] text-white hover:bg-[#1A8A5A]'
            }`}
            title="Read card details out loud"
          >
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{speaking ? t('stop_voice_btn') : t('voice_readout_btn')}</span>
          </button>
        </div>
      )}

      {/* Hero Medical Card */}
      <div className={`relative rounded-3xl overflow-hidden shadow-xl border ${isSeniorMode ? 'border-2 border-[#DC7009]/40' : 'border border-[#DC7009]/20'} transition-transform duration-300`}>
        {/* Gradient Background */}
        <div className="gh-card p-5 sm:p-6 text-white relative">
          {/* Header Row: Title, Language Selector, Blood Group Badge, Edit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className={`font-black tracking-widest uppercase opacity-95 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                {t('card_title')}
              </div>
              <div className={`font-mono font-bold opacity-85 mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                {profile.id || 'EMC-00000'}
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              {/* Massive Blood Group Pill */}
              <div
                className={`rounded-full bg-[#FF3B30] text-white font-black shadow-md border-2 border-white/40 flex items-center gap-1.5 ${
                  isSeniorMode ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm'
                }`}
                title={`${t('blood_group')}: ${profile.bloodGroup || 'O+'}`}
              >
                <span className="text-base">🩸</span> {profile.bloodGroup || 'O+'}
              </div>
              <button
                onClick={onOpenEdit}
                className={`rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all flex items-center justify-center ${
                  isSeniorMode ? 'w-11 h-11' : 'p-2'
                }`}
                title={t('edit_profile_btn')}
              >
                <Edit3 size={isSeniorMode ? 18 : 15} />
              </button>
            </div>
          </div>

          {/* Bystander Instruction Banner (Multilingual) */}
          <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/20 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0">ℹ️</span>
              <span>{t('bystander_instruction')}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
              {(['en', 'hi', 'mr', 'ta', 'te'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleLanguageChange(l)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    currentLang === l ? 'bg-white text-[#A84B06] shadow-sm' : 'bg-white/15 text-white hover:bg-white/30'
                  }`}
                  title={`Switch card language to ${l}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Name & Metadata */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`rounded-2xl overflow-hidden bg-white/20 border-2 border-white/50 shrink-0 shadow-inner flex items-center justify-center ${
              isSeniorMode ? 'w-20 h-20' : 'w-16 h-16'
            }`}>
              {profile.photo ? (
                <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className={isSeniorMode ? 'text-4xl' : 'text-2xl'}>👤</span>
              )}
            </div>

            <div>
              <h1 className={`font-black tracking-tight leading-tight ${isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-2xl'}`}>
                {profile.fullName || t('senior_easy_banner')}
              </h1>
              <div className={`font-bold opacity-95 mt-1 flex flex-wrap gap-2 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                <span>{profile.gender || 'Patient'}</span>
                {age !== null && <span>• {t('age_label')} {age}</span>}
                {profile.weight && <span>• {t('weight_label')}: {profile.weight} kg</span>}
              </div>
            </div>
          </div>

          {/* Badges / Indicators */}
          <div className={`flex flex-wrap gap-2 pt-2 border-t border-white/25 font-bold ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
            {profile.organDonor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <Award size={14} className="text-yellow-300" /> {t('organ_donor')}
              </span>
            )}
            {profile.insurancePolicy && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <FileCheck2 size={14} /> {t('hub_insurance')}: {profile.insurancePolicy}
              </span>
            )}
          </div>
        </div>

        {/* Card Lower Section: QR Code & Quick Summary */}
        <div className="bg-white p-5 space-y-4">
          {/* Quick QR Code Box */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[#FEF8F3] rounded-3xl border border-[#DC7009]/20">
            <div className="space-y-1">
              <div className={`font-extrabold text-[#A84B06] flex items-center gap-1 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                📷 {t('qr_hint')}
              </div>
              <div className={`text-[#5C4030] ${isSeniorMode ? 'text-xs font-medium' : 'text-[11px]'}`}>
                {t('bystander_instruction')}
              </div>
            </div>
            {qrDataUrl && (
              <div className={`rounded-2xl overflow-hidden bg-white p-1.5 border-2 border-orange-200 shrink-0 shadow-sm ${
                isSeniorMode ? 'w-24 h-24' : 'w-20 h-20'
              }`}>
                <img src={qrDataUrl} alt="Emergency QR Code" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          {/* Severe Allergies Warning Box */}
          {profile.allergies && profile.allergies.length > 0 && (
            <div className="p-3.5 bg-red-50 rounded-2xl border-2 border-red-300 space-y-2">
              <div className={`font-black text-[#C0392B] uppercase flex items-center gap-1.5 ${isSeniorMode ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                <Shield size={16} /> ⚠️ {t('critical_allergies')}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map(a => (
                  <span
                    key={a}
                    className={`font-black rounded-xl bg-white text-red-700 border-2 border-red-300 shadow-xs flex items-center gap-1 ${
                      isSeniorMode ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
                    }`}
                  >
                    <span>🚫</span> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chronic Conditions Highlight */}
          {profile.conditions && profile.conditions.length > 0 && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
              <div className={`font-black text-[#A84B06] uppercase flex items-center gap-1.5 ${isSeniorMode ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                <Heart size={16} /> 🫀 {t('medical_conditions')} ({profile.conditions.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.conditions.map(c => (
                  <span
                    key={c}
                    className={`font-bold rounded-xl bg-white text-amber-950 border border-amber-300 shadow-xs flex items-center gap-1 ${
                      isSeniorMode ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
                    }`}
                  >
                    <span>🩺</span> {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Active Prescriptions list */}
          {meds.length > 0 && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
              <div className={`font-black text-[#0D5C3D] uppercase flex items-center gap-1.5 ${isSeniorMode ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                <Pill size={16} /> 💊 {t('active_medications')} ({meds.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {meds.map(m => (
                  <span
                    key={m.id}
                    className={`font-bold rounded-xl bg-white text-emerald-900 border border-emerald-300 shadow-xs flex items-center gap-1 ${
                      isSeniorMode ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
                    }`}
                  >
                    <span>💊</span> {m.name} ({m.dose})
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.emergencyNotes && (
            <div className={`p-4 bg-gray-50 rounded-2xl text-gray-800 border border-gray-200 ${isSeniorMode ? 'text-sm font-medium' : 'text-xs'}`}>
              <strong className="text-gray-900">{t('emergency_notes_label')}:</strong> {profile.emergencyNotes}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contacts Section with Big Call Buttons for Seniors */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className={`font-black text-[#1A0E06] uppercase tracking-wider ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
            📞 {t('emergency_contacts')} ({(profile.contacts || []).length})
          </h2>
          <button
            onClick={onOpenEdit}
            className={`font-bold text-[#DC7009] hover:underline ${isSeniorMode ? 'text-sm' : 'text-xs'}`}
          >
            {isSeniorMode ? t('edit_profile_btn') : t('edit_profile_btn')}
          </button>
        </div>

        {(!profile.contacts || profile.contacts.length === 0) ? (
          <div className="p-6 bg-white rounded-3xl border-2 border-dashed border-gray-300 text-center space-y-2">
            <div className={isSeniorMode ? 'text-sm text-gray-600 font-semibold' : 'text-xs text-gray-500'}>
              {t('no_contacts_yet')}
            </div>
            <button
              onClick={onOpenEdit}
              className="px-5 py-2.5 bg-[#FEF8F3] hover:bg-[#FEF2E0] text-[#DC7009] rounded-2xl text-sm font-black border-2 border-[#DC7009]/30"
            >
              {t('add_contact_btn')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.contacts.map((contact, idx) => (
              <div
                key={contact.id || idx}
                className={`p-4 bg-white rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  contact.isPrimary
                    ? 'border-2 border-emerald-400 bg-emerald-50/20'
                    : 'border-gray-200'
                }`}
              >
                <div>
                  <div className={`font-black text-gray-900 flex items-center gap-2 ${isSeniorMode ? 'text-base sm:text-lg' : 'text-sm'}`}>
                    <span>{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="text-xs font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                        {t('primary_badge')}
                      </span>
                    )}
                  </div>
                  <div className={`text-[#5C4030] font-semibold mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                    {contact.relationship} • {maskPhone(contact.phone, contact.isMasked)}
                  </div>
                </div>

                {/* Big Senior-Friendly Call & Message Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className={`rounded-2xl ${
                      contact.isPrimary ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    } text-white font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                      isSeniorMode
                        ? 'flex-1 sm:flex-initial px-6 py-3.5 text-sm min-h-[50px]'
                        : 'p-3'
                    }`}
                    title="Tap to Call Immediately"
                  >
                    <Phone size={isSeniorMode ? 20 : 16} />
                    {contact.isPrimary ? (
                      <span className="font-black text-xs sm:text-sm">{t('call_primary')}</span>
                    ) : isSeniorMode ? (
                      <span>{t('call_action')}</span>
                    ) : null}
                  </a>

                  <a
                    href={`sms:${contact.phone}`}
                    className={`rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                      isSeniorMode
                        ? 'px-4 py-3.5 text-sm min-h-[50px]'
                        : 'p-3'
                    }`}
                    title="Send SMS Message"
                  >
                    <MessageSquare size={isSeniorMode ? 18 : 16} />
                    {isSeniorMode && <span>{t('sms_action')}</span>}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fast Bystander & Non-Verbal Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {onOpenFirstResponder && (
          <button
            type="button"
            onClick={onOpenFirstResponder}
            className={`p-3.5 rounded-2xl bg-black text-white hover:bg-gray-900 font-black flex items-center justify-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition-all ${
              isSeniorMode ? 'text-sm' : 'text-xs'
            }`}
          >
            <span className="text-lg">🧓</span>
            <span>{t('bystander_mode_btn')}</span>
          </button>
        )}

        {onOpenPhrases && (
          <button
            type="button"
            onClick={onOpenPhrases}
            className={`p-3.5 rounded-2xl bg-white border-2 border-[#DC7009]/40 text-[#DC7009] hover:bg-orange-50 font-black flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all ${
              isSeniorMode ? 'text-sm' : 'text-xs'
            }`}
          >
            <span className="text-lg">🗣️</span>
            <span>{t('phrases_btn')}</span>
          </button>
        )}
      </div>

      {/* Quick Action Tools Bar */}
      <div className="space-y-3">
        <h2 className={`font-black text-[#1A0E06] uppercase tracking-wider px-1 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
          {t('quick_tools_title')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Print Card */}
          <button
            onClick={handlePrint}
            className={`bg-white hover:bg-[#FEF8F3] rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-2 transition-all active:scale-95 group ${
              isSeniorMode ? 'p-5 min-h-[110px]' : 'p-4'
            }`}
          >
            <div className={`rounded-2xl bg-orange-50 group-hover:bg-[#DC7009] text-[#DC7009] group-hover:text-white flex items-center justify-center transition-colors ${
              isSeniorMode ? 'w-12 h-12' : 'w-10 h-10'
            }`}>
              <Printer size={isSeniorMode ? 24 : 20} />
            </div>
            <div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                {t('print_card_btn')}
              </div>
              <div className={`text-gray-500 font-medium ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                {t('print_card_desc')}
              </div>
            </div>
          </button>

          {/* Wallpaper Generator */}
          <button
            onClick={handleWallpaper}
            disabled={isGeneratingWallpaper}
            className={`bg-white hover:bg-[#FEF8F3] rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-2 transition-all active:scale-95 group ${
              isSeniorMode ? 'p-5 min-h-[110px]' : 'p-4'
            }`}
          >
            <div className={`rounded-2xl bg-orange-50 group-hover:bg-[#DC7009] text-[#DC7009] group-hover:text-white flex items-center justify-center transition-colors ${
              isSeniorMode ? 'w-12 h-12' : 'w-10 h-10'
            }`}>
              <Smartphone size={isSeniorMode ? 24 : 20} />
            </div>
            <div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                {t('wallpaper_btn')}
              </div>
              <div className={`text-gray-500 font-medium ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                {t('wallpaper_desc')}
              </div>
            </div>
          </button>

          {/* NFC Writer */}
          <button
            onClick={handleNfc}
            className={`bg-white hover:bg-[#FEF8F3] rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-2 transition-all active:scale-95 group ${
              isSeniorMode ? 'p-5 min-h-[110px]' : 'p-4'
            }`}
          >
            <div className={`rounded-2xl bg-orange-50 group-hover:bg-[#DC7009] text-[#DC7009] group-hover:text-white flex items-center justify-center transition-colors ${
              isSeniorMode ? 'w-12 h-12' : 'w-10 h-10'
            }`}>
              <Radio size={isSeniorMode ? 24 : 20} />
            </div>
            <div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                {t('nfc_btn')}
              </div>
              <div className={`text-gray-500 font-medium ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                {t('nfc_desc')}
              </div>
            </div>
          </button>

          {/* Share Card */}
          <button
            onClick={handleShare}
            className={`bg-white hover:bg-[#FEF8F3] rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center gap-2 transition-all active:scale-95 group ${
              isSeniorMode ? 'p-5 min-h-[110px]' : 'p-4'
            }`}
          >
            <div className={`rounded-2xl bg-orange-50 group-hover:bg-[#DC7009] text-[#DC7009] group-hover:text-white flex items-center justify-center transition-colors ${
              isSeniorMode ? 'w-12 h-12' : 'w-10 h-10'
            }`}>
              <Share2 size={isSeniorMode ? 24 : 20} />
            </div>
            <div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                {t('share_card_btn')}
              </div>
              <div className={`text-gray-500 font-medium ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                {t('share_card_desc')}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
