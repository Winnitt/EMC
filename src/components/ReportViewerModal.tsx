import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  User,
  FileText,
  Download,
  Trash2,
  Activity,
  Printer,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { MedicalReport } from '../types';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MedicalReport | null;
  onDelete: (id: string) => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  report,
  onDelete
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'abnormal' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute metrics unconditionally
  const allResults = useMemo(() => {
    if (!report?.btData) return [];
    return report.btData.flatMap((g) => g.results.map((r) => ({ ...r, groupName: g.g })));
  }, [report]);

  const totalParams = allResults.length;
  const abnormalCount = allResults.filter((r) => r.status === 'high' || r.status === 'low').length;
  const highCount = allResults.filter((r) => r.status === 'high').length;
  const lowCount = allResults.filter((r) => r.status === 'low').length;
  const normalCount = totalParams - abnormalCount;

  // Filtered groups
  const displayedGroups = useMemo(() => {
    if (!report?.btData) return [];
    const q = searchQuery.toLowerCase().trim();

    return report.btData
      .map((g) => {
        const filteredResults = g.results.filter((res) => {
          if (filterTab === 'abnormal' && res.status !== 'high' && res.status !== 'low') {
            return false;
          }
          if (filterTab === 'normal' && (res.status === 'high' || res.status === 'low')) {
            return false;
          }
          if (q) {
            return (
              res.n.toLowerCase().includes(q) ||
              g.g.toLowerCase().includes(q) ||
              (res.status && res.status.toLowerCase().includes(q))
            );
          }
          return true;
        });

        return {
          ...g,
          results: filteredResults
        };
      })
      .filter((g) => g.results.length > 0);
  }, [report, filterTab, searchQuery]);

  if (!isOpen || !report) return null;

  const handleDelete = () => {
    if (confirm(`Delete report "${report.title}"?`)) {
      onDelete(report.id);
      onClose();
    }
  };

  const handleDownload = () => {
    if (!report.file) return;
    const a = document.createElement('a');
    a.href = report.file;
    a.download = `${report.title.replace(/\s+/g, '_')}_${report.date}.jpg`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-in fade-in print:p-0 print:bg-white">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#0D5C3D]/20 print:max-h-full print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#0D5C3D] text-white print:bg-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight truncate max-w-xs sm:max-w-md">
                {report.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-emerald-200 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {report.date}
                </span>
                {report.doctor && (
                  <span className="flex items-center gap-1">
                    <User size={12} /> {report.doctor}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handlePrint}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
              title="Print Complete Parameter Report"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-sm no-scrollbar bg-[#FCFAF8]">
          {/* Top Summary Banner for Complete Parameter Report */}
          {totalParams > 0 && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
              <div className="p-2 bg-emerald-50/60 rounded-xl">
                <div className="text-base sm:text-lg font-black text-[#0D5C3D]">{totalParams}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Total Parameters</div>
              </div>
              <div className="p-2 bg-emerald-50/60 rounded-xl">
                <div className="text-base sm:text-lg font-black text-emerald-700">{normalCount}</div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Normal Range</div>
              </div>
              <div className="p-2 bg-red-50/60 rounded-xl">
                <div className={`text-base sm:text-lg font-black ${abnormalCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {abnormalCount}
                </div>
                <div className="text-[10px] font-bold text-red-700 uppercase">Out of Range</div>
              </div>
            </div>
          )}

          {/* Notes badge */}
          {report.notes && (
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
              📝 <strong>Clinical Notes:</strong> {report.notes}
            </div>
          )}

          {/* Filter & Search Bar */}
          {totalParams > 0 && (
            <div className="space-y-2 print:hidden">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1.5 text-xs font-bold">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      filterTab === 'all'
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All ({totalParams})
                  </button>
                  <button
                    onClick={() => setFilterTab('abnormal')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      filterTab === 'abnormal'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white border border-red-200 text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <AlertTriangle size={13} /> Out of Range ({abnormalCount})
                  </button>
                  <button
                    onClick={() => setFilterTab('normal')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      filterTab === 'normal'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 size={13} /> Normal ({normalCount})
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parameter in this report..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Structured Blood Test Results Tables */}
          {report.btData && report.btData.length > 0 && (
            <div className="space-y-4">
              {displayedGroups.length > 0 ? (
                displayedGroups.map((group, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                  >
                    <div className="bg-emerald-50/80 px-4 py-2.5 font-bold text-xs text-emerald-900 border-b border-emerald-100 flex justify-between items-center">
                      <span>{group.g}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {group.results.length} parameters
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.results.map((res, rIdx) => {
                        const isHigh = res.status === 'high';
                        const isLow = res.status === 'low';
                        return (
                          <div
                            key={rIdx}
                            className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-xs transition-colors"
                          >
                            <div className="pr-2">
                              <span className="font-bold text-gray-900">{res.n}</span>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                Normal Range: {res.refRange || `${res.mn} - ${res.mx} ${res.u}`}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`font-black text-sm sm:text-base ${
                                  isHigh ? 'text-red-600' : isLow ? 'text-cyan-800' : 'text-gray-900'
                                }`}
                              >
                                {res.val}
                              </span>
                              <span className="text-[11px] text-gray-500">{res.u}</span>
                              {isHigh && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-100 text-red-700 flex items-center gap-0.5 border border-red-200">
                                  <TrendingUp size={11} /> HIGH
                                </span>
                              )}
                              {isLow && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 flex items-center gap-0.5 border border-cyan-200">
                                  <TrendingDown size={11} /> LOW
                                </span>
                              )}
                              {!isHigh && !isLow && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  NORMAL
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
                  No parameters match your search or filter.
                </div>
              )}
            </div>
          )}

          {/* Uploaded File Image Preview */}
          {report.file && (
            <div className="space-y-2 pt-2 border-t border-gray-200 print:hidden">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase text-gray-700">
                  Original Scanned Document
                </span>
                <button
                  onClick={handleDownload}
                  className="text-xs font-bold text-[#DC7009] flex items-center gap-1 hover:underline"
                >
                  <Download size={14} /> Download Document
                </button>
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-900 flex items-center justify-center max-h-96">
                <img
                  src={report.file}
                  alt={report.title}
                  className="max-h-96 w-full object-contain cursor-zoom-in"
                  onClick={() => window.open(report.file, '_blank')}
                />
              </div>
              <div className="text-[11px] text-center text-gray-400">
                Tap image to open full resolution
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3 print:hidden">
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={16} /> Delete Report
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#0D5C3D] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
