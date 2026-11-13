import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, FileText, Pill } from 'lucide-react';
import { ParsedOcrData, MedicalReport, Medication } from '../types';
import { getReports, saveReports, getMedications, saveMedications, genId } from '../utils/storage';

interface AiOcrConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ParsedOcrData;
  reportImage?: string;
  onImportComplete: (createdReport?: MedicalReport) => void;
}

export const AiOcrConfirmModal: React.FC<AiOcrConfirmModalProps> = ({
  isOpen,
  onClose,
  data,
  reportImage,
  onImportComplete
}) => {
  // Selection states for blood test parameters & meds
  const [selectedTests, setSelectedTests] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    data.bloodTests.forEach(g => {
      g.tests.forEach(t => {
        init[t.n] = true;
      });
    });
    return init;
  });

  const [selectedMeds, setSelectedMeds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    data.medications.forEach(m => {
      if (m.name) init[m.name] = true;
    });
    return init;
  });

  const [reportTitle, setReportTitle] = useState(
    data.bloodTests.length > 0
      ? `Complete Diagnostic Report — ${data.date || new Date().toISOString().split('T')[0]}`
      : `Scanned Medical Document — ${data.date || new Date().toISOString().split('T')[0]}`
  );
  const [doctorOrLab, setDoctorOrLab] = useState(data.doctorOrLab || 'Diagnostic Laboratory');
  const [reportDate, setReportDate] = useState(data.date || new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const toggleTest = (name: string) => {
    setSelectedTests(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleMed = (name: string) => {
    setSelectedMeds(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSelectAllTests = (select: boolean) => {
    const updated: Record<string, boolean> = {};
    data.bloodTests.forEach(g => {
      g.tests.forEach(t => {
        updated[t.n] = select;
      });
    });
    setSelectedTests(updated);
  };

  const handleImport = () => {
    // 1. Build single structured blood test report
    const filteredGroups = data.bloodTests
      .map(g => ({
        g: g.groupName,
        results: g.tests.filter(t => selectedTests[t.n])
      }))
      .filter(g => g.results.length > 0);

    const hasTestsOrFile = filteredGroups.length > 0 || reportImage;
    let createdReport: MedicalReport | undefined = undefined;

    if (hasTestsOrFile) {
      const totalParamCount = filteredGroups.reduce((acc, g) => acc + g.results.length, 0);
      const abnormalCount = filteredGroups.flatMap(g => g.results).filter(r => r.status === 'high' || r.status === 'low').length;

      createdReport = {
        id: genId('REP'),
        title: reportTitle.trim() || `Complete Lab Report — ${reportDate}`,
        cat: filteredGroups.length > 0 ? 'blood' : 'prescription',
        date: reportDate,
        doctor: doctorOrLab.trim() || undefined,
        notes: `Extracted via EMC OCR. Total parameters: ${totalParamCount} (${abnormalCount} out of range). Scanned document compiled into a single complete report.`,
        file: reportImage,
        fileType: 'image/jpeg',
        btData: filteredGroups
      };

      const existingReports = getReports();
      saveReports([createdReport, ...existingReports]);
    }

    // 2. Import selected medications
    const medsToAdd: Medication[] = data.medications
      .filter(m => m.name && selectedMeds[m.name])
      .map(m => ({
        id: genId('MED'),
        name: m.name!,
        genericName: m.genericName || m.name,
        dose: m.dose || '1 tablet',
        freq: m.freq || 'OD',
        tod: m.tod || 'morning',
        time: m.time || '08:00',
        cond: m.cond || 'From prescription scan',
        notes: `Imported on ${new Date().toLocaleDateString()}`
      }));

    if (medsToAdd.length > 0) {
      const existingMeds = getMedications();
      saveMedications([...medsToAdd, ...existingMeds]);
    }

    onImportComplete(createdReport);
    onClose();
  };

  const totalTestCount = data.bloodTests.reduce((acc, g) => acc + g.tests.length, 0);
  const selectedTestCount = Object.values(selectedTests).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#DC7009]/20">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FEF8F3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FEF2E0] text-[#DC7009] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-bold text-[#1A0E06] text-base leading-tight">
                OCR Extracted Medical Data
              </h2>
              <span className="text-xs text-[#5C4030]">
                {totalTestCount} test parameters • {data.medications.length} medicines found
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable review body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm no-scrollbar">
          {/* Metadata overrides */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-[11px] font-bold text-[#5C4030] uppercase mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#DC7009]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5C4030] uppercase mb-1">
                Doctor / Lab Name
              </label>
              <input
                type="text"
                value={doctorOrLab}
                onChange={(e) => setDoctorOrLab(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#DC7009]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#5C4030] uppercase mb-1">
                Report Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#DC7009]"
              />
            </div>
          </div>

          {/* Blood Tests Detected */}
          {data.bloodTests.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-[#0D5C3D] flex items-center gap-1.5">
                  <FileText size={15} /> Extracted Parameters ({totalTestCount})
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectAllTests(true)}
                    className="text-[#0D5C3D] hover:underline font-bold"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAllTests(false)}
                    className="text-gray-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {data.bloodTests.map((group, gIdx) => (
                <div key={gIdx} className="border border-emerald-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-emerald-50/80 px-3.5 py-2 font-bold text-xs text-emerald-900 border-b border-emerald-100 flex justify-between items-center">
                    <span>{group.groupName}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{group.tests.length} tests</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {group.tests.map((test, tIdx) => {
                      const isChecked = selectedTests[test.n] || false;
                      const isAbnormal = test.status === 'high' || test.status === 'low';
                      return (
                        <label
                          key={tIdx}
                          className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTest(test.n)}
                              className="rounded text-[#DC7009] focus:ring-[#DC7009] w-4 h-4"
                            />
                            <div>
                              <div className="font-semibold text-gray-900">{test.n}</div>
                              <div className="text-[11px] text-gray-500">Ref: {test.refRange} {test.u}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm text-gray-900 mr-1.5">{test.val}</span>
                            <span className="text-[11px] text-gray-500">{test.u}</span>
                            {isAbnormal && (
                              <span
                                className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  test.status === 'high' ? 'bg-red-100 text-red-700' : 'bg-cyan-100 text-cyan-800'
                                }`}
                              >
                                {test.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Medications Detected */}
          {data.medications.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-[#A84B06] flex items-center gap-1.5">
                  <Pill size={15} /> Prescribed Medicines ({data.medications.length})
                </span>
                <span className="text-[11px] text-gray-500">Add to daily meds tracker</span>
              </div>

              <div className="border border-orange-200 rounded-2xl overflow-hidden bg-white divide-y divide-gray-100">
                {data.medications.map((med, mIdx) => {
                  const isChecked = selectedMeds[med.name!] || false;
                  return (
                    <label
                      key={mIdx}
                      className="flex items-center justify-between px-3.5 py-2.5 hover:bg-orange-50/50 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMed(med.name!)}
                          className="rounded text-[#DC7009] focus:ring-[#DC7009] w-4 h-4"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{med.name}</div>
                          <div className="text-[11px] text-gray-500">
                            {med.dose} • {med.freq} ({med.tod})
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#DC7009] bg-[#FEF2E0] px-2 py-0.5 rounded-full">
                        {med.cond || 'Rx'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {data.bloodTests.length === 0 && data.medications.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <div className="text-3xl mb-2">📄</div>
              <div className="font-bold text-sm text-gray-700">General Medical Document</div>
              <div className="text-xs text-gray-500 mt-1">
                No specific blood test metrics or recognized medicines detected. This file will be saved as a regular lab record.
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-[#5C4030] font-bold hover:bg-gray-100 text-xs"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#0D5C3D] to-[#1A8A5A] text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-emerald-700/20 text-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} /> Generate Complete Report ({selectedTestCount} Parameters)
          </button>
        </div>
      </div>
    </div>
  );
};
