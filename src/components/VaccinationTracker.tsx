import React, { useState } from 'react';
import { Syringe, Plus, CheckCircle2, AlertCircle, Clock, X, Shield, Trash2 } from 'lucide-react';
import { VaccinationRecord } from '../types';

interface VaccinationTrackerProps {
  vaccinations: VaccinationRecord[];
  onAddVaccination?: (record: Omit<VaccinationRecord, 'id'>) => void;
  onSaveVaccinations?: (records: VaccinationRecord[]) => void;
  isSeniorMode?: boolean;
}

export const VaccinationTracker: React.FC<VaccinationTrackerProps> = ({
  vaccinations,
  onAddVaccination,
  onSaveVaccinations,
  isSeniorMode = false
}) => {
  const [filter, setFilter] = useState<'all' | 'geriatric' | 'pediatric' | 'adult'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vaccineName, setVaccineName] = useState('');
  const [category, setCategory] = useState<'pediatric' | 'adult' | 'geriatric' | 'travel'>('adult');
  const [administeredDate, setAdministeredDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [doseNumber, setDoseNumber] = useState('Booster / Precaution Dose');
  const [clinic, setClinic] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = vaccinations.filter(v => filter === 'all' || v.category === filter);
  const hasCovidVaccine = vaccinations.some(v => v.vaccineName.toLowerCase().includes('covid'));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim()) return;

    const newRecord: VaccinationRecord = {
      id: `vac-${Date.now()}`,
      profileId: 'active',
      vaccineName: vaccineName.trim(),
      category,
      administeredDate,
      dueDate: dueDate.trim() || undefined,
      doseNumber: doseNumber.trim() || undefined,
      clinic: clinic.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      notes: notes.trim() || undefined
    };

    if (onAddVaccination) {
      onAddVaccination(newRecord);
    } else if (onSaveVaccinations) {
      onSaveVaccinations([newRecord, ...vaccinations]);
    }

    setIsModalOpen(false);
    setVaccineName('');
    setDueDate('');
    setClinic('');
    setBatchNumber('');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    if (onSaveVaccinations) {
      onSaveVaccinations(vaccinations.filter(v => v.id !== id));
    }
  };

  const quickTemplates = [
    {
      name: 'COVID-19 Vaccine (Covishield / Covaxin / Booster)',
      cat: 'adult' as const,
      dose: 'Precaution / Booster Dose',
      badge: 'COVID-19 Booster'
    },
    {
      name: 'COVID-19 Vaccine (Primary Dose 1 & 2)',
      cat: 'adult' as const,
      dose: 'Completed 2 Primary Doses',
      badge: 'COVID-19 Full Course'
    },
    {
      name: 'Pneumococcal (Pneumonia) PCV13 / PPSV23',
      cat: 'geriatric' as const,
      dose: 'Lifetime / 5-Yr Booster',
      badge: 'Pneumonia (PCV13)'
    },
    {
      name: 'Annual Influenza (Flu) Shot',
      cat: 'geriatric' as const,
      dose: 'Annual 2026',
      badge: 'Flu Shot'
    },
    {
      name: 'Shingles (Herpes Zoster) Vaccine',
      cat: 'geriatric' as const,
      dose: 'Dose 1 of 2',
      badge: 'Shingles'
    },
    {
      name: 'Tetanus Toxoid / Tdap Booster',
      cat: 'adult' as const,
      dose: '10-Yr Booster',
      badge: 'Tetanus / Tdap'
    },
    {
      name: 'MMR / Measles-Rubella',
      cat: 'pediatric' as const,
      dose: 'Dose 1',
      badge: 'MMR'
    }
  ];

  const handleOpenCovidQuickAdd = () => {
    setVaccineName('COVID-19 Vaccine (Covishield / Covaxin / Precaution)');
    setCategory('adult');
    setDoseNumber('Precaution / Booster Dose');
    setClinic('Government Health Center / Hospital');
    setNotes('Verified CoWIN immunization record');
    setIsModalOpen(true);
  };

  return (
    <div id="vaccination-tracker-card" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className={`font-black text-[#1A0E06] flex items-center gap-1.5 ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
            <Syringe className="text-[#DC7009]" size={20} />
            <span>Vaccinations & Boosters</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Geriatric, Adult & Pediatric Immunization</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-[#DC7009] hover:bg-[#A84B06] text-white font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
        >
          <Plus size={16} />
          <span>Add Vaccine</span>
        </button>
      </div>

      {/* Quick COVID-19 Status Highlight / Prompt */}
      {!hasCovidVaccine && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500 text-white font-bold text-sm shrink-0">
              🦠
            </span>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-[#1A0E06]">
                COVID-19 Vaccine Not Recorded
              </h4>
              <p className="text-[11px] text-gray-600 font-medium">
                Keep Covishield, Covaxin or precaution booster records accessible for medical teams & travel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenCovidQuickAdd}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-[#DC7009] hover:bg-[#A84B06] text-white font-black text-xs shadow-sm flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add COVID Vaccine</span>
          </button>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-1.5">
        {(['all', 'geriatric', 'adult', 'pediatric'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize transition-all ${
              filter === f
                ? 'bg-[#1A0E06] text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'geriatric' ? 'Senior / 60+' : f}
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-2.5">
        {filtered.length > 0 ? (
          filtered.map(v => (
            <div
              key={v.id}
              className="p-3 rounded-xl bg-[#FEF8F3] border border-orange-100 flex items-start justify-between gap-2"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-[#DC7009] shrink-0 mt-0.5">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#1A0E06] flex items-center gap-2">
                    <span>{v.vaccineName}</span>
                    {v.vaccineName.toLowerCase().includes('covid') && (
                      <span className="px-1.5 py-0.5 rounded-md bg-orange-200/60 text-orange-900 text-[10px] font-black tracking-wide">
                        COVID-19
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-600 font-semibold">
                    <span>Administered: {v.administeredDate}</span>
                    {v.doseNumber && <span className="text-orange-700">• {v.doseNumber}</span>}
                    {v.clinic && <span>• Clinic: {v.clinic}</span>}
                    {v.batchNumber && <span className="font-mono text-[10px]">({v.batchNumber})</span>}
                  </div>
                  {v.notes && <p className="text-xs text-gray-500 italic mt-0.5">{v.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {v.dueDate ? (
                  <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1 border border-amber-200">
                    <Clock size={12} /> Due: {v.dueDate}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 size={12} /> Protected
                  </span>
                )}

                {onSaveVaccinations && (
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm font-bold text-gray-600">No vaccination records in this category</p>
            <p className="text-xs text-gray-400 mt-1">Add COVID-19, pneumonia, flu, or booster shots to stay protected</p>
          </div>
        )}
      </div>

      {/* Add Vaccine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h3 className="font-black text-base text-[#1A0E06] flex items-center gap-1.5">
                <Syringe size={18} className="text-[#DC7009]" />
                <span>Add Vaccination Record</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">
                QUICK CLINICAL TEMPLATES
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setVaccineName(tpl.name);
                      setCategory(tpl.cat);
                      setDoseNumber(tpl.dose);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-orange-50 text-[11px] font-bold text-gray-700 hover:text-[#DC7009] border border-gray-200 transition-colors text-left"
                  >
                    + {tpl.badge}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vaccine Name</label>
                <input
                  type="text"
                  value={vaccineName}
                  onChange={e => setVaccineName(e.target.value)}
                  placeholder="e.g., Pneumococcal PPSV23, Flu Shot"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-white"
                  >
                    <option value="geriatric">Geriatric (60+)</option>
                    <option value="adult">Adult</option>
                    <option value="pediatric">Pediatric</option>
                    <option value="travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Dose / Schedule</label>
                  <input
                    type="text"
                    value={doseNumber}
                    onChange={e => setDoseNumber(e.target.value)}
                    placeholder="e.g. Booster, Dose 1"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Administered Date</label>
                  <input
                    type="date"
                    value={administeredDate}
                    onChange={e => setAdministeredDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Next Due / Booster</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    value={clinic}
                    onChange={e => setClinic(e.target.value)}
                    placeholder="e.g., Apollo Clinic"
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Batch / Lot Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={e => setBatchNumber(e.target.value)}
                    placeholder="e.g., LOT-8942"
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Clinical Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g., Given in left deltoid, no immediate reaction"
                  className="w-full p-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 font-bold text-xs text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#DC7009] hover:bg-[#A84B06] font-black text-xs text-white shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
