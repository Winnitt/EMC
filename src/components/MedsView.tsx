import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Camera,
  Search,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Check,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from 'lucide-react';
import { Medication } from '../types';
import { expiryStatus, genId } from '../utils/storage';
import { MED_SEARCH } from '../data/medDb';
import { CONDITIONS_LIST } from '../data/conditionsDb';
import { playDoseChime } from '../utils/audio';
import { speakText, stopSpeaking } from '../utils/speech';
import { formatFrequencyPlain, formatTimeOfDayPlain } from '../utils/seniorMode';
import { evaluateDrugInteractions, findAllActiveInteractions, InteractionWarning } from '../services/interactionChecker';
import { useI18n } from '../utils/i18n';

interface MedsViewProps {
  meds: Medication[];
  onSaveMeds: (meds: Medication[]) => void;
  onOpenScanner: (onDetected: (code: string, medInfo?: { name: string; generic: string; cat: string }) => void) => void;
  isSeniorMode?: boolean;
}

export const MedsView: React.FC<MedsViewProps> = ({
  meds,
  onSaveMeds,
  onOpenScanner,
  isSeniorMode = false
}) => {
  const { t } = useI18n();
  const [filterTab, setFilterTab] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [speaking, setSpeaking] = useState<boolean>(false);

  // Modal Form states
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dose, setDose] = useState('1 tablet');
  const [freq, setFreq] = useState('OD');
  const [tod, setTod] = useState<Medication['tod']>('morning');
  const [time, setTime] = useState('08:00');
  const [cond, setCond] = useState('');
  const [barcode, setBarcode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stock, setStock] = useState<number | undefined>(undefined);
  const [daysSupply, setDaysSupply] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [medSuggestions, setMedSuggestions] = useState<typeof MED_SEARCH>([]);

  // Real-time interaction evaluation for candidate medicine in modal
  const otherMedsForCheck = meds.filter(m => !editingMed || m.id !== editingMed.id);
  const modalWarnings = evaluateDrugInteractions(otherMedsForCheck, medName);

  // Overall interaction evaluation among all current active medications
  const activeInteractions = findAllActiveInteractions(meds);

  const handleOpenAdd = () => {
    setEditingMed(null);
    setMedName('');
    setGenericName('');
    setDose('1 tablet');
    setFreq('OD');
    setTod('morning');
    setTime('08:00');
    setCond('');
    setBarcode('');
    setExpiryDate('');
    setStock(undefined);
    setDaysSupply(undefined);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Medication) => {
    setEditingMed(m);
    setMedName(m.name);
    setGenericName(m.genericName || '');
    setDose(m.dose);
    setFreq(m.freq);
    setTod(m.tod);
    setTime(m.time);
    setCond(m.cond || '');
    setBarcode(m.barcode || '');
    setExpiryDate(m.expiryDate || '');
    setStock(m.stock);
    setDaysSupply(m.daysSupply);
    setNotes(m.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!medName.trim()) {
      alert('Please enter the medicine name');
      return;
    }

    const payload: Medication = {
      id: editingMed ? editingMed.id : genId('MED'),
      name: medName.trim(),
      genericName: genericName.trim() || undefined,
      dose: dose.trim() || '1 tablet',
      freq,
      tod,
      time,
      cond: cond.trim() || undefined,
      barcode: barcode.trim() || undefined,
      expiryDate: expiryDate || undefined,
      stock: stock !== undefined && !isNaN(stock) ? stock : undefined,
      daysSupply: daysSupply !== undefined && !isNaN(daysSupply) ? Number(daysSupply) : undefined,
      notes: notes.trim() || undefined,
      takenToday: editingMed?.takenToday || false
    };

    if (editingMed) {
      onSaveMeds(meds.map(m => (m.id === editingMed.id ? payload : m)));
    } else {
      onSaveMeds([payload, ...meds]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteMed = (id: string | number) => {
    if (confirm('Do you want to remove this medicine from your daily list?')) {
      onSaveMeds(meds.filter(m => m.id !== id));
    }
  };

  const handleToggleTaken = (id: string | number) => {
    const next = meds.map(m => {
      if (m.id === id) {
        const isNowTaken = !m.takenToday;
        if (isNowTaken) playDoseChime();
        return { ...m, takenToday: isNowTaken };
      }
      return m;
    });
    onSaveMeds(next);
  };

  const handleMedSearch = (val: string) => {
    setMedName(val);
    if (!val.trim()) {
      setMedSuggestions([]);
      return;
    }
    const q = val.toLowerCase();
    const matches = MED_SEARCH.filter(item => item.term.toLowerCase().includes(q)).slice(0, 8);
    setMedSuggestions(matches);
  };

  const handleSelectMed = (term: string, cat: string) => {
    setMedName(term);
    setMedSuggestions([]);
    if (!cond) setCond(cat);
  };

  const handleReadMedicinesAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    if (meds.length === 0) {
      speakText('You have no medicines recorded in your daily list.');
      return;
    }

    const medSpeechList = meds.map((m, index) => {
      const timeInfo = formatTimeOfDayPlain(m.tod);
      const freqInfo = formatFrequencyPlain(m.freq);
      const takenStatus = m.takenToday ? 'Already taken today.' : 'Not taken yet.';
      return `Medicine number ${index + 1}: ${m.name}, take ${m.dose}, in the ${timeInfo.label} at ${m.time}. Frequency is ${freqInfo}. Status: ${takenStatus}`;
    }).join('. ');

    const fullText = `Here are your ${meds.length} daily medicines. ${medSpeechList}. Make sure to take them with water as advised by your doctor.`;

    setSpeaking(true);
    speakText(fullText, () => setSpeaking(false));
  };

  // Stats calculation
  const totalActive = meds.length;
  const expiredCount = meds.filter(m => {
    const s = expiryStatus(m.expiryDate);
    return s && s.cls === 'exp';
  }).length;
  const warnCount = meds.filter(m => {
    const s = expiryStatus(m.expiryDate);
    return s && s.cls === 'warn';
  }).length;
  const takenCount = meds.filter(m => m.takenToday).length;

  // Filtered meds
  const filteredMeds = meds.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      (m.genericName && m.genericName.toLowerCase().includes(q)) ||
      (m.cond && m.cond.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (filterTab === 'all') return true;
    if (filterTab === 'expired') {
      const s = expiryStatus(m.expiryDate);
      return s && (s.cls === 'exp' || s.cls === 'warn');
    }
    return m.tod === filterTab || m.tod === 'any';
  });

  return (
    <div className="space-y-5 pb-24">
      {/* View Gradient Header */}
      <div className="gh-meds rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className={`font-black tracking-widest uppercase opacity-90 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('meds_subtitle')}
            </div>
            <h1 className={`font-black tracking-tight ${isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-2xl'}`}>
              {t('meds_title')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isSeniorMode && (
              <button
                onClick={handleReadMedicinesAloud}
                className={`px-3.5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                  speaking
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                }`}
                title={t('read_meds_aloud')}
              >
                {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{speaking ? t('stop_voice_btn') : t('read_meds_aloud')}</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className={`rounded-2xl bg-white text-[#A84B06] font-black shadow-md hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-1.5 ${
                isSeniorMode ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'
              }`}
            >
              <Plus size={isSeniorMode ? 18 : 16} /> {t('add_medication')}
            </button>
          </div>
        </div>

        {/* 3 Stat Pills with Plain English */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-sm text-center">
            <div className={`font-black ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>{totalActive}</div>
            <div className={`opacity-85 font-bold uppercase ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('total_pills')}
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-sm text-center">
            <div className={`font-black text-amber-300 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
              {warnCount + expiredCount}
            </div>
            <div className={`opacity-85 font-bold uppercase ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('expiry_alerts')}
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-sm text-center">
            <div className={`font-black text-green-300 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
              {takenCount}/{totalActive}
            </div>
            <div className={`opacity-85 font-bold uppercase ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('taken_today')}
            </div>
          </div>
        </div>
      </div>

      {/* Active High-Risk Drug Interactions Warning Banner */}
      {activeInteractions.length > 0 && (
        <div id="active-drug-interactions-alert" className="p-4 rounded-3xl bg-red-50 border-2 border-red-400 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-red-600 text-white font-black text-xs uppercase shadow-xs">
                ⚠️ {t('interaction_warning')}
              </span>
              <span className="font-black text-xs sm:text-sm text-red-950">
                {activeInteractions.length} {t('interaction_warning')}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {activeInteractions.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-2xl border border-red-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-black text-red-900">
                  <span>💊 {item.medA} ⚡ {item.medB}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase text-white font-black ${
                    item.warning.severity === 'FATAL' ? 'bg-red-900' : item.warning.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-amber-600'
                  }`}>
                    {item.warning.severity}
                  </span>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {item.warning.risk}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Camera Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={isSeniorMode ? 20 : 16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className={`w-full bg-white rounded-2xl border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-[#DC7009] shadow-xs ${
                isSeniorMode ? 'pl-11 pr-4 py-3.5 text-sm' : 'pl-10 pr-4 py-2.5 text-xs'
              }`}
            />
          </div>
          <button
            onClick={() => {
              onOpenScanner((code, info) => {
                setBarcode(code);
                if (info) {
                  setMedName(info.name);
                  setGenericName(info.generic);
                  setCond(info.cat);
                }
                setIsModalOpen(true);
              });
            }}
            className={`bg-white border-2 border-[#DC7009]/30 rounded-2xl text-[#DC7009] hover:bg-orange-50 active:scale-95 transition-all shadow-sm flex items-center justify-center ${
              isSeniorMode ? 'p-3.5 min-w-[54px]' : 'p-2.5'
            }`}
            title={t('scan_barcode')}
          >
            <Camera size={isSeniorMode ? 22 : 18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: `📋 ${t('tab_all')}` },
            { id: 'morning', label: `🌅 ${t('tab_morning')}` },
            { id: 'afternoon', label: `☀️ ${t('tab_afternoon')}` },
            { id: 'evening', label: `🌆 ${t('tab_evening')}` },
            { id: 'night', label: `🌙 ${t('tab_night')}` },
            { id: 'expired', label: `⚠️ ${t('expiring_soon')}` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`font-black whitespace-nowrap transition-all rounded-full ${
                isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-3.5 py-1.5 text-xs'
              } ${
                filterTab === tab.id
                  ? 'bg-[#DC7009] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-[#5C4030] hover:bg-orange-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medication Cards List */}
      <div className="space-y-4">
        {filteredMeds.length > 0 ? (
          filteredMeds.map((med) => {
            const exp = expiryStatus(med.expiryDate);
            const timeData = formatTimeOfDayPlain(med.tod);
            const plainFreq = formatFrequencyPlain(med.freq);

            const medInteraction = activeInteractions.find(it =>
              it.medA.toLowerCase() === med.name.toLowerCase() ||
              it.medB.toLowerCase() === med.name.toLowerCase()
            );

            return (
              <div
                key={med.id}
                className={`bg-white rounded-3xl border shadow-sm transition-all hover:shadow-md ${
                  isSeniorMode ? 'p-5' : 'p-4'
                } ${
                  med.takenToday
                    ? 'border-2 border-emerald-400 bg-emerald-50/25'
                    : medInteraction
                    ? 'border-2 border-red-400 bg-red-50/15'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Top Medicine Details Header */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`font-black text-[#1A0E06] ${isSeniorMode ? 'text-lg sm:text-xl' : 'text-base'} ${
                        med.takenToday ? 'line-through text-emerald-950/70' : ''
                      }`}>
                        {med.name}
                      </h3>

                      {medInteraction && (
                        <span
                          className={`font-black px-2.5 py-0.5 rounded-full text-white bg-red-600 flex items-center gap-1 shadow-xs ${
                            isSeniorMode ? 'text-xs' : 'text-[10px]'
                          }`}
                          title={`Interaction warning with ${medInteraction.medA.toLowerCase() === med.name.toLowerCase() ? medInteraction.medB : medInteraction.medA}`}
                        >
                          <span>⚡</span> Interaction Risk
                        </span>
                      )}

                      {exp && (
                        <span
                          className={`font-black px-2.5 py-0.5 rounded-full ${
                            isSeniorMode ? 'text-xs' : 'text-[10px]'
                          } ${
                            exp.cls === 'exp'
                              ? 'bg-red-600 text-white'
                              : exp.cls === 'warn'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {exp.label}
                        </span>
                      )}
                    </div>

                    {/* Dosage, Timing & Instruction in Very Simple English */}
                    <div className="space-y-1.5 mt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-black bg-orange-100 text-[#A84B06] px-3 py-1 rounded-xl ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                          {t('dose')}: {med.dose}
                        </span>

                        <span className={`font-bold text-gray-700 flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-xl ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                          <span>{timeData.icon}</span> {timeData.label} at {med.time}
                        </span>
                      </div>

                      <div className={`font-semibold text-[#5C4030] ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                        {t('time')}: <span className="font-bold text-gray-900">{plainFreq}</span> ({timeData.when})
                      </div>

                      {med.cond && (
                        <div className={`font-bold text-[#DC7009] flex items-center gap-1 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                          <span>🎯 {t('medical_conditions')}:</span> {med.cond}
                        </div>
                      )}

                      {med.notes && (
                        <div className={`bg-amber-500/10 p-2.5 rounded-xl text-amber-950 font-medium ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                          💡 <strong>{t('emergency_notes_label')}:</strong> {med.notes}
                        </div>
                      )}

                      {med.stock !== undefined && (
                        <div className={`text-gray-500 font-semibold ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                          {t('stock')}: {med.stock}
                        </div>
                      )}

                      {med.daysSupply !== undefined && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {med.daysSupply <= 5 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-[10px] font-black border border-red-200 flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={12} /> {t('refill_needed')}: {med.daysSupply} {t('days_supply')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                              📦 {med.daysSupply} {t('days_supply')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Big "I Took This" Button for Seniors */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {/* Big Check Button */}
                    <button
                      onClick={() => handleToggleTaken(med.id)}
                      className={`flex items-center justify-center gap-2 rounded-2xl font-black transition-all active:scale-95 shadow-md ${
                        med.takenToday
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#FEF8F3] hover:bg-[#FEF2E0] text-[#DC7009] border-2 border-[#DC7009]/40'
                      } ${
                        isSeniorMode
                          ? 'w-full sm:w-auto px-5 py-3.5 text-sm min-h-[50px]'
                          : 'px-3.5 py-2 text-xs'
                      }`}
                      title={med.takenToday ? t('taken_today') : t('mark_taken')}
                    >
                      <Check size={isSeniorMode ? 20 : 16} className={med.takenToday ? 'stroke-[3]' : ''} />
                      <span>{med.takenToday ? `✅ ${t('taken_today')}` : t('mark_taken')}</span>
                    </button>

                    {/* Edit and Delete Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEdit(med)}
                        className={`text-gray-500 hover:text-[#DC7009] rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center ${
                          isSeniorMode ? 'w-10 h-10' : 'p-2'
                        }`}
                        title={t('edit_profile_btn')}
                      >
                        <Edit2 size={isSeniorMode ? 18 : 15} />
                      </button>
                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className={`text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center ${
                          isSeniorMode ? 'w-10 h-10' : 'p-2'
                        }`}
                        title={t('delete_med_confirm')}
                      >
                        <Trash2 size={isSeniorMode ? 18 : 15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300 space-y-2">
            <div className="text-4xl mb-2">💊</div>
            <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
              {t('no_meds_category')}
            </div>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-6 py-3 bg-[#DC7009] hover:bg-[#A84B06] text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95"
            >
              {t('add_medication')}
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Medication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#DC7009]/20">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FEF8F3]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FEF2E0] text-[#DC7009] flex items-center justify-center text-xl font-bold">
                  💊
                </div>
                <h2 className={`font-black text-[#1A0E06] ${isSeniorMode ? 'text-lg' : 'text-base'}`}>
                  {editingMed ? t('edit_profile_btn') : t('add_medication')}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm no-scrollbar">
              {/* Medicine Name with Autocomplete */}
              <div className="relative">
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  {t('active_medications')} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => handleMedSearch(e.target.value)}
                    placeholder="e.g. Metformin, Dolo 650, Telma 40..."
                    className={`flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#DC7009] font-black text-gray-900 ${
                      isSeniorMode ? 'text-base' : 'text-sm'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onOpenScanner((code, info) => {
                        setBarcode(code);
                        if (info) {
                          setMedName(info.name);
                          setGenericName(info.generic);
                          setCond(info.cat);
                        }
                      });
                    }}
                    className="px-4 py-3 bg-orange-50 border-2 border-[#DC7009]/30 rounded-2xl text-[#DC7009] hover:bg-[#DC7009] hover:text-white transition-all flex items-center gap-1.5 text-xs font-black"
                    title={t('scan_barcode')}
                  >
                    <Camera size={18} /> {t('scan_barcode')}
                  </button>
                </div>

                {medSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-orange-200 z-20 max-h-48 overflow-y-auto p-1">
                    {medSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectMed(item.term, item.cat)}
                        className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-orange-50 flex justify-between items-center rounded-xl transition-colors"
                      >
                        <span className="font-black text-gray-900">{item.term}</span>
                        <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                          {item.cat}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-time Interaction Warning Banner */}
              {modalWarnings.length > 0 && (
                <div
                  id="drug-interaction-warning-banner"
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2 animate-in fade-in slide-in-from-top-1 ${
                    modalWarnings[0].severity === 'FATAL'
                      ? 'bg-red-950/15 border-red-700 text-red-950'
                      : modalWarnings[0].severity === 'CRITICAL'
                      ? 'bg-red-50 border-red-500 text-red-950'
                      : 'bg-amber-50 border-amber-500 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-white shadow-xs ${
                      modalWarnings[0].severity === 'FATAL'
                        ? 'bg-red-900'
                        : modalWarnings[0].severity === 'CRITICAL'
                        ? 'bg-red-600'
                        : 'bg-amber-600'
                    }`}>
                      {modalWarnings[0].severity}
                    </span>
                    <strong className="text-xs font-black uppercase tracking-wide">
                      ⚠️ Drug Interaction Detected
                    </strong>
                  </div>
                  <p className="text-xs font-bold text-red-950">
                    Conflicts with active medication: <span className="underline decoration-2 font-black text-red-700">{modalWarnings[0].conflictingWith}</span>
                  </p>
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    {modalWarnings[0].risk}
                  </p>
                </div>
              )}

              {/* Generic Name */}
              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Generic Formula / Salt Name (Optional)
                </label>
                <input
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Metformin Hydrochloride, Paracetamol"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-xs font-semibold"
                />
              </div>

              {/* Dosage & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                    How Much to Take (Dose)
                  </label>
                  <input
                    type="text"
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    placeholder="e.g. 1 tablet, 1 spoon, 2 drops"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-sm font-bold"
                  />
                </div>
                <div>
                  <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                    How Often (Frequency)
                  </label>
                  <select
                    value={freq}
                    onChange={(e) => setFreq(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-xs font-black bg-white"
                  >
                    <option value="OD">Once every day (OD)</option>
                    <option value="BD">Twice every day - Morning & Night (BD)</option>
                    <option value="TDS">3 times every day (TDS)</option>
                    <option value="QID">4 times every day (QID)</option>
                    <option value="PRN">Only when in pain / As needed (SOS)</option>
                    <option value="Alternate">Every alternate day</option>
                    <option value="Weekly">Once a week</option>
                  </select>
                </div>
              </div>

              {/* Timing & Time of Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                    Time of Day
                  </label>
                  <select
                    value={tod}
                    onChange={(e) => setTod(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-xs font-black bg-white"
                  >
                    <option value="morning">🌅 Morning (After breakfast)</option>
                    <option value="afternoon">☀️ Afternoon (After lunch)</option>
                    <option value="evening">🌆 Evening (With tea / snacks)</option>
                    <option value="night">🌙 Night (Before sleeping)</option>
                    <option value="any">🔄 Anytime / As needed</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                    Alarm Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-sm font-bold"
                  />
                </div>
              </div>

              {/* Expiry Date & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                    Medicine Expiry Month
                  </label>
                  <input
                    type="month"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                    What is it for? (Health Reason)
                  </label>
                  <input
                    type="text"
                    value={cond}
                    onChange={(e) => setCond(e.target.value)}
                    placeholder="e.g. Blood Sugar, Blood Pressure, Joint Pain"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Prescription Refill Countdown Supply */}
              <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block font-black text-[#5C4030] uppercase ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                    Prescription Stock / Refill Countdown (Days Supply)
                  </label>
                  <span className="text-[10px] text-orange-800 font-bold">Refill reminder at ≤ 5 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={daysSupply !== undefined ? daysSupply : ''}
                    onChange={(e) => setDaysSupply(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 30 days supply"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-xs font-black bg-white"
                  />
                  <div className="flex gap-1">
                    {[15, 30, 60, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDaysSupply(d)}
                        className="px-2.5 py-2 bg-white rounded-xl border border-gray-200 hover:border-[#DC7009] text-[11px] font-bold text-gray-700"
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Special Instructions from Doctor
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Take with a glass of warm milk after food..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#DC7009]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl bg-white border border-gray-200 text-[#5C4030] font-black hover:bg-gray-100 text-sm"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className={`flex-1 py-3.5 rounded-2xl text-white font-black hover:opacity-95 active:scale-95 shadow-md text-sm transition-all ${
                  modalWarnings.length > 0
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/40 ring-2 ring-red-400'
                    : 'bg-gradient-to-r from-[#A84B06] to-[#DC7009] shadow-[#DC7009]/30'
                }`}
              >
                {modalWarnings.length > 0 ? '⚠️ Acknowledge & Add Anyway' : t('save_med')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
