import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Building,
  Edit2,
  Trash2,
  X,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Doctor } from '../types';
import { genId } from '../utils/storage';
import { speakText, stopSpeaking } from '../utils/speech';
import { useI18n } from '../utils/i18n';

interface DoctorsViewProps {
  doctors: Doctor[];
  onSaveDoctors: (doctors: Doctor[]) => void;
  isSeniorMode?: boolean;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  onSaveDoctors,
  isSeniorMode = false
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doctor | null>(null);
  const [speaking, setSpeaking] = useState<boolean>(false);

  // Form states
  const [docName, setDocName] = useState('');
  const [spec, setSpec] = useState('');
  const [phone, setPhone] = useState('');
  const [hosp, setHosp] = useState('');
  const [addr, setAddr] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setDocName('');
    setSpec('');
    setPhone('');
    setHosp('');
    setAddr('');
    setEmail('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoc(doc);
    setDocName(doc.name);
    setSpec(doc.spec);
    setPhone(doc.phone);
    setHosp(doc.hosp || '');
    setAddr(doc.addr || '');
    setEmail(doc.email || '');
    setNotes(doc.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!docName.trim() || !phone.trim()) {
      alert('Please enter doctor name and phone number');
      return;
    }

    const payload: Doctor = {
      id: editingDoc ? editingDoc.id : genId('DOC'),
      name: docName.trim(),
      spec: spec.trim() || 'Family Doctor / General Physician',
      phone: phone.trim(),
      hosp: hosp.trim() || undefined,
      addr: addr.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined
    };

    if (editingDoc) {
      onSaveDoctors(doctors.map(d => (d.id === editingDoc.id ? payload : d)));
    } else {
      onSaveDoctors([payload, ...doctors]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Do you want to remove this doctor from your list?')) {
      onSaveDoctors(doctors.filter(d => d.id !== id));
    }
  };

  const handleReadDoctorsAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    if (doctors.length === 0) {
      speakText('No doctors saved in your directory.');
      return;
    }

    const docScript = doctors.map((d, idx) => {
      return `Doctor number ${idx + 1}: ${d.name}, specialist for ${d.spec}. Hospital or clinic: ${d.hosp || 'Not specified'}. Phone number is ${d.phone}.`;
    }).join('. ');

    const fullText = `You have ${doctors.length} doctors saved in your directory. ${docScript}. Tap the green call button on any doctor card to speak with them directly.`;

    setSpeaking(true);
    speakText(fullText, () => setSpeaking(false));
  };

  const filteredDoctors = doctors.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.spec.toLowerCase().includes(q) ||
      (d.hosp && d.hosp.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Header Gradient */}
      <div className="gh-docs rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className={`font-black tracking-widest uppercase opacity-90 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('doctors_subtitle')}
            </div>
            <h1 className={`font-black tracking-tight ${isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-2xl'}`}>
              {t('doctors_title')}
            </h1>
            <p className={`text-white/85 font-medium mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
              {t('doctors_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSeniorMode && (
              <button
                onClick={handleReadDoctorsAloud}
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
              className={`rounded-2xl bg-white text-[#5E258D] font-black shadow-md hover:bg-purple-50 active:scale-95 transition-all flex items-center gap-1.5 ${
                isSeniorMode ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'
              }`}
            >
              <Plus size={isSeniorMode ? 18 : 16} /> {t('add_doctor')}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={isSeniorMode ? 20 : 16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_doctors_placeholder')}
          className={`w-full bg-white rounded-2xl border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs ${
            isSeniorMode ? 'pl-12 pr-4 py-3.5 text-sm' : 'pl-10 pr-4 py-2.5 text-xs'
          }`}
        />
      </div>

      {/* Doctor Cards */}
      <div className="space-y-4">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className={`bg-white rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:border-purple-300 transition-all ${
                isSeniorMode ? 'p-5 sm:p-6' : 'p-5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`rounded-2xl bg-purple-100 text-[#7B1FA2] flex items-center justify-center shrink-0 ${
                    isSeniorMode ? 'w-14 h-14 text-2xl' : 'w-12 h-12'
                  }`}>
                    <Stethoscope size={isSeniorMode ? 28 : 24} />
                  </div>

                  <div className="min-w-0">
                    <h3 className={`font-black text-gray-900 leading-tight ${isSeniorMode ? 'text-lg sm:text-xl' : 'text-sm'}`}>
                      {doc.name}
                    </h3>
                    <div className={`font-black text-[#7B1FA2] mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                      {doc.spec}
                    </div>
                    {doc.hosp && (
                      <div className={`text-gray-600 font-semibold flex items-center gap-1 mt-1 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                        <Building size={14} className="text-gray-400 shrink-0" />
                        <span>{doc.hosp}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(doc)}
                    className={`text-gray-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center ${
                      isSeniorMode ? 'w-10 h-10' : 'p-2'
                    }`}
                    title={t('edit_profile_btn')}
                  >
                    <Edit2 size={isSeniorMode ? 18 : 15} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className={`text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center ${
                      isSeniorMode ? 'w-10 h-10' : 'p-2'
                    }`}
                    title={t('clear_data_btn')}
                  >
                    <Trash2 size={isSeniorMode ? 18 : 15} />
                  </button>
                </div>
              </div>

              {doc.addr && (
                <div className={`text-gray-700 font-medium flex items-start gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                  <MapPin size={16} className="text-purple-600 shrink-0 mt-0.5" />
                  <span>{doc.addr}</span>
                </div>
              )}

              {doc.notes && (
                <div className={`text-purple-950 bg-purple-50 p-3 rounded-2xl border border-purple-200 font-semibold ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                  💡 <strong>{t('emergency_notes_label')}:</strong> {doc.notes}
                </div>
              )}

              {/* Big Action Buttons: Call, WhatsApp, Email, Map */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-gray-100">
                {/* Big Call Button */}
                <a
                  href={`tel:${doc.phone}`}
                  className={`rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                    isSeniorMode
                      ? 'flex-1 py-4 text-sm sm:text-base min-h-[52px]'
                      : 'flex-1 py-2.5 text-xs'
                  }`}
                  title={t('call_doctor')}
                >
                  <Phone size={isSeniorMode ? 20 : 15} />
                  <span>{t('call_doctor')}</span>
                </a>

                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/${doc.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                    isSeniorMode
                      ? 'py-4 px-5 text-sm min-h-[52px]'
                      : 'flex-1 py-2.5 text-xs'
                  }`}
                  title={t('chat_whatsapp')}
                >
                  <MessageSquare size={isSeniorMode ? 18 : 14} />
                  <span>{t('chat_whatsapp')}</span>
                </a>

                {doc.addr && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(doc.addr + (doc.hosp ? ' ' + doc.hosp : ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isSeniorMode
                        ? 'py-4 px-4 text-sm min-h-[52px]'
                        : 'p-2.5 text-xs'
                    }`}
                    title={t('directions_hospital')}
                  >
                    <MapPin size={isSeniorMode ? 18 : 14} />
                    <span>{t('directions_hospital')}</span>
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300 space-y-2">
            <div className="text-4xl mb-2">🩺</div>
            <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
              {t('no_doctors_found')}
            </div>
            <p className={`text-gray-600 ${isSeniorMode ? 'text-sm font-medium' : 'text-xs'}`}>
              {t('doctors_subtitle')}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-6 py-3 bg-[#7B1FA2] hover:bg-[#5E258D] text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-95"
            >
              {t('add_doctor')}
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-purple-500/20">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FEF8F3]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#7B1FA2] flex items-center justify-center text-xl font-bold">
                  🩺
                </div>
                <h2 className={`font-black text-gray-900 ${isSeniorMode ? 'text-lg' : 'text-base'}`}>
                  {editingDoc ? 'Edit Doctor Details' : 'Add New Doctor'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm no-scrollbar">
              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Doctor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className={`w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-purple-600 font-black text-gray-900 ${
                    isSeniorMode ? 'text-base' : 'text-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Specialty (e.g. Heart, Eye, Sugar, Bones)
                </label>
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  placeholder="e.g. Heart Doctor (Cardiologist), Family Doctor"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-purple-600 text-sm font-semibold"
                />
              </div>

              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Phone Number to Call <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-purple-600 font-mono font-black text-gray-900 ${
                    isSeniorMode ? 'text-base' : 'text-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  value={hosp}
                  onChange={(e) => setHosp(e.target.value)}
                  placeholder="e.g. Apollo Hospital, City Clinic"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Clinic Address
                </label>
                <input
                  type="text"
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                  placeholder="e.g. Near Central Park, MG Road"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className={`block font-black text-[#5C4030] uppercase mb-1.5 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                  Notes & Clinic Timings
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Available Mon-Fri 5 PM to 8 PM. Take prior appointment."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm"
                />
              </div>
            </div>

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
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#5E258D] to-[#8A4CBF] text-white font-black hover:opacity-90 active:scale-95 shadow-md text-sm"
              >
                {t('save_med')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
