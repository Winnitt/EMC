import React, { useState, useMemo } from 'react';
import {
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  User,
  Search,
  Copy,
  Check,
  ExternalLink,
  Filter,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { MedicalReport, BloodTestResult } from '../types';

interface OutOfRangeItem {
  reportId: string;
  reportTitle: string;
  reportDate: string;
  doctorOrLab?: string;
  groupName: string;
  result: BloodTestResult;
  deviation: string;
  clinicalNote?: string;
}

interface OutOfRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: MedicalReport[];
  initialReportId?: string | null;
  onOpenReportViewer: (report: MedicalReport) => void;
}

// Clinical interpretation guidelines for common lab parameters
const CLINICAL_INSIGHTS: Record<string, { high?: string; low?: string }> = {
  'Fasting Blood Sugar (FBS)': {
    high: 'Elevated fasting glucose indicates pre-diabetes (100–125 mg/dL) or diabetes (≥126 mg/dL). Discuss dietary modifications & medication review with doctor.',
    low: 'Low fasting glucose (<70 mg/dL) may indicate hypoglycemia. Carry fast-acting carbs if symptomatic.'
  },
  'Post-Prandial Blood Sugar (PPBS)': {
    high: 'Post-meal hyperglycemia (>140 mg/dL). Indicates reduced insulin response or high carbohydrate load.',
    low: 'Post-prandial hypoglycemia. Monitor for dizziness or shakiness.'
  },
  'Random Blood Sugar (RBS)': {
    high: 'Elevated random blood glucose. Value above 200 mg/dL with symptoms suggests diabetes.',
    low: 'Hypoglycemia alert. Ensure timely meals and review anti-diabetic dosing.'
  },
  'HbA1c (Glycated Hemoglobin)': {
    high: 'Reflects 3-month average glucose control. >5.7% indicates pre-diabetes; ≥6.5% indicates diabetes.',
    low: 'Rare; may occur in certain anemias or shortened red cell lifespan.'
  },
  'Total Cholesterol': {
    high: 'Hypercholesterolemia. Elevated cardiovascular risk; lifestyle and lipid management advised.',
    low: 'Very low levels may occur in malabsorption or severe hepatic impairment.'
  },
  'Triglycerides': {
    high: 'Elevated triglycerides (>150 mg/dL). Linked with metabolic syndrome and pancreatitis risk if >500.',
    low: 'Usually benign; seen in low-fat diets or hyperthyroidism.'
  },
  'LDL Cholesterol (Bad)': {
    high: 'High atherogenic LDL (>100 mg/dL). Primary target for cardiovascular risk reduction.',
    low: 'Low LDL is generally protective against plaque buildup.'
  },
  'HDL Cholesterol (Good)': {
    high: 'High HDL (>60 mg/dL) is cardioprotective.',
    low: 'Low HDL (<40 mg/dL) increases cardiovascular risk. Exercise and healthy fats help raise it.'
  },
  'Serum Creatinine': {
    high: 'Elevated serum creatinine signals reduced kidney glomerular filtration. Ensure hydration and clinical review.',
    low: 'Low creatinine is common with low muscle mass or pregnancy.'
  },
  'Blood Urea Nitrogen (BUN)': {
    high: 'High BUN indicates impaired renal clearance, dehydration, or high protein intake.',
    low: 'Seen in low protein diet, overhydration, or liver disease.'
  },
  'Serum Uric Acid': {
    high: 'Hyperuricemia (>7.2 mg/dL). Risk factor for gout and kidney stones. Limit purine-rich foods.',
    low: 'Usually asymptomatic; associated with certain rare tubular defects.'
  },
  'SGPT (ALT)': {
    high: 'Elevated alanine aminotransferase indicates hepatic cellular injury or fatty liver disease.',
    low: 'Generally normal and expected baseline.'
  },
  'SGOT (AST)': {
    high: 'Elevated aspartate aminotransferase points to liver or cardiac/skeletal muscle stress.',
    low: 'Generally normal baseline.'
  },
  'Alkaline Phosphatase (ALP)': {
    high: 'Elevated ALP can indicate biliary obstruction, cholestasis, or high bone turnover.',
    low: 'Seen in zinc deficiency or hypothyroidism.'
  },
  'Total Bilirubin': {
    high: 'Elevated bilirubin (>1.2 mg/dL) causes clinical jaundice. Suggests hemolysis or biliary stasis.',
    low: 'Normal baseline.'
  },
  'TSH (Thyroid Stimulating)': {
    high: 'Elevated TSH (>4.2 μIU/mL) suggests primary hypothyroidism (underactive thyroid gland).',
    low: 'Suppressed TSH (<0.4 μIU/mL) indicates hyperthyroidism (overactive thyroid gland).'
  },
  'Hemoglobin (Hb)': {
    high: 'Polycythemia. May indicate chronic hypoxia, dehydration, or smoking.',
    low: 'Anemia. Decreased oxygen carrying capacity. Check iron, B12, or blood loss.'
  },
  'WBC Count (TLC)': {
    high: 'Leukocytosis (>11,000). Common in bacterial infection, acute inflammation, or physical stress.',
    low: 'Leukopenia (<4,000). Increases susceptibility to infections. Requires physician evaluation.'
  },
  'Platelet Count': {
    high: 'Thrombocytosis (>4.5 lakh). Reactive or myeloproliferative origin.',
    low: 'Thrombocytopenia (<1.5 lakh). Potential bleeding risk. Monitor for bruising or petechiae.'
  },
  'ESR (Westergren)': {
    high: 'Elevated inflammatory marker. Indicates acute or chronic systemic inflammation.',
    low: 'Normal physiological baseline.'
  },
  'Vitamin D3 (25-OH)': {
    high: 'Rare vitamin D toxicity. Reduce high-dose supplementation.',
    low: 'Deficiency (<30 ng/mL). Common; affects bone density and immune health. Supplementation indicated.'
  },
  'Vitamin B12': {
    high: 'Often seen with recent high-dose B12 supplements.',
    low: 'B12 deficiency (<200 pg/mL). Causes megaloblastic anemia and peripheral neuropathy.'
  },
  'hs-CRP (High-Sensitivity CRP)': {
    high: 'Elevated systemic vascular inflammation marker. Associated with heightened cardiovascular risk.',
    low: 'Optimal baseline (<1.0 mg/L).'
  },
  'Serum Potassium (K+)': {
    high: 'Hyperkalemia (>5.1 mEq/L). Cardiac arrhythmia risk; urgent medical evaluation required.',
    low: 'Hypokalemia (<3.5 mEq/L). Causes muscle weakness, cramps, and cardiac excitability.'
  },
  'Serum Sodium (Na+)': {
    high: 'Hypernatremia (>145 mEq/L). Indicates dehydration or impaired thirst mechanism.',
    low: 'Hyponatremia (<135 mEq/L). Common with diuretics or fluid overload. Can cause confusion/headache.'
  }
};

export const OutOfRangeModal: React.FC<OutOfRangeModalProps> = ({
  isOpen,
  onClose,
  reports,
  initialReportId,
  onOpenReportViewer
}) => {
  const [filterType, setFilterType] = useState<'all' | 'high' | 'low'>('all');
  const [selectedReportFilter, setSelectedReportFilter] = useState<string>(initialReportId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Compile all out-of-range items
  const outOfRangeItems = useMemo(() => {
    const items: OutOfRangeItem[] = [];

    reports.forEach((report) => {
      if (!report.btData) return;

      report.btData.forEach((group) => {
        group.results.forEach((res) => {
          if (res.status === 'high' || res.status === 'low') {
            const numVal = parseFloat(res.val);
            let dev = '';

            if (res.status === 'high' && res.mx > 0 && !isNaN(numVal)) {
              const diff = (numVal - res.mx).toFixed(1);
              dev = `+${diff} ${res.u} above max (${res.mx})`;
            } else if (res.status === 'low' && res.mn > 0 && !isNaN(numVal)) {
              const diff = (res.mn - numVal).toFixed(1);
              dev = `-${diff} ${res.u} below min (${res.mn})`;
            }

            const matchedInsight = CLINICAL_INSIGHTS[res.n];
            const note = res.status === 'high' ? matchedInsight?.high : matchedInsight?.low;

            items.push({
              reportId: report.id,
              reportTitle: report.title,
              reportDate: report.date,
              doctorOrLab: report.doctor,
              groupName: group.g,
              result: res,
              deviation: dev,
              clinicalNote: note
            });
          }
        });
      });
    });

    return items;
  }, [reports]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return outOfRangeItems.filter((item) => {
      // Status filter
      if (filterType === 'high' && item.result.status !== 'high') return false;
      if (filterType === 'low' && item.result.status !== 'low') return false;

      // Report filter
      if (selectedReportFilter !== 'all' && item.reportId !== selectedReportFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.result.n.toLowerCase().includes(q);
        const matchGroup = item.groupName.toLowerCase().includes(q);
        const matchReport = item.reportTitle.toLowerCase().includes(q);
        return matchName || matchGroup || matchReport;
      }

      return true;
    });
  }, [outOfRangeItems, filterType, selectedReportFilter, searchQuery]);

  const highCount = outOfRangeItems.filter((i) => i.result.status === 'high').length;
  const lowCount = outOfRangeItems.filter((i) => i.result.status === 'low').length;

  const handleCopySummary = () => {
    if (outOfRangeItems.length === 0) return;

    const summaryLines = [
      '⚠️ OUT OF RANGE LABORATORY PARAMETERS SUMMARY',
      `Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`,
      `Total Abnormal Findings: ${outOfRangeItems.length} (${highCount} High, ${lowCount} Low)`,
      '----------------------------------------'
    ];

    outOfRangeItems.forEach((item, idx) => {
      summaryLines.push(
        `${idx + 1}. ${item.result.n} [${item.result.status.toUpperCase()}]` +
        `\n   • Measured Value: ${item.result.val} ${item.result.u} (Normal: ${item.result.refRange || `${item.result.mn} - ${item.result.mx} ${item.result.u}`})` +
        `\n   • Report: ${item.reportTitle} (${item.reportDate}) ${item.doctorOrLab ? `• ${item.doctorOrLab}` : ''}` +
        (item.clinicalNote ? `\n   • Note: ${item.clinicalNote}` : '')
      );
    });

    summaryLines.push('\n— Extracted via EMC');

    navigator.clipboard.writeText(summaryLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleViewReport = (reportId: string) => {
    const target = reports.find((r) => r.id === reportId);
    if (target) {
      onOpenReportViewer(target);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-red-500/20">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-600 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                  Out of Range Parameters
                </h2>
                <span className="bg-white/30 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                  {outOfRangeItems.length} Abnormal
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Lab metrics deviating from ICMR & standard clinical reference ranges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1.5 text-xs font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterType === 'all'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                All ({outOfRangeItems.length})
              </button>
              <button
                onClick={() => setFilterType('high')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  filterType === 'high'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white border border-red-200 text-red-700 hover:bg-red-50'
                }`}
              >
                <TrendingUp size={13} /> High ({highCount})
              </button>
              <button
                onClick={() => setFilterType('low')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  filterType === 'low'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'bg-white border border-cyan-200 text-cyan-800 hover:bg-cyan-50'
                }`}
              >
                <TrendingDown size={13} /> Low ({lowCount})
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Copy formatted summary to clipboard"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Clinical Summary</span>
                </>
              )}
            </button>
          </div>

          {/* Search + Report Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parameter (e.g. Sugar, HbA1c, ALT)..."
                className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="relative">
              <select
                value={selectedReportFilter}
                onChange={(e) => setSelectedReportFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="all">All Medical Reports ({reports.length})</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.date})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Body List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 text-sm no-scrollbar bg-[#FCFAF8]">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isHigh = item.result.status === 'high';
              const numVal = parseFloat(item.result.val);
              const refMin = item.result.mn;
              const refMax = item.result.mx;

              return (
                <div
                  key={`${item.reportId}-${item.result.n}-${idx}`}
                  className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-red-300 transition-all space-y-3"
                >
                  {/* Top line: Parameter Name & Status Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <Activity size={12} className="text-gray-400" />
                        <span>{item.groupName}</span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-900 mt-0.5">
                        {item.result.n}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isHigh ? (
                        <span className="px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 text-red-700 font-extrabold text-xs flex items-center gap-1 shadow-sm">
                          <TrendingUp size={14} className="stroke-[2.5]" /> HIGH
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 font-extrabold text-xs flex items-center gap-1 shadow-sm">
                          <TrendingDown size={14} className="stroke-[2.5]" /> LOW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metric Box: Value vs Normal Range */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase">
                        Measured Patient Value
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-xl sm:text-2xl font-black ${
                            isHigh ? 'text-red-600' : 'text-cyan-800'
                          }`}
                        >
                          {item.result.val}
                        </span>
                        <span className="text-xs font-bold text-gray-600">
                          {item.result.u}
                        </span>
                      </div>
                      {item.deviation && (
                        <div className="text-[11px] font-bold text-red-600 mt-0.5">
                          {item.deviation}
                        </div>
                      )}
                    </div>

                    <div className="sm:border-l sm:border-gray-200 sm:pl-3">
                      <div className="text-[10px] font-bold text-gray-500 uppercase">
                        Normal Reference Range
                      </div>
                      <div className="text-xs font-extrabold text-emerald-800 mt-0.5">
                        {item.result.refRange || `${refMin} - ${refMax} ${item.result.u}`}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Standard ICMR / Clinical laboratory threshold
                      </div>
                    </div>
                  </div>

                  {/* Clinical interpretation insight */}
                  {item.clinicalNote && (
                    <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <span className="text-sm shrink-0">💡</span>
                      <div className="leading-relaxed font-medium">
                        <strong>Clinical Note:</strong> {item.clinicalNote}
                      </div>
                    </div>
                  )}

                  {/* Report attribution & View Report Button */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-gray-700 truncate">
                        {item.reportTitle}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar size={11} /> {item.reportDate}
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewReport(item.reportId)}
                      className="px-2.5 py-1 rounded-lg bg-[#0D5C3D] hover:bg-[#1A8A5A] text-white font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 shrink-0 ml-2"
                    >
                      <FileText size={12} /> View Report
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Check size={24} />
              </div>
              <h3 className="font-extrabold text-base text-gray-900">
                No Out of Range Parameters Found
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchQuery || selectedReportFilter !== 'all' || filterType !== 'all'
                  ? 'No parameters matched your active filters. Try adjusting the search query or report filter.'
                  : 'All recorded blood tests and diagnostic parameters are currently within normal baseline reference ranges.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center gap-3">
          <div className="text-xs text-gray-500 font-medium hidden sm:block">
            Showing <strong>{filteredItems.length}</strong> of {outOfRangeItems.length} abnormal metrics
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#1A0E06] text-white font-bold text-xs hover:bg-gray-800 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
