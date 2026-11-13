import React, { useState, useEffect } from 'react';
import { Lock, Delete, X, ShieldCheck } from 'lucide-react';
import { getPin, savePin } from '../utils/storage';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'verify' | 'setup';
  title?: string;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  title
}) => {
  const [digits, setDigits] = useState<string>('');
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setDigits('');
      setSetupStep(1);
      setFirstPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPin = getPin();

  const handleDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setErrorMsg('');

    if (next.length === 4) {
      setTimeout(() => {
        handleComplete(next);
      }, 150);
    }
  };

  const handleDelete = () => {
    setDigits(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleComplete = (entered: string) => {
    if (mode === 'verify') {
      if (entered === currentPin) {
        onSuccess();
        onClose();
      } else {
        triggerShake('Incorrect PIN. Please try again.');
      }
    } else {
      // Setup mode
      if (setupStep === 1) {
        setFirstPin(entered);
        setDigits('');
        setSetupStep(2);
      } else {
        if (entered === firstPin) {
          savePin(entered);
          onSuccess();
          onClose();
        } else {
          triggerShake('PINs did not match. Start over.');
          setSetupStep(1);
          setFirstPin('');
        }
      }
    }
  };

  const triggerShake = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setDigits('');
      setIsShaking(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-[#DC7009]/20 text-center ${isShaking ? 'animate-bounce' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-[#FEF2E0] flex items-center justify-center text-[#DC7009] mx-auto">
            {mode === 'setup' ? <ShieldCheck size={20} /> : <Lock size={20} />}
          </div>
          <button
            onClick={onClose}
            className="text-[#A08060] hover:text-[#1A0E06] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="font-bold text-lg text-[#1A0E06]">
          {title || (mode === 'setup'
            ? setupStep === 1 ? 'Create 4-Digit Security PIN' : 'Confirm Your New PIN'
            : 'Enter Security PIN')}
        </h3>
        <p className="text-xs text-[#5C4030] mt-1 mb-6">
          {mode === 'setup'
            ? setupStep === 1 ? 'Protects your sensitive medical data' : 'Re-enter your 4 digits to confirm'
            : 'Enter your 4-digit PIN to edit records'}
        </p>

        {/* 4 Dot Indicators */}
        <div className="flex justify-center items-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => {
            const isFilled = i < digits.length;
            return (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#DC7009] scale-125 shadow-md shadow-[#DC7009]/30'
                    : 'bg-gray-200 border border-gray-300'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="text-xs font-bold text-[#FF3B30] mb-4 animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* 10-Key Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-[#FEF8F3] hover:bg-[#FEF2E0] active:scale-95 text-[#1A0E06] font-bold text-2xl flex items-center justify-center transition-all border border-[#DC7009]/15 shadow-sm"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#FEF8F3] hover:bg-[#FEF2E0] active:scale-95 text-[#1A0E06] font-bold text-2xl flex items-center justify-center transition-all border border-[#DC7009]/15 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-[#5C4030] flex items-center justify-center transition-all"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
