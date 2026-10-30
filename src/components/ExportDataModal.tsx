import React, { useState } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, formatMinutes } from '../data/mockUsageData';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  Upload,
  Printer,
  Check,
  AlertCircle,
  Database,
} from 'lucide-react';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
  const {
    history,
    limits,
    selectedDate,
    currentDayRecord,
    importHistoryData,
  } = useScreenTime();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate and download CSV
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'App ID',
      'App Name',
      'Category',
      'Package Name',
      'Minutes Used',
      'Formatted Time',
      'Opens Count',
      'Notifications Count',
    ];

    const rows: string[] = [headers.join(',')];

    // Iterate through all days in history
    const sortedDates = Object.keys(history).sort();
    sortedDates.forEach((dateStr) => {
      const dayRec = history[dateStr];
      if (!dayRec) return;

      TRACKED_APPS.forEach((app) => {
        const usage = dayRec.apps[app.id];
        const minutes = usage ? usage.minutes : 0;
        const opens = usage ? usage.opens : 0;
        const notifs = usage ? usage.notifications : 0;

        rows.push(
          [
            dateStr,
            app.id,
            `"${app.name}"`,
            app.category,
            app.packageName,
            minutes,
            `"${formatMinutes(minutes)}"`,
            opens,
            notifs,
          ].join(',')
        );
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `chronos_screentime_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('CSV Export downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Generate and download JSON backup
  const handleExportJSON = () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      limits,
      history,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `chronos_screentime_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('JSON Backup downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Handle JSON file upload
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.history) {
          const success = importHistoryData(parsed.history, parsed.limits);
          if (success) {
            setImportStatus('Backup restored successfully!');
          } else {
            setImportStatus('Failed: invalid data format');
          }
        } else {
          setImportStatus('Invalid JSON backup file');
        }
      } catch {
        setImportStatus('Error reading file');
      }
    };
    reader.readAsText(file);
  };

  // Printable Summary
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Export & Backup Screen Time</h2>
            <p className="text-xs text-slate-400">
              Download your usage logs for spreadsheets, analysis, or archival
            </p>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> {downloadSuccess}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/50 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Export as CSV (Excel / Google Sheets)
                </span>
                <span className="text-xs text-slate-400">
                  Daily & hourly records for Instagram, WhatsApp, Chrome & all apps
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-2" />
          </button>

          {/* JSON Full Backup Button */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/50 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 group-hover:scale-105 transition">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Export Full JSON Backup
                </span>
                <span className="text-xs text-slate-400">
                  Full snapshot including custom alert caps, history & settings
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-2" />
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrintReport}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/50 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Print / Save PDF Wellbeing Summary
                </span>
                <span className="text-xs text-slate-400">
                  Aesthetic printable overview with charts and insights
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-2" />
          </button>
        </div>

        {/* Restore Backup Section */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" /> Restore from JSON Backup
            </span>
            {importStatus && (
              <span className="text-[11px] text-sky-400 font-semibold">{importStatus}</span>
            )}
          </div>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/50 cursor-pointer text-xs text-slate-400 hover:text-white transition">
            <Upload className="w-4 h-4" />
            <span>Select .json file to restore</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
