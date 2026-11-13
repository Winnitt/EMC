import React, { useEffect } from 'react';
import { AlertTriangle, Bell, X, Pill, ArrowRight } from 'lucide-react';
import { Medication } from '../types';
import { expiryStatus } from '../utils/storage';
import { playAlarmTone } from '../utils/audio';

interface ExpiryAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  meds: Medication[];
  onViewMeds: () => void;
}

export const ExpiryAlarmModal: React.FC<ExpiryAlarmModalProps> = ({
  isOpen,
  onClose,
  meds,
  onViewMeds
}) => {
  useEffect(() => {
    if (isOpen && meds.length > 0) {
      playAlarmTone(3);
    }
  }, [isOpen, meds.length]);

  if (!isOpen || meds.length === 0) return null;

  const expiredList = meds.filter(m => {
    const s = expiryStatus(m.expiryDate);
    return s && s.cls === 'exp';
  });

  const expiringSoonList = meds.filter(m => {
    const s = expiryStatus(m.expiryDate);
    return s && s.cls === 'warn';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FF3B30] animate-in zoom-in-95 text-center">
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-[#C0392B] to-[#FF3B30] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10"
          >
            <X size={18} />
          </button>
          
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center text-white mb-3 shadow-inner">
            <AlertTriangle size={32} className="animate-bounce" />
          </div>

          <h2 className="font-extrabold text-xl tracking-tight">
            MEDICATION EXPIRY ALERT
          </h2>
          <p className="text-xs text-white/90 mt-1 font-medium">
            Attention required for your daily medicine inventory
          </p>
        </div>

        {/* Medicine Alert List */}
        <div className="p-5 max-h-64 overflow-y-auto space-y-3 text-left no-scrollbar">
          {expiredList.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase text-[#FF3B30] flex items-center gap-1">
                ⛔ Expired (Do Not Consume)
              </div>
              {expiredList.map(m => (
                <div
                  key={m.id}
                  className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-red-950 flex items-center gap-1.5">
                      <Pill size={14} className="text-red-500" /> {m.name}
                    </div>
                    <div className="text-[11px] text-red-700 mt-0.5">{m.dose} • {m.cond || 'Med'}</div>
                  </div>
                  <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
                    EXPIRED
                  </span>
                </div>
              ))}
            </div>
          )}

          {expiringSoonList.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-extrabold uppercase text-[#FF9500] flex items-center gap-1">
                ⚠️ Expiring Soon (Within 30 Days)
              </div>
              {expiringSoonList.map(m => {
                const s = expiryStatus(m.expiryDate);
                return (
                  <div
                    key={m.id}
                    className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <Pill size={14} className="text-amber-500" /> {m.name}
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">{m.dose} • {m.cond || 'Med'}</div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      {s?.days}d left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2.5">
          <button
            onClick={() => {
              playAlarmTone(2);
            }}
            className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-1"
            title="Re-play buzzer sound"
          >
            <Bell size={16} /> Beep
          </button>
          <button
            onClick={() => {
              onClose();
              onViewMeds();
            }}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#A84B06] to-[#DC7009] text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 shadow-md shadow-[#DC7009]/30 flex items-center justify-center gap-1"
          >
            Manage Medications <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
