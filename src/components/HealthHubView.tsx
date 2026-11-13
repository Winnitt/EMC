import React, { useState } from 'react';
import { Activity, Syringe, ShieldCheck, Stethoscope } from 'lucide-react';
import { VitalRecord, VaccinationRecord, InsuranceRecord, Doctor } from '../types';
import { VitalSignsChart } from './VitalSignsChart';
import { VaccinationTracker } from './VaccinationTracker';
import { InsuranceCardVault } from './InsuranceCardVault';
import { DoctorsView } from './DoctorsView';
import { useI18n } from '../utils/i18n';

interface HealthHubViewProps {
  vitals: VitalRecord[];
  onSaveVitals: (records: VitalRecord[]) => void;
  vaccinations: VaccinationRecord[];
  onSaveVaccinations: (records: VaccinationRecord[]) => void;
  insurance?: InsuranceRecord;
  onSaveInsurance: (record: InsuranceRecord) => void;
  doctors: Doctor[];
  onSaveDoctors: (doctors: Doctor[]) => void;
  isSeniorMode?: boolean;
}

export const HealthHubView: React.FC<HealthHubViewProps> = ({
  vitals,
  onSaveVitals,
  vaccinations,
  onSaveVaccinations,
  insurance,
  onSaveInsurance,
  doctors,
  onSaveDoctors,
  isSeniorMode = false
}) => {
  const { t } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'vaccines' | 'insurance' | 'doctors'>('vitals');

  return (
    <div id="health-hub-container" className="space-y-4 animate-in fade-in">
      {/* Sub-Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#FEF8F3] rounded-2xl border border-[#DC7009]/20 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab('vitals')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeSubTab === 'vitals'
              ? 'bg-[#DC7009] text-white shadow-sm'
              : 'text-[#5C4030] hover:bg-orange-100/50'
          }`}
        >
          <Activity size={14} />
          <span>{t('hub_vitals')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('vaccines')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeSubTab === 'vaccines'
              ? 'bg-[#DC7009] text-white shadow-sm'
              : 'text-[#5C4030] hover:bg-orange-100/50'
          }`}
        >
          <Syringe size={14} />
          <span>{t('hub_vaccines')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('insurance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeSubTab === 'insurance'
              ? 'bg-[#DC7009] text-white shadow-sm'
              : 'text-[#5C4030] hover:bg-orange-100/50'
          }`}
        >
          <ShieldCheck size={14} />
          <span>{t('hub_insurance')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('doctors')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeSubTab === 'doctors'
              ? 'bg-[#DC7009] text-white shadow-sm'
              : 'text-[#5C4030] hover:bg-orange-100/50'
          }`}
        >
          <Stethoscope size={14} />
          <span>{t('hub_doctors')} ({doctors.length})</span>
        </button>
      </div>

      {/* Sub-View Content */}
      <div className="pt-1">
        {activeSubTab === 'vitals' && (
          <VitalSignsChart
            vitals={vitals}
            onSaveVitals={onSaveVitals}
            isSeniorMode={isSeniorMode}
          />
        )}

        {activeSubTab === 'vaccines' && (
          <VaccinationTracker
            vaccinations={vaccinations}
            onSaveVaccinations={onSaveVaccinations}
            isSeniorMode={isSeniorMode}
          />
        )}

        {activeSubTab === 'insurance' && (
          <InsuranceCardVault
            insurance={insurance}
            onSaveInsurance={onSaveInsurance}
            isSeniorMode={isSeniorMode}
          />
        )}

        {activeSubTab === 'doctors' && (
          <DoctorsView
            doctors={doctors}
            onSaveDoctors={onSaveDoctors}
            isSeniorMode={isSeniorMode}
          />
        )}
      </div>
    </div>
  );
};
