import React, { useState, useMemo } from 'react';
import {
  Activity,
  Sparkles,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Archive,
  Layers,
  Copy,
  Check,
  Eye,
  Trash2,
  Filter,
  User,
  Share2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { MedicalReport } from '../types';
import {
  aggregateBloodParameters,
  UnifiedParameter,
  ParameterHistoryEntry,
  UnifiedCategory
} from '../utils/bloodTestAggregator';
import { speakText, stopSpeaking } from '../utils/speech';
import { getSimpleTestName, getSimpleTestMeaning } from '../utils/seniorMode';
import { useI18n } from '../utils/i18n';

interface UnifiedBloodTestViewProps {
  reports: MedicalReport[];
  onOpenBloodTestModal: () => void;
  onOpenReportViewer: (report: MedicalReport) => void;
  onOpenOutOfRangeModal: (reportId?: string) => void;
  onScanNewReport: () => void;
  onDeleteReport: (reportId: string) => void;
  isSeniorMode?: boolean;
}

export const UnifiedBloodTestView: React.FC<UnifiedBloodTestViewProps> = ({
  reports,
  onOpenBloodTestModal,
  onOpenReportViewer,
  onOpenOutOfRangeModal,
  onScanNewReport,
  onDeleteReport,
  isSeniorMode = false
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'master' | 'archive' | 'trends'>('master');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'abnormal' | 'multi_scan'>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedParameterForHistory, setSelectedParameterForHistory] = useState<UnifiedParameter | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Aggregate master blood panel from all reports
  const { categories, allParameters, stats, archivedReports } = useMemo(() => {
    return aggregateBloodParameters(reports);
  }, [reports]);

  const toggleCategoryCollapse = (gName: string) => {
    setCollapsedCategories(prev => ({ ...prev, [gName]: !prev[gName] }));
  };

  // Filtered parameters based on search and abnormal toggle
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return categories
      .map(cat => {
        const filteredParams = cat.parameters.filter(p => {
          const plainTitle = getSimpleTestName(p.name).toLowerCase();
          const matchSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            plainTitle.includes(q) ||
            p.groupName.toLowerCase().includes(q) ||
            (p.latestDoctor && p.latestDoctor.toLowerCase().includes(q));

          if (!matchSearch) return false;

          if (filterMode === 'abnormal') {
            return p.latestStatus === 'high' || p.latestStatus === 'low';
          }
          if (filterMode === 'multi_scan') {
            return p.history.length > 1;
          }

          return true;
        });

        return {
          ...cat,
          parameters: filteredParams
        };
      })
      .filter(cat => cat.parameters.length > 0);
  }, [categories, searchQuery, filterMode]);

  // Parameters with multiple readings for the trends view
  const trendParameters = useMemo(() => {
    return allParameters.filter(p => p.history.length > 1 || p.latestStatus !== 'normal');
  }, [allParameters]);

  const handleCopySummary = () => {
    if (allParameters.length === 0) return;

    let text = `🏥 COMPLETE BLOOD & LAB TEST PROFILE\n`;
    text += `Last Updated: ${stats.latestScanDate || 'N/A'}\n`;
    text += `Total Parameters: ${stats.totalParametersTracked} (${stats.abnormalCount} Out of Range)\n`;
    text += `Archived Scans: ${stats.totalHistoricalScans} reports\n\n`;

    categories.forEach(cat => {
      text += `--- ${cat.groupName.toUpperCase()} ---\n`;
      cat.parameters.forEach(p => {
        const statusFlag = p.latestStatus === 'high' ? '[HIGH ⚠️]' : p.latestStatus === 'low' ? '[LOW ⚠️]' : '[NORMAL]';
        text += `• ${p.name}: ${p.latestValue} ${p.unit} ${statusFlag} (Ref: ${p.refRange}) — ${p.latestDate}\n`;
        if (p.history.length > 1 && p.previousValue) {
          text += `  └ Previous: ${p.previousValue} ${p.unit} (${p.previousDate})\n`;
        }
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleReadAloud = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    if (allParameters.length === 0) {
      speakText('No blood test parameters recorded yet.');
      return;
    }

    const abnormalParams = allParameters.filter(p => p.latestStatus === 'high' || p.latestStatus === 'low');
    let speechScript = `You have ${allParameters.length} blood test results recorded. ${stats.normalCount} tests are in normal healthy range. `;

    if (abnormalParams.length > 0) {
      speechScript += `${abnormalParams.length} tests are out of range: `;
      abnormalParams.forEach((p, idx) => {
        const simpleName = getSimpleTestName(p.name);
        const statusText = p.latestStatus === 'high' ? 'Higher than normal' : 'Lower than normal';
        speechScript += `Test ${idx + 1}: ${simpleName}, result is ${p.latestValue} ${p.unit}, which is ${statusText}. Normal is ${p.refRange}. `;
      });
    } else {
      speechScript += `All your test results are completely normal and healthy!`;
    }

    setSpeaking(true);
    speakText(speechScript, () => setSpeaking(false));
  };

  return (
    <div className="space-y-5">
      {/* Top Health Intelligence Hero */}
      <div className="gh-reps rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-black tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-md ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                {t('unified_blood_tests')}
              </span>
              {stats.latestScanDate && (
                <span className={`text-emerald-200 font-bold flex items-center gap-1 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                  <Clock size={12} /> {`${stats.latestScanDate}`}
                </span>
              )}
            </div>
            <h1 className={`font-black tracking-tight flex items-center gap-2 ${isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-2xl'}`}>
              <span>{t('unified_blood_tests')}</span>
            </h1>
            <p className={`text-white/85 mt-1 max-w-xl font-medium ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
              {t('reports_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isSeniorMode && (
              <button
                onClick={handleReadAloud}
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
              onClick={onScanNewReport}
              className={`rounded-2xl bg-white text-[#0D5C3D] font-black shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 ${
                isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-3.5 py-2.5 text-xs'
              }`}
            >
              <Sparkles size={isSeniorMode ? 18 : 14} /> {t('camera_scan_btn')}
            </button>
            <button
              onClick={onOpenBloodTestModal}
              className={`rounded-2xl bg-black/25 hover:bg-black/40 text-white font-black backdrop-blur-sm border border-white/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 ${
                isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-3 py-2.5 text-xs'
              }`}
            >
              <Plus size={isSeniorMode ? 18 : 14} /> {t('upload_report')}
            </button>
          </div>
        </div>

        {/* 4 Compact Stat Badges with Plain English */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-sm text-center sm:text-left">
            <div className={`font-black text-white ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>{stats.totalParametersTracked}</div>
            <div className={`text-white/85 font-bold uppercase tracking-wider ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('all_reports')}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenOutOfRangeModal()}
            className="p-3 bg-black/25 hover:bg-black/40 rounded-2xl backdrop-blur-sm text-center sm:text-left transition-all border border-amber-400/30 cursor-pointer active:scale-95"
            title={t('abnormal_findings')}
          >
            <div className={`font-black text-amber-300 flex items-center justify-between ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
              <span>{stats.abnormalCount}</span>
              <span className="text-xs">⚠️ ↗</span>
            </div>
            <div className={`text-amber-200 font-extrabold uppercase tracking-wider ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('abnormal_findings')}
            </div>
          </button>

          <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-sm text-center sm:text-left">
            <div className={`font-black text-emerald-300 ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>{stats.normalCount}</div>
            <div className={`text-white/85 font-bold uppercase tracking-wider ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('normal_status')}
            </div>
          </div>

          <div
            onClick={() => setActiveTab('archive')}
            className="p-3 bg-black/20 hover:bg-black/30 rounded-2xl backdrop-blur-sm text-center sm:text-left cursor-pointer transition-all border border-white/10"
            title={t('all_reports')}
          >
            <div className={`font-black text-cyan-200 flex items-center justify-between ${isSeniorMode ? 'text-2xl' : 'text-xl'}`}>
              <span>{stats.totalHistoricalScans}</span>
              <span className="text-xs">📂</span>
            </div>
            <div className={`text-cyan-200/90 font-bold uppercase tracking-wider ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('reports_title')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Unified Panel, Archived Scans, Trends */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('master')}
            className={`font-black rounded-2xl transition-all flex items-center gap-1.5 ${
              isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-4 py-2 text-xs'
            } ${
              activeTab === 'master'
                ? 'bg-[#0D5C3D] text-white shadow-md'
                : 'bg-white text-[#5C4030] hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Layers size={isSeniorMode ? 16 : 14} />
            <span>{isSeniorMode ? '📋 All Numbers Together' : 'All Parameters Together'} ({allParameters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`font-black rounded-2xl transition-all flex items-center gap-1.5 ${
              isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-4 py-2 text-xs'
            } ${
              activeTab === 'archive'
                ? 'bg-[#0D5C3D] text-white shadow-md'
                : 'bg-white text-[#5C4030] hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Archive size={isSeniorMode ? 16 : 14} />
            <span>{isSeniorMode ? '🗄️ Past Scans Saved' : 'Past Scans & Archive'} ({archivedReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`font-black rounded-2xl transition-all flex items-center gap-1.5 ${
              isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-4 py-2 text-xs'
            } ${
              activeTab === 'trends'
                ? 'bg-[#0D5C3D] text-white shadow-md'
                : 'bg-white text-[#5C4030] hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <TrendingUp size={isSeniorMode ? 16 : 14} />
            <span>{isSeniorMode ? '📈 Changes Over Time' : 'Trends & History'} ({trendParameters.length})</span>
          </button>
        </div>

        <button
          onClick={handleCopySummary}
          className="hidden sm:flex items-center gap-1 text-xs font-black text-[#0D5C3D] bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-2xl border border-emerald-200 transition-all shrink-0 active:scale-95"
          title="Copy structured summary for physician"
        >
          {copiedSummary ? <Check size={14} className="text-emerald-700 stroke-[3]" /> : <Copy size={14} />}
          <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary for Doctor'}</span>
        </button>
      </div>

      {/* TAB 1: ALL PARAMETERS TOGETHER (MASTER HEALTH PANEL) */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={isSeniorMode ? 20 : 16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSeniorMode ? "Search test name (e.g. Sugar, Hemoglobin, Thyroid, Cholesterol, Kidney)..." : "Search parameter (e.g. Glucose, Hemoglobin, SGPT, TSH, Creatinine)..."}
                className={`w-full bg-white rounded-2xl border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-[#0D5C3D] shadow-xs ${
                  isSeniorMode ? 'pl-12 pr-4 py-3.5 text-sm' : 'pl-10 pr-4 py-2.5 text-xs'
                }`}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilterMode('all')}
                className={`font-black whitespace-nowrap transition-all rounded-2xl ${
                  isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs'
                } ${
                  filterMode === 'all'
                    ? 'bg-[#0D5C3D] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All ({allParameters.length})
              </button>
              <button
                onClick={() => setFilterMode('abnormal')}
                className={`font-black whitespace-nowrap transition-all rounded-2xl flex items-center gap-1.5 ${
                  isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs'
                } ${
                  filterMode === 'abnormal'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white border-2 border-red-200 text-red-700 hover:bg-red-50'
                }`}
              >
                <AlertCircle size={isSeniorMode ? 16 : 13} /> {isSeniorMode ? 'Needs Attention' : 'Out of Range'} ({stats.abnormalCount})
              </button>
              <button
                onClick={() => setFilterMode('multi_scan')}
                className={`font-black whitespace-nowrap transition-all rounded-2xl flex items-center gap-1.5 ${
                  isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-3 py-2 text-xs'
                } ${
                  filterMode === 'multi_scan'
                    ? 'bg-cyan-700 text-white shadow-md'
                    : 'bg-white border border-cyan-200 text-cyan-800 hover:bg-cyan-50'
                }`}
              >
                <Archive size={isSeniorMode ? 16 : 13} /> {isSeniorMode ? 'With Past Scans' : 'With History'} ({stats.parametersWithHistoryCount})
              </button>
            </div>
          </div>

          {/* Grouped Master Parameters List */}
          {filteredCategories.length > 0 ? (
            <div className="space-y-4">
              {filteredCategories.map((cat, cIdx) => {
                const isCollapsed = collapsedCategories[cat.groupName] || false;
                const abnormalInGroup = cat.parameters.filter(
                  p => p.latestStatus === 'high' || p.latestStatus === 'low'
                ).length;

                return (
                  <div
                    key={cIdx}
                    className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
                  >
                    {/* Category Header */}
                    <div
                      onClick={() => toggleCategoryCollapse(cat.groupName)}
                      className={`px-5 py-4 bg-[#FEF8F3] hover:bg-[#FDF2E7] border-b border-[#DC7009]/15 flex items-center justify-between cursor-pointer transition-colors ${
                        isSeniorMode ? 'p-5' : 'p-4'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`rounded-2xl bg-[#0D5C3D]/10 text-[#0D5C3D] flex items-center justify-center font-bold shrink-0 ${
                          isSeniorMode ? 'w-11 h-11 text-xl' : 'w-8 h-8 text-xs'
                        }`}>
                          <Activity size={isSeniorMode ? 22 : 16} />
                        </div>
                        <div>
                          <h3 className={`font-black text-gray-900 leading-tight truncate ${isSeniorMode ? 'text-base sm:text-lg' : 'text-sm'}`}>
                            {cat.groupName}
                          </h3>
                          <div className={`text-[#5C4030] font-semibold ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                            {cat.parameters.length} {isSeniorMode ? 'test results in this section' : 'parameters tracked'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {abnormalInGroup > 0 && (
                          <span className={`font-black px-3 py-1 rounded-xl bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 ${
                            isSeniorMode ? 'text-xs' : 'text-[10px]'
                          }`}>
                            <AlertCircle size={13} /> {abnormalInGroup} {isSeniorMode ? 'Attention Needed' : 'Out of Range'}
                          </span>
                        )}
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl"
                        >
                          {isCollapsed ? <ChevronRight size={22} /> : <ChevronDown size={22} />}
                        </button>
                      </div>
                    </div>

                    {/* Parameters Rows */}
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-100">
                        {cat.parameters.map((param) => {
                          const isHigh = param.latestStatus === 'high';
                          const isLow = param.latestStatus === 'low';
                          const isAbnormal = isHigh || isLow;
                          const simpleName = getSimpleTestName(param.name);
                          const simpleMeaning = getSimpleTestMeaning(param.name);

                          return (
                            <div
                              key={param.id}
                              onClick={() => setSelectedParameterForHistory(param)}
                              className={`hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isSeniorMode ? 'p-5 sm:p-6' : 'p-4'
                              } ${
                                isAbnormal ? 'bg-amber-50/20' : ''
                              }`}
                            >
                              {/* Left: Plain English Name, Explanation, Range & Date */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className={`font-black text-gray-900 ${isSeniorMode ? 'text-base sm:text-lg' : 'text-sm'}`}>
                                    {simpleName}
                                  </span>
                                  {isSeniorMode && simpleName !== param.name && (
                                    <span className="text-xs text-gray-500 font-semibold">
                                      ({param.name})
                                    </span>
                                  )}

                                  {/* Status Badge */}
                                  {isHigh && (
                                    <span className={`font-black rounded-xl bg-red-100 text-red-800 border-2 border-red-300 flex items-center gap-1 ${
                                      isSeniorMode ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
                                    }`}>
                                      ⚠️ {isSeniorMode ? 'TOO HIGH (Above Normal)' : 'HIGH ↑'}
                                    </span>
                                  )}
                                  {isLow && (
                                    <span className={`font-black rounded-xl bg-cyan-100 text-cyan-900 border-2 border-cyan-300 flex items-center gap-1 ${
                                      isSeniorMode ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
                                    }`}>
                                      ⚠️ {isSeniorMode ? 'TOO LOW (Below Normal)' : 'LOW ↓'}
                                    </span>
                                  )}
                                  {!isAbnormal && (
                                    <span className={`font-black rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 ${
                                      isSeniorMode ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
                                    }`}>
                                      ✅ {isSeniorMode ? 'HEALTHY & NORMAL' : 'NORMAL'}
                                    </span>
                                  )}

                                  {param.isRecentlyUpdated && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                                      ✨ UPDATED RECENTLY
                                    </span>
                                  )}
                                </div>

                                {simpleMeaning && (
                                  <div className={`text-[#5C4030] font-medium mt-1 ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                                    💡 {simpleMeaning}
                                  </div>
                                )}

                                <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-600 font-semibold mt-2 ${
                                  isSeniorMode ? 'text-xs' : 'text-[11px]'
                                }`}>
                                  <span className="bg-gray-100 px-2.5 py-0.5 rounded-lg">
                                    Safe Normal Range: <strong className="text-gray-900">{param.refRange}</strong>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} /> Tested: {param.latestDate}
                                  </span>
                                  {param.latestDoctor && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[180px]">
                                        Dr. {param.latestDoctor}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Right: Measured Value & Historical Trend */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                {/* Historical Trend indicator vs old scans */}
                                {param.history.length > 1 && param.previousValue && (
                                  <div className="text-right">
                                    <div
                                      className={`font-black flex items-center gap-1 justify-end ${
                                        isSeniorMode ? 'text-xs' : 'text-[11px]'
                                      } ${
                                        param.trend === 'up'
                                          ? isHigh
                                            ? 'text-red-600'
                                            : 'text-emerald-700'
                                          : param.trend === 'down'
                                          ? isLow
                                            ? 'text-cyan-700'
                                            : 'text-emerald-700'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {param.trend === 'up' && <TrendingUp size={14} />}
                                      {param.trend === 'down' && <TrendingDown size={14} />}
                                      {param.trend === 'stable' && <Minus size={14} />}
                                      <span>
                                        {param.delta !== undefined
                                          ? `${param.delta > 0 ? '+' : ''}${param.delta} ${param.unit}`
                                          : 'vs prior'}
                                      </span>
                                    </div>
                                    <div className={`text-gray-500 font-medium ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                                      Was: {param.previousValue} ({param.previousDate})
                                    </div>
                                  </div>
                                )}

                                {/* Latest Current Value Card */}
                                <div className={`text-right bg-[#FEF8F3] rounded-2xl border-2 border-[#DC7009]/30 group-hover:border-[#DC7009] ${
                                  isSeniorMode ? 'px-4 py-2.5 min-w-[110px]' : 'px-3 py-1.5'
                                }`}>
                                  <div className={`font-black text-gray-900 leading-tight ${isSeniorMode ? 'text-lg sm:text-xl' : 'text-sm'}`}>
                                    {param.latestValue}{' '}
                                    <span className="text-xs text-gray-500 font-bold">
                                      {param.unit}
                                    </span>
                                  </div>
                                  <div className={`font-black text-[#DC7009] flex items-center justify-end gap-1 mt-0.5 ${
                                    isSeniorMode ? 'text-xs' : 'text-[10px]'
                                  }`}>
                                    <span>{param.history.length} {isSeniorMode ? 'scans' : 'readings'}</span>
                                    <ArrowUpRight size={12} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300 space-y-2">
              <div className="text-4xl mb-2">🧪</div>
              <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
                No matching blood test numbers found
              </div>
              <p className={`text-gray-600 ${isSeniorMode ? 'text-sm font-medium' : 'text-xs'}`}>
                Take a photo of your lab test report or tap "+ Type Number" to enter your test numbers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ARCHIVED SCANS & HISTORICAL LAB REPORTS */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-5 text-emerald-950 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D5C3D] text-white flex items-center justify-center font-bold shrink-0 text-lg">
              🗄️
            </div>
            <div>
              <h3 className={`font-black text-emerald-950 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
                Archived Lab Scans & Historical Papers
              </h3>
              <p className={`text-emerald-900/80 font-medium mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                Every time you scan a new lab paper, the latest numbers automatically update your master panel, and previous test papers are safely saved here.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {archivedReports.length > 0 ? (
              archivedReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => onOpenReportViewer(report)}
                  className={`bg-white rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between gap-3 hover:border-emerald-400 transition-all cursor-pointer ${
                    isSeniorMode ? 'p-5' : 'p-4'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`rounded-2xl bg-emerald-50 text-[#0D5C3D] flex items-center justify-center shrink-0 font-bold ${
                      isSeniorMode ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-lg'
                    }`}>
                      🧪
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-black text-gray-900 truncate ${isSeniorMode ? 'text-base sm:text-lg' : 'text-sm'}`}>
                        {report.title}
                      </h4>
                      <div className={`text-[#5C4030] font-semibold flex items-center gap-2 mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                        <span>📅 {report.date}</span>
                        {report.doctor && <span>• Dr. {report.doctor}</span>}
                        {report.btData && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg text-[10px] font-black">
                            {report.btData.reduce((acc, g) => acc + g.results.length, 0)} tests
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Do you want to delete this scan from archive?')) {
                          onDeleteReport(report.id);
                        }
                      }}
                      className={`text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center ${
                        isSeniorMode ? 'w-10 h-10' : 'p-2'
                      }`}
                      title="Delete Report"
                    >
                      <Trash2 size={isSeniorMode ? 18 : 15} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300">
                <div className="text-3xl mb-2">📂</div>
                <div className="font-black text-sm text-gray-800">No past scans archived yet</div>
                <p className="text-xs text-gray-500 mt-1">
                  When you scan multiple blood test reports over time, they will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRENDS & PROGRESSION */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 text-purple-950 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold shrink-0 text-lg">
              📈
            </div>
            <div>
              <h3 className={`font-black text-purple-950 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
                Health Trends Over Time
              </h3>
              <p className={`text-purple-900/80 font-medium mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                Compare your blood sugar, cholesterol, and other readings across previous doctor visits.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {trendParameters.map((param) => {
              const isHigh = param.latestStatus === 'high';
              const isLow = param.latestStatus === 'low';
              const simpleName = getSimpleTestName(param.name);

              return (
                <div
                  key={param.id}
                  onClick={() => setSelectedParameterForHistory(param)}
                  className={`bg-white rounded-3xl border border-gray-200 shadow-sm hover:border-purple-300 transition-all cursor-pointer ${
                    isSeniorMode ? 'p-5' : 'p-4'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h4 className={`font-black text-gray-900 ${isSeniorMode ? 'text-base sm:text-lg' : 'text-sm'}`}>
                        {simpleName}
                      </h4>
                      <div className={`text-gray-500 font-semibold ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
                        Normal: {param.refRange}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-lg' : 'text-sm'}`}>
                        {param.latestValue} <span className="text-xs text-gray-500">{param.unit}</span>
                      </div>
                      <span className={`font-black px-2.5 py-0.5 rounded-lg text-[10px] ${
                        isHigh ? 'bg-red-100 text-red-800' : isLow ? 'bg-cyan-100 text-cyan-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {param.latestStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Past readings pill strip */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100">
                    {param.history.map((h, hIdx) => (
                      <div
                        key={hIdx}
                        className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs shrink-0 font-medium text-gray-700"
                      >
                        <span className="font-bold text-gray-900">{h.value} {h.unit}</span>
                        <span className="text-gray-500 text-[10px] ml-1.5">({h.date})</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PARAMETER HISTORY MODAL */}
      {selectedParameterForHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-emerald-500/20">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#0D5C3D] text-white">
              <div>
                <div className="text-[10px] font-black uppercase text-emerald-200">
                  {selectedParameterForHistory.groupName}
                </div>
                <h2 className="font-black text-lg leading-tight">
                  {getSimpleTestName(selectedParameterForHistory.name)}
                </h2>
              </div>
              <button
                onClick={() => setSelectedParameterForHistory(null)}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm no-scrollbar">
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FEF8F3] rounded-3xl border border-[#DC7009]/20">
                <div>
                  <div className="text-[10px] font-black uppercase text-[#5C4030]">
                    Current Value
                  </div>
                  <div className="text-2xl font-black text-gray-900 mt-0.5">
                    {selectedParameterForHistory.latestValue}{' '}
                    <span className="text-xs font-bold text-gray-500">
                      {selectedParameterForHistory.unit}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 font-semibold">
                    Date: {selectedParameterForHistory.latestDate}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-[#5C4030]">
                    Safe Normal Range
                  </div>
                  <div className="text-sm font-black text-gray-800 mt-1">
                    {selectedParameterForHistory.refRange}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-xl ${
                        selectedParameterForHistory.latestStatus === 'high'
                          ? 'bg-red-100 text-red-700'
                          : selectedParameterForHistory.latestStatus === 'low'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedParameterForHistory.latestStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Saved Past Scans on Record</span>
                  <span className="text-gray-500 font-bold">
                    {selectedParameterForHistory.history.length} scans
                  </span>
                </h4>

                <div className="space-y-2.5">
                  {selectedParameterForHistory.history.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        idx === 0
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-black text-sm text-gray-900">
                            {item.date}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {item.doctor || item.reportTitle}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-gray-900">
                            {item.value} <span className="text-xs text-gray-500">{item.unit}</span>
                          </div>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              item.status === 'high'
                                ? 'bg-red-100 text-red-700'
                                : item.status === 'low'
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedParameterForHistory(null)}
                className="w-full py-3.5 rounded-2xl bg-[#0D5C3D] text-white font-black text-sm active:scale-95 transition-all shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
