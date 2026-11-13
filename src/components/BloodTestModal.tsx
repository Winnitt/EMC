import React, { useState } from 'react';
import { X, Plus, Activity, Check } from 'lucide-react';
import { BT_GROUPS } from '../data/bloodTestDb';
import { BloodTestGroupData, MedicalReport } from '../types';
import { genId } from '../utils/storage';

interface BloodTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: MedicalReport) => void;
}

export const BloodTestModal: React.FC<BloodTestModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [reportTitle, setReportTitle] = useState('Comprehensive Blood Panel');
  const [labName, setLabName] = useState('Apollo Diagnostics / Metropolis');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleValueChange = (testName: string, val: string) => {
    setTestValues(prev => ({ ...prev, [testName]: val }));
  };

  const handleSave = () => {
    // Collect all entered values grouped by category
    const btData: BloodTestGroupData[] = [];

    BT_GROUPS.forEach(grp => {
      const results: BloodTestGroupData['results'] = [];
      grp.tests.forEach(test => {
        const val = testValues[test.n]?.trim();
        if (val && !isNaN(parseFloat(val))) {
          const num = parseFloat(val);
          let status: 'normal' | 'low' | 'high' = 'normal';
          if (test.mx > 0 && num > test.mx) status = 'high';
          else if (test.mn > 0 && num < test.mn) status = 'low';

          results.push({
            n: test.n,
            u: test.u,
            mn: test.mn,
            mx: test.mx,
            val: val,
            status,
            refRange: `${test.mn} - ${test.mx} ${test.u}`
          });
        }
      });

      if (results.length > 0) {
        btData.push({
          g: grp.g,
          results
        });
      }
    });

    if (btData.length === 0) {
      alert('Please enter at least one test parameter value.');
      return;
    }

    const report: MedicalReport = {
      id: genId('REP'),
      title: reportTitle.trim() || 'Blood Test Report',
      cat: 'blood',
      date: testDate,
      doctor: labName.trim() || 'Laboratory',
      notes: notes.trim() || 'Manual clinical entry',
      btData
    };

    onSave(report);
    onClose();
  };

  const currentGroupDef = BT_GROUPS[selectedGroup];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-500/20">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#0D5C3D] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                Enter Blood Test & Lab Metrics
              </h2>
              <span className="text-xs text-emerald-200">
                11 Standard Categories • ICMR Reference Ranges
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Basic Report Metadata */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-emerald-900 uppercase mb-1">Report Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 focus:outline-none focus:border-emerald-600 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-emerald-900 uppercase mb-1">Lab / Diagnostic Center</label>
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block font-bold text-emerald-900 uppercase mb-1">Test Date</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-200 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Category Tabs & Test Values Grid */}
        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
          {/* Left Category Sidebar */}
          <div className="sm:w-52 bg-[#FEF8F3] border-r border-gray-100 overflow-x-auto sm:overflow-y-auto p-2 flex sm:flex-col gap-1.5 shrink-0 no-scrollbar">
            {BT_GROUPS.map((grp, idx) => {
              const hasValues = grp.tests.some(t => !!testValues[t.n]);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedGroup(idx)}
                  className={`text-left px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap sm:whitespace-normal transition-all flex items-center justify-between gap-1.5 ${
                    selectedGroup === idx
                      ? 'bg-[#0D5C3D] text-white shadow-sm font-bold'
                      : 'hover:bg-orange-100/50 text-[#5C4030]'
                  }`}
                >
                  <span className="truncate">{grp.g}</span>
                  {hasValues && (
                    <span className={`w-2 h-2 rounded-full ${selectedGroup === idx ? 'bg-white' : 'bg-emerald-600'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Parameters Input List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#0D5C3D] flex items-center gap-1.5">
                {currentGroupDef.g}
              </h3>
              <span className="text-[11px] text-gray-500 font-medium">
                {currentGroupDef.tests.length} parameters
              </span>
            </div>

            <div className="space-y-3">
              {currentGroupDef.tests.map((t, idx) => {
                const currentVal = testValues[t.n] || '';
                const num = parseFloat(currentVal);
                const hasNum = !isNaN(num);
                let statusBadge = null;

                if (hasNum) {
                  if (t.mx > 0 && num > t.mx) {
                    statusBadge = (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-700">
                        HIGH
                      </span>
                    );
                  } else if (t.mn > 0 && num < t.mn) {
                    statusBadge = (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                        LOW
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        NORMAL
                      </span>
                    );
                  }
                }

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div>
                      <div className="font-bold text-xs text-gray-900">{t.n}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Normal: <span className="font-medium text-gray-700">{t.mn} - {t.mx} {t.u}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge}
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 focus-within:border-emerald-500">
                        <input
                          type="number"
                          step="any"
                          value={currentVal}
                          onChange={(e) => handleValueChange(t.n, e.target.value)}
                          placeholder="Value"
                          className="w-20 bg-transparent text-xs font-bold text-right focus:outline-none"
                        />
                        <span className="text-[11px] text-gray-500 font-medium">{t.u}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white border border-gray-200 text-[#5C4030] font-bold hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#0D5C3D] to-[#1A8A5A] text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-emerald-700/20 text-sm flex items-center justify-center gap-1.5"
          >
            <Check size={16} /> Save Blood Test
          </button>
        </div>
      </div>
    </div>
  );
};
