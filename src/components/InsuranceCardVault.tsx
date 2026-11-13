import React, { useState } from 'react';
import { ShieldCheck, Phone, Camera, Upload, Edit3, Check, X, CreditCard, ExternalLink } from 'lucide-react';
import { InsuranceRecord } from '../types';

interface InsuranceCardVaultProps {
  insurance?: InsuranceRecord;
  onSaveInsurance: (record: InsuranceRecord) => void;
  isSeniorMode?: boolean;
}

export const InsuranceCardVault: React.FC<InsuranceCardVaultProps> = ({
  insurance,
  onSaveInsurance,
  isSeniorMode = false
}) => {
  const [isEditing, setIsEditing] = useState(!insurance);
  const [provider, setProvider] = useState(insurance?.provider || 'Star Health / HDFC ERGO');
  const [policyNumber, setPolicyNumber] = useState(insurance?.policyNumber || '');
  const [memberId, setMemberId] = useState(insurance?.memberId || '');
  const [tpaName, setTpaName] = useState(insurance?.tpaName || 'Medi Assist TPA');
  const [helpline, setHelpline] = useState(insurance?.helpline || '1800-425-2255');
  const [validTill, setValidTill] = useState(insurance?.validTill || '');
  const [cardFront, setCardFront] = useState<string | undefined>(insurance?.cardImageFront);
  const [cardBack, setCardBack] = useState<string | undefined>(insurance?.cardImageBack);

  const handleImageUpload = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') setCardFront(reader.result as string);
        if (side === 'back') setCardBack(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInsurance({
      id: insurance?.id || `ins-${Date.now()}`,
      profileId: 'active',
      provider: provider.trim(),
      policyNumber: policyNumber.trim(),
      memberId: memberId.trim(),
      tpaName: tpaName.trim() || undefined,
      helpline: helpline.trim() || undefined,
      validTill: validTill.trim() || undefined,
      cardImageFront: cardFront,
      cardImageBack: cardBack
    });
    setIsEditing(false);
  };

  const handleCallTPA = () => {
    if (insurance?.helpline) {
      window.location.href = `tel:${insurance.helpline}`;
    }
  };

  return (
    <div id="insurance-vault-card" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-black text-[#1A0E06] flex items-center gap-1.5 ${isSeniorMode ? 'text-xl' : 'text-base'}`}>
            <ShieldCheck className="text-[#DC7009]" size={20} />
            <span>Health Insurance & TPA Vault</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Cashless Hospital Admission Desk Details</p>
        </div>

        {insurance && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {!isEditing && insurance ? (
        <div className="bg-gradient-to-br from-[#1A0E06] to-[#3B1F0E] rounded-3xl p-5 text-white shadow-xl border border-orange-900/40 relative overflow-hidden">
          {/* Decorative watermark */}
          <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none">
            <CreditCard size={140} />
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  HEALTH INSURANCE POLICY
                </span>
                <h3 className="text-xl font-black text-white">{insurance.provider}</h3>
              </div>
              {insurance.validTill && (
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold">
                  Valid: {insurance.validTill}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/10">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">POLICY NO.</span>
                <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                  {insurance.policyNumber || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">MEMBER ID</span>
                <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                  {insurance.memberId || '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">TPA DESK</span>
                <span className="font-bold text-orange-300">{insurance.tpaName || 'In-House'}</span>
              </div>

              {insurance.helpline && (
                <button
                  type="button"
                  onClick={handleCallTPA}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#DC7009] to-[#A84B06] hover:from-[#EB8524] text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
                >
                  <Phone size={14} />
                  <span>Call TPA: {insurance.helpline}</span>
                </button>
              )}
            </div>

            {/* Photos Preview */}
            {(insurance.cardImageFront || insurance.cardImageBack) && (
              <div className="flex gap-2 pt-2">
                {insurance.cardImageFront && (
                  <div className="flex-1 rounded-xl overflow-hidden border border-white/20 bg-black/40 h-24 flex items-center justify-center">
                    <img
                      src={insurance.cardImageFront}
                      alt="Insurance Card Front"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                {insurance.cardImageBack && (
                  <div className="flex-1 rounded-xl overflow-hidden border border-white/20 bg-black/40 h-24 flex items-center justify-center">
                    <img
                      src={insurance.cardImageBack}
                      alt="Insurance Card Back"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Insurance Provider</label>
              <input
                type="text"
                value={provider}
                onChange={e => setProvider(e.target.value)}
                placeholder="e.g. Star Health / ICICI Lombard"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">TPA Desk Name</label>
              <input
                type="text"
                value={tpaName}
                onChange={e => setTpaName(e.target.value)}
                placeholder="e.g. Medi Assist / Vidal Health"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Policy Number</label>
              <input
                type="text"
                value={policyNumber}
                onChange={e => setPolicyNumber(e.target.value)}
                placeholder="POL-10829384"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Insured Member ID</label>
              <input
                type="text"
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                placeholder="MED-774920"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">TPA Cashless Helpline</label>
              <input
                type="tel"
                value={helpline}
                onChange={e => setHelpline(e.target.value)}
                placeholder="1800-xxx-xxxx"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Valid Till</label>
              <input
                type="date"
                value={validTill}
                onChange={e => setValidTill(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>
          </div>

          {/* Photo Capture Section */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#DC7009] rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 bg-gray-50 hover:bg-orange-50/50 transition-colors">
              <Camera size={18} className="text-gray-400" />
              <span className="text-[11px] font-bold text-gray-700">
                {cardFront ? 'Card Front Attached' : 'Attach Card Front'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload('front', e)}
                className="hidden"
              />
            </label>

            <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#DC7009] rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 bg-gray-50 hover:bg-orange-50/50 transition-colors">
              <Camera size={18} className="text-gray-400" />
              <span className="text-[11px] font-bold text-gray-700">
                {cardBack ? 'Card Back Attached' : 'Attach Card Back'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload('back', e)}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            {insurance && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 font-bold text-xs text-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#DC7009] hover:bg-[#A84B06] font-black text-xs text-white shadow-md flex items-center justify-center gap-1"
            >
              <Check size={16} />
              <span>Save Insurance Card</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
