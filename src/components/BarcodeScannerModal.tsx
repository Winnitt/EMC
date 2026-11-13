import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Flashlight, Camera, Upload, AlertCircle, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MED_DB } from '../data/medDb';
import { Medication } from '../types';
import { evaluateDrugInteractions, InteractionWarning } from '../services/interactionChecker';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (code: string, medInfo?: { name: string; generic: string; cat: string }) => void;
  existingMeds?: Medication[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onDetected,
  existingMeds = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [detectedCode, setDetectedCode] = useState<string>('');
  const [matchedMed, setMatchedMed] = useState<{ name: string; generic: string; cat: string } | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [scanWarnings, setScanWarnings] = useState<InteractionWarning[]>([]);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader | null = null;

    if (isOpen) {
      setError('');
      setDetectedCode('');
      setMatchedMed(null);

      codeReader = new BrowserMultiFormatReader();
      codeReader
        .decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
          if (result) {
            const text = result.getText();
            handleBarcodeSuccess(text);
          }
          if (err && err.name !== 'NotFoundException') {
            // benign frame miss
          }
        })
        .then((controls) => {
          controlsRef.current = controls;
        })
        .catch((err) => {
          console.warn('Camera access error:', err);
          setError('Camera unavailable. You can upload an image or enter the barcode manually.');
        });
    }

    return () => {
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBarcodeSuccess = (code: string) => {
    setDetectedCode(code);
    // Find matching medication in MED_DB or fallback
    let match = null;
    for (const med of MED_DB) {
      const bMatch = med.brands.find(b => b.toLowerCase().includes(code.toLowerCase()));
      if (bMatch || med.g.toLowerCase().includes(code.toLowerCase())) {
        match = { name: bMatch || med.g, generic: med.g, cat: med.cat };
        break;
      }
    }
    setMatchedMed(match);

    // Evaluate drug interactions against current active medications
    if (existingMeds && existingMeds.length > 0) {
      const candidateName = match ? `${match.name} ${match.generic}` : code;
      const warnings = evaluateDrugInteractions(existingMeds, candidateName);
      setScanWarnings(warnings);
    } else {
      setScanWarnings([]);
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    handleBarcodeSuccess(manualCode.trim());
  };

  const handleConfirm = () => {
    if (detectedCode) {
      onDetected(detectedCode, matchedMed || undefined);
      onClose();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new BrowserMultiFormatReader();
      const imgUrl = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(imgUrl);
      if (result) {
        handleBarcodeSuccess(result.getText());
      }
    } catch (err) {
      setError('Could not detect barcode from image. Try another photo.');
    }
  };

  const toggleTorch = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      const track = stream?.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      }
    } catch {
      // Torch not supported on this device/browser
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-[#1A0E06] rounded-3xl overflow-hidden shadow-2xl border border-[#DC7009]/30 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10 text-white">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-[#DC7009]" />
            <span className="font-bold text-sm">Medicine Barcode Scanner</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-full ${torchOn ? 'bg-[#DC7009] text-white' : 'bg-white/10 text-gray-300'}`}
              title="Toggle Flashlight"
            >
              <Flashlight size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-gray-300 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video Viewport with Target Overlay */}
        <div className="relative w-full h-64 bg-black overflow-hidden flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

          {/* Scanner Overlay UI */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-56 h-36 border-2 border-[#DC7009]/60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#DC7009] rounded-tl" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#DC7009] rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#DC7009] rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#DC7009] rounded-br" />

              {/* Animated laser line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#FF3B30] to-transparent shadow-[0_0_8px_#FF3B30] scan-laser" />
            </div>
          </div>

          <div className="absolute bottom-2 text-[11px] text-white/70 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            Center barcode / QR in frame
          </div>
        </div>

        {/* Result & Fallbacks */}
        <div className="p-5 text-white space-y-4">
          {detectedCode ? (
            <div className="p-3.5 bg-[#DC7009]/20 border border-[#DC7009] rounded-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-[#34C759] text-xs font-bold mb-1">
                <CheckCircle2 size={16} /> Barcode Detected!
              </div>
              <div className="text-base font-mono font-bold text-white break-all">{detectedCode}</div>
              {matchedMed && (
                <div className="text-xs text-[#F8C07C] mt-1 font-medium">
                  💊 {matchedMed.name} ({matchedMed.generic}) • {matchedMed.cat}
                </div>
              )}

              {/* Instant Drug Interaction Alert */}
              {scanWarnings.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-red-900/60 border border-red-500/80 text-white space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-200 uppercase">
                    <ShieldAlert size={14} className="text-red-400 shrink-0" />
                    <span>⚠️ Safety Conflict: {scanWarnings[0].severity}</span>
                  </div>
                  <div className="text-[11px] text-red-100 font-semibold leading-relaxed">
                    Conflicts with <strong>{scanWarnings[0].conflictingWith}</strong>: {scanWarnings[0].risk}
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirm}
                className={`w-full mt-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-95 transition-all ${
                  scanWarnings.length > 0
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-[#A84B06] to-[#DC7009]'
                }`}
              >
                {scanWarnings.length > 0 ? 'Accept with Warning & Use Barcode' : 'Use This Barcode'}
              </button>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Manual Input or Image Upload */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div className="text-xs font-bold text-white/70">Or Enter Barcode Manually:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. 8901030843752"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#DC7009]"
              />
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold text-white"
              >
                Find
              </button>
            </div>

            <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 cursor-pointer transition-colors">
              <Upload size={14} /> Scan from Photo in Gallery
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
