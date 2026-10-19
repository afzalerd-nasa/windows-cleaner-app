import React from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { CleaningSessionRecord } from '../types';
import { formatBytes } from '../data/mockWindowsData';
import { triggerTextDownload } from '../services/nativePackageBuilder';

interface HistoryReportsViewProps {
  history: CleaningSessionRecord[];
  onClearHistory: () => void;
}

export const HistoryReportsView: React.FC<HistoryReportsViewProps> = ({
  history,
  onClearHistory
}) => {
  const totalCleanedBytes = history.reduce((acc, h) => acc + h.cleanedBytes, 0);
  const totalDeletedFiles = history.reduce((acc, h) => acc + h.filesDeleted, 0);
  const totalSkippedFiles = history.reduce((acc, h) => acc + h.filesSkipped, 0);

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(history, null, 2);
    triggerTextDownload(dataStr, `SmartPCAfzal_CleaningHistory_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const exportAsCSV = () => {
    const headers = ['ID', 'Timestamp', 'CleanedBytes', 'FilesDeleted', 'FilesSkipped', 'DurationMs', 'RestorePointCreated', 'Categories'];
    const rows = history.map(h => [
      h.id,
      `"${h.timestamp}"`,
      h.cleanedBytes,
      h.filesDeleted,
      h.filesSkipped,
      h.durationMs,
      h.restorePointCreated,
      `"${h.categoriesCleaned.join('; ')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerTextDownload(csvContent, `SmartPCAfzal_CleaningHistory_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Cleaning History & Reports Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit trail of all previous cleanup sessions, recovered capacity, and skipped files.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAsCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportAsJSON}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-500" />
            <span>Export JSON</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Space Reclaimed</div>
          <div className="text-2xl font-bold font-mono text-emerald-500">
            {formatBytes(totalCleanedBytes)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Free space restored to Windows drives</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Junk Files Removed</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalDeletedFiles.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all historical sessions</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protected Files Preserved</div>
          <div className="text-2xl font-bold font-mono text-amber-500">
            {totalSkippedFiles.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Locked in-use files safely bypassed</div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          Session Activity Log
        </h2>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No cleanup sessions recorded yet. Run a cleanup to see history records here.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Categories Cleaned</th>
                  <th className="py-2.5 px-3">Files Deleted</th>
                  <th className="py-2.5 px-3">Locked Skipped</th>
                  <th className="py-2.5 px-3">Checkpoint</th>
                  <th className="py-2.5 px-3 text-right">Space Recovered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-white">
                      {record.timestamp}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      <div className="truncate max-w-[280px]" title={record.categoriesCleaned.join(', ')}>
                        {record.categoriesCleaned.join(', ')}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {record.filesDeleted.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-500">
                      {record.filesSkipped}
                    </td>
                    <td className="py-2.5 px-3">
                      {record.restorePointCreated ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Created</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatBytes(record.cleanedBytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
