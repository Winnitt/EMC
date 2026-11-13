import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Shield, Heart, Camera } from 'lucide-react';
import { UserProfile, EmergencyContact } from '../types';
import { ALLERGY_SEARCH } from '../data/allergyDb';
import { CONDITIONS_LIST } from '../data/conditionsDb';
import { compressImage } from '../utils/ocr';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [allergyInput, setAllergyInput] = useState('');
  const [allergySuggestions, setAllergySuggestions] = useState<typeof ALLERGY_SEARCH>([]);
  const [condInput, setCondInput] = useState('');
  const [condSuggestions, setCondSuggestions] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(profile.photo);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
      setPhotoPreview(profile.photo);
      setAllergyInput('');
      setCondInput('');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      const compressed = await compressImage(raw, 300, 0.75);
      setPhotoPreview(compressed);
      setFormData(prev => ({ ...prev, photo: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleAllergySearch = (val: string) => {
    setAllergyInput(val);
    if (!val.trim()) {
      setAllergySuggestions([]);
      return;
    }
    const q = val.toLowerCase();
    const existing = new Set(formData.allergies || []);
    const matches = ALLERGY_SEARCH.filter(
      item => item.term.toLowerCase().includes(q) && !existing.has(item.term)
    ).slice(0, 8);
    setAllergySuggestions(matches);
  };

  const addAllergy = (term: string) => {
    if (!term.trim()) return;
    const trimmed = term.trim();
    if (!formData.allergies.includes(trimmed)) {
      setFormData(prev => ({ ...prev, allergies: [...prev.allergies, trimmed] }));
    }
    setAllergyInput('');
    setAllergySuggestions([]);
  };

  const removeAllergy = (term: string) => {
    setFormData(prev => ({ ...prev, allergies: prev.allergies.filter(a => a !== term) }));
  };

  const handleCondSearch = (val: string) => {
    setCondInput(val);
    if (!val.trim()) {
      setCondSuggestions([]);
      return;
    }
    const q = val.toLowerCase();
    const existing = new Set(formData.conditions || []);
    const matches = CONDITIONS_LIST.filter(
      c => c.toLowerCase().includes(q) && !existing.has(c)
    ).slice(0, 8);
    setCondSuggestions(matches);
  };

  const addCondition = (term: string) => {
    if (!term.trim()) return;
    const trimmed = term.trim();
    if (!formData.conditions.includes(trimmed)) {
      setFormData(prev => ({ ...prev, conditions: [...prev.conditions, trimmed] }));
    }
    setCondInput('');
    setCondSuggestions([]);
  };

  const removeCondition = (term: string) => {
    setFormData(prev => ({ ...prev, conditions: prev.conditions.filter(c => c !== term) }));
  };

  const addContact = () => {
    const newContact: EmergencyContact = {
      id: 'c_' + Date.now(),
      name: '',
      phone: '',
      relationship: 'Family',
      isPrimary: formData.contacts.length === 0,
      isMasked: false
    };
    setFormData(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
  };

  const updateContact = (index: number, patch: Partial<EmergencyContact>) => {
    setFormData(prev => {
      const copy = [...prev.contacts];
      copy[index] = { ...copy[index], ...patch };
      if (patch.isPrimary) {
        copy.forEach((c, i) => {
          if (i !== index) c.isPrimary = false;
        });
      }
      return { ...prev, contacts: copy };
    });
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      alert('Please enter patient full name');
      return;
    }
    onSave(formData);
    onClose();
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Rh null', 'Unknown'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#DC7009]/20">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FEF8F3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FEF2E0] text-[#DC7009] flex items-center justify-center font-bold">
              🪪
            </div>
            <div>
              <h2 className="font-bold text-[#1A0E06] text-base sm:text-lg leading-tight">
                Edit Emergency Medical Card
              </h2>
              <span className="text-xs text-[#5C4030]">ID: {formData.id || 'EMC-00000'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm no-scrollbar">
          {/* Photo & Basic Details */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#FEF2E0] border-2 border-dashed border-[#DC7009]/40 flex items-center justify-center shadow-inner">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-[#A08060] p-2">
                    <Camera size={24} className="mx-auto mb-1 text-[#DC7009]" />
                    <span className="text-[10px] font-bold block">Add Photo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5C4030] uppercase mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC7009] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C4030] uppercase mb-1">
                    Blood Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC7009] font-bold text-[#DC7009] bg-white"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C4030] uppercase mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 62"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC7009]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5C4030] uppercase mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC7009]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C4030] uppercase mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC7009] bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Organ Donor & Insurance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#FEF8F3] rounded-2xl border border-[#DC7009]/15">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.organDonor || false}
                onChange={(e) => setFormData({ ...formData, organDonor: e.target.checked })}
                className="w-5 h-5 rounded text-[#DC7009] focus:ring-[#DC7009]"
              />
              <div>
                <span className="font-bold text-xs text-[#1A0E06] block">🫀 Organ Donor</span>
                <span className="text-[11px] text-[#5C4030]">Pledged for donation</span>
              </div>
            </label>

            <div>
              <label className="block text-[11px] font-bold text-[#5C4030] uppercase mb-1">Insurance / Policy #</label>
              <input
                type="text"
                value={formData.insurancePolicy || ''}
                onChange={(e) => setFormData({ ...formData, insurancePolicy: e.target.value })}
                placeholder="e.g. Star Health #SH-12345"
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:border-[#DC7009]"
              />
            </div>
          </div>

          {/* ALLERGIES FIELD */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#FF3B30] uppercase flex items-center gap-1.5">
                <Shield size={14} /> Critical Allergies ({formData.allergies.length})
              </label>
            </div>
            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-200 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {formData.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300"
                  >
                    ⚠️ {allergy}
                    <button
                      type="button"
                      onClick={() => removeAllergy(allergy)}
                      className="hover:text-red-900"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => handleAllergySearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllergy(allergyInput);
                    }
                  }}
                  placeholder="Type allergy (e.g. Penicillin, Peanuts, Pollen)..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 focus:outline-none focus:border-red-500 text-xs"
                />
                {allergySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-red-200 z-20 max-h-48 overflow-y-auto">
                    {allergySuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addAllergy(item.term)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                      >
                        <span className="font-semibold text-gray-800">{item.term}</span>
                        <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          {item.cat}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHRONIC CONDITIONS FIELD */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#A84B06] uppercase flex items-center gap-1.5">
                <Heart size={14} /> Chronic Conditions ({formData.conditions.length})
              </label>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {formData.conditions.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"
                  >
                    🫀 {c}
                    <button
                      type="button"
                      onClick={() => removeCondition(c)}
                      className="hover:text-amber-950"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={condInput}
                  onChange={(e) => handleCondSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCondition(condInput);
                    }
                  }}
                  placeholder="Type condition (e.g. Diabetes, Hypertension, Asthma)..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 focus:outline-none focus:border-amber-500 text-xs"
                />
                {condSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-amber-200 z-20 max-h-48 overflow-y-auto">
                    {condSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addCondition(item)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                      >
                        <span className="font-semibold text-gray-800">{item}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          Condition
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* EMERGENCY CONTACTS */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[#1A0E06] uppercase">
                Emergency Contacts ({formData.contacts.length})
              </label>
              <button
                type="button"
                onClick={addContact}
                className="text-xs font-bold text-[#DC7009] flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Add Contact
              </button>
            </div>

            <div className="space-y-3">
              {formData.contacts.map((contact, idx) => (
                <div
                  key={contact.id || idx}
                  className="p-3.5 rounded-2xl border border-gray-200 bg-[#FEF8F3] space-y-2.5 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#A84B06]">
                      Contact #{idx + 1} {contact.isPrimary && '★ PRIMARY'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeContact(idx)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(idx, { name: e.target.value })}
                      placeholder="Contact Name"
                      className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-none focus:border-[#DC7009]"
                    />
                    <input
                      type="text"
                      value={contact.relationship}
                      onChange={(e) => updateContact(idx, { relationship: e.target.value })}
                      placeholder="Relationship (e.g. Spouse, Son)"
                      className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-none focus:border-[#DC7009]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(idx, { phone: e.target.value })}
                      placeholder="Phone with country code (e.g. +91 9840012345)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:outline-none focus:border-[#DC7009]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.isPrimary}
                        onChange={(e) => updateContact(idx, { isPrimary: e.target.checked })}
                        className="rounded text-[#DC7009] focus:ring-[#DC7009]"
                      />
                      Primary Contact (SOS dial)
                    </label>

                    <label className="flex items-center gap-2 text-[11px] text-[#5C4030] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.isMasked || false}
                        onChange={(e) => updateContact(idx, { isMasked: e.target.checked })}
                        className="rounded text-[#DC7009]"
                      />
                      Mask Phone on Card
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Notes */}
          <div>
            <label className="block text-xs font-bold text-[#5C4030] uppercase mb-1">
              Emergency Clinical Notes & Directives
            </label>
            <textarea
              rows={3}
              value={formData.emergencyNotes || ''}
              onChange={(e) => setFormData({ ...formData, emergencyNotes: e.target.value })}
              placeholder="e.g. Has pacemaker, carry glucose tablets, sensitive to cold..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#DC7009] text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white border border-gray-200 text-[#5C4030] font-bold hover:bg-gray-100 active:scale-95 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#A84B06] to-[#DC7009] text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#DC7009]/30 text-sm"
          >
            Save Medical Card
          </button>
        </div>
      </div>
    </div>
  );
};
