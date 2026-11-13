import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Search,
  Calendar,
  User,
  Activity,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Camera,
  Volume2,
  VolumeX
} from 'lucide-react';
import { MedicalReport, ParsedOcrData } from '../types';
import { runOCRScan, compressImage } from '../utils/ocr';
import { genId } from '../utils/storage';
import { UnifiedBloodTestView } from './UnifiedBloodTestView';
import { useI18n } from '../utils/i18n';

interface ReportsViewProps {
  reports: MedicalReport[];
  onSaveReports: (reports: MedicalReport[]) => void;
  onOpenBloodTestModal: () => void;
  onOpenReportViewer: (report: MedicalReport) => void;
  onOcrComplete: (data: ParsedOcrData, image?: string) => void;
  onOpenOutOfRangeModal: (reportId?: string) => void;
  isSeniorMode?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  onSaveReports,
  onOpenBloodTestModal,
  onOpenReportViewer,
  onOcrComplete,
  onOpenOutOfRangeModal,
  isSeniorMode = false
}) => {
  const { t } = useI18n();
  const [filterCat, setFilterCat] = useState<string>('blood'); // Default to unified blood tests for seniors
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{ pct: number; text: string }>({ pct: 0, text: '' });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Manual Upload modal fields
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCat, setUploadCat] = useState<MedicalReport['cat']>('blood');
  const [uploadDoctor, setUploadDoctor] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFile, setUploadFile] = useState<string | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const handleFileWithOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress({ pct: 10, text: 'Preparing image...' });

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const raw = reader.result as string;
        const compressed = await compressImage(raw, 1200, 0.8);
        const parsed = await runOCRScan(compressed, (pct, text) => {
          setScanProgress({ pct, text });
        });

        setIsScanning(false);
        onOcrComplete(parsed, compressed);
      } catch (err) {
        console.error('Scan error:', err);
        setIsScanning(false);
        alert('Could not parse document. You can still save it as a regular file.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualUploadSave = () => {
    if (!uploadTitle.trim()) {
      alert('Please enter a report title');
      return;
    }

    const newReport: MedicalReport = {
      id: genId('REP'),
      title: uploadTitle.trim(),
      cat: uploadCat,
      date: uploadDate,
      doctor: uploadDoctor.trim() || undefined,
      notes: uploadNotes.trim() || undefined,
      file: uploadFile,
      fileType: 'image/jpeg'
    };

    onSaveReports([newReport, ...reports]);
    setIsUploadModalOpen(false);
    setUploadTitle('');
    setUploadDoctor('');
    setUploadNotes('');
    setUploadFile(undefined);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Do you want to delete this report?')) {
      onSaveReports(reports.filter(r => r.id !== id));
    }
  };

  // Stats calculation
  const totalReports = reports.length;
  const bloodTestReports = reports.filter(r => r.cat === 'blood').length;
  let abnormalParamCount = 0;
  reports.forEach(r => {
    r.btData?.forEach(g => {
      g.results.forEach(res => {
        if (res.status === 'high' || res.status === 'low') abnormalParamCount++;
      });
    });
  });

  const filteredReports = reports.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      r.title.toLowerCase().includes(q) ||
      (r.doctor && r.doctor.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (filterCat === 'all') return true;
    return r.cat === filterCat;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* OCR Loading Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-emerald-500/30">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0D5C3D] flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles size={32} />
            </div>
            <h3 className="font-black text-lg text-gray-900">
              Reading Medical Paper...
            </h3>
            <p className="text-xs text-gray-600 mt-1 mb-5">{scanProgress.text}</p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200">
              <div
                className="bg-gradient-to-r from-[#0D5C3D] to-[#52B87A] h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${scanProgress.pct}%` }}
              />
            </div>
            <div className="text-xs font-black text-[#0D5C3D] mt-2">
              {scanProgress.pct}% complete
            </div>
          </div>
        </div>
      )}

      {/* View Gradient Header */}
      <div className="gh-reps rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className={`font-black tracking-widest uppercase opacity-90 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('reports_subtitle')}
            </div>
            <h1 className={`font-black tracking-tight ${isSeniorMode ? 'text-2xl sm:text-3xl' : 'text-2xl'}`}>
              {t('reports_title')}
            </h1>
            <p className={`text-white/85 font-medium mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
              {t('reports_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBloodTestModal}
              className={`rounded-2xl bg-white text-[#0D5C3D] font-black shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1.5 ${
                isSeniorMode ? 'px-5 py-2.5 text-sm' : 'px-3.5 py-2 text-xs'
              }`}
            >
              <Plus size={isSeniorMode ? 18 : 15} /> {t('upload_report')}
            </button>
          </div>
        </div>

        {/* 3 Stat Pills in Simple English */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
          <div
            onClick={() => setFilterCat('all')}
            className={`p-3 rounded-2xl backdrop-blur-sm text-center cursor-pointer transition-all ${
              filterCat === 'all' ? 'bg-black/35 ring-2 ring-white/50' : 'bg-black/20 hover:bg-black/30'
            }`}
          >
            <div className={`font-black ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>{totalReports}</div>
            <div className={`opacity-85 font-bold uppercase ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              {t('all_reports')}
            </div>
          </div>
          <div
            onClick={() => setFilterCat('blood')}
            className={`p-3 rounded-2xl backdrop-blur-sm text-center cursor-pointer transition-all ${
              filterCat === 'blood' ? 'bg-black/35 ring-2 ring-emerald-300' : 'bg-black/20 hover:bg-black/30'
            }`}
            title={t('unified_blood_tests')}
          >
            <div className={`font-black text-emerald-300 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>{bloodTestReports}</div>
            <div className={`opacity-95 font-black uppercase flex items-center justify-center gap-1 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              <span>{t('unified_blood_tests')}</span>
              <span>↗</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenOutOfRangeModal()}
            className="p-3 bg-black/20 hover:bg-black/35 rounded-2xl backdrop-blur-sm text-center transition-all cursor-pointer active:scale-95 border border-amber-400/30 hover:border-amber-400/60 shadow-sm"
            title={t('abnormal_findings')}
          >
            <div className={`font-black text-amber-300 flex items-center justify-center gap-1 ${isSeniorMode ? 'text-2xl' : 'text-lg'}`}>
              <span>{abnormalParamCount}</span>
              {abnormalParamCount > 0 && <span className="text-xs">⚠️</span>}
            </div>
            <div className={`text-amber-200 font-black uppercase flex items-center justify-center gap-1 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
              <span>{t('abnormal_findings')}</span>
              <span>↗</span>
            </div>
          </button>
        </div>
      </div>

      {/* OCR & Action Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* OCR Scan Action */}
        <label className={`bg-gradient-to-br from-emerald-50 to-[#FEF8F3] rounded-3xl border-2 border-emerald-300/80 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-emerald-500 transition-all active:scale-98 group ${
          isSeniorMode ? 'p-5 min-h-[88px]' : 'p-4'
        }`}>
          <div className={`rounded-2xl bg-[#0D5C3D] text-white flex items-center justify-center shrink-0 shadow-md transition-transform ${
            isSeniorMode ? 'w-14 h-14' : 'w-12 h-12'
          }`}>
            <Sparkles size={isSeniorMode ? 26 : 22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-black text-emerald-950 flex items-center gap-2 ${isSeniorMode ? 'text-sm sm:text-base' : 'text-xs'}`}>
              <span>{t('scan_paper_report')}</span>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full">
                AI
              </span>
            </div>
            <div className={`text-emerald-900/80 mt-0.5 font-medium ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
              {t('reports_subtitle')}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileWithOcr}
            className="hidden"
          />
        </label>

        {/* Structured Blood Test Form */}
        <button
          onClick={onOpenBloodTestModal}
          className={`bg-white hover:bg-orange-50/50 rounded-3xl border-2 border-gray-200 shadow-sm flex items-center gap-3.5 transition-all text-left active:scale-98 group ${
            isSeniorMode ? 'p-5 min-h-[88px]' : 'p-4'
          }`}
        >
          <div className={`rounded-2xl bg-[#DC7009] text-white flex items-center justify-center shrink-0 shadow-md transition-transform ${
            isSeniorMode ? 'w-14 h-14' : 'w-12 h-12'
          }`}>
            <Activity size={isSeniorMode ? 26 : 22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-sm sm:text-base' : 'text-xs'}`}>
              {t('unified_blood_tests')}
            </div>
            <div className={`text-gray-600 mt-0.5 font-medium ${isSeniorMode ? 'text-xs' : 'text-[11px]'}`}>
              Blood Sugar, CBC, Cholesterol, Thyroid, Kidney & Liver.
            </div>
          </div>
        </button>
      </div>

      {/* Category Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'blood', label: `🧪 ${t('unified_blood_tests')}` },
          { id: 'all', label: `📋 ${t('all_reports')}` },
          { id: 'prescription', label: `💊 ${t('meds_title')}` },
          { id: 'radiology', label: '🩻 X-Ray' },
          { id: 'discharge', label: '🏥 Summary' },
          { id: 'other', label: '📄 Other' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`font-black whitespace-nowrap transition-all rounded-full ${
              isSeniorMode ? 'px-4 py-2.5 text-sm' : 'px-3.5 py-1.5 text-xs'
            } ${
              filterCat === cat.id
                ? 'bg-[#0D5C3D] text-white shadow-md'
                : 'bg-white border border-gray-200 text-[#5C4030] hover:bg-emerald-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Conditionally render Unified Blood Test Dashboard or Standard Documents List */}
      {filterCat === 'blood' ? (
        <UnifiedBloodTestView
          reports={reports}
          onOpenBloodTestModal={onOpenBloodTestModal}
          onOpenReportViewer={onOpenReportViewer}
          onOpenOutOfRangeModal={onOpenOutOfRangeModal}
          onScanNewReport={triggerScan}
          onDeleteReport={(reportId) => {
            const updated = reports.filter(r => r.id !== reportId);
            onSaveReports(updated);
          }}
          isSeniorMode={isSeniorMode}
        />
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search size={isSeniorMode ? 20 : 16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_reports_placeholder')}
              className={`w-full bg-white rounded-2xl border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-[#0D5C3D] shadow-xs ${
                isSeniorMode ? 'pl-12 pr-4 py-3.5 text-sm' : 'pl-10 pr-4 py-2.5 text-xs'
              }`}
            />
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
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
                      {report.cat === 'blood' ? '🧪' : report.cat === 'prescription' ? '💊' : report.cat === 'radiology' ? '🩻' : '📄'}
                    </div>

                    <div className="min-w-0">
                      <h3 className={`font-black text-gray-900 truncate ${isSeniorMode ? 'text-base sm:text-lg' : 'text-sm'}`}>
                        {report.title}
                      </h3>
                      <div className={`text-[#5C4030] font-semibold flex items-center gap-2 mt-0.5 ${isSeniorMode ? 'text-sm' : 'text-xs'}`}>
                        <span>📅 {report.date}</span>
                        {report.doctor && <span>• Dr. {report.doctor}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, report.id)}
                      className={`text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center ${
                        isSeniorMode ? 'w-10 h-10' : 'p-2'
                      }`}
                      title={t('clear_data_btn')}
                    >
                      <Trash2 size={isSeniorMode ? 18 : 15} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-gray-300 space-y-2">
                <div className="text-4xl mb-2">📄</div>
                <div className={`font-black text-gray-900 ${isSeniorMode ? 'text-base' : 'text-sm'}`}>
                  {t('no_reports_found')}
                </div>
                <p className={`text-gray-600 ${isSeniorMode ? 'text-sm font-medium' : 'text-xs'}`}>
                  {t('reports_subtitle')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
