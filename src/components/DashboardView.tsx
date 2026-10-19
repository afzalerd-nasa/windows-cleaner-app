import React from 'react';
import { 
  Sparkles, 
  Trash2, 
  HardDrive, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Download,
  FolderOpen
} from 'lucide-react';
import { JunkCategory, DiskDrive, CleaningSessionRecord } from '../types';
import { formatBytes } from '../data/mockWindowsData';

interface DashboardViewProps {
  categories: JunkCategory[];
  drives: DiskDrive[];
  history: CleaningSessionRecord[];
  onStartScan: () => void;
  onNavigateToCleaner: () => void;
  onNavigateToDiskAnalyzer: () => void;
  onNavigateToInstaller: () => void;
  isScanning: boolean;
  lastScanDate: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  categories,
  drives,
  history,
  onStartScan,
  onNavigateToCleaner,
  onNavigateToDiskAnalyzer,
  onNavigateToInstaller,
  isScanning,
  lastScanDate
}) => {
  const totalJunkBytes = categories.reduce((acc, cat) => acc + cat.sizeBytes, 0);
  const selectedJunkBytes = categories
    .filter(cat => cat.selected)
    .reduce((acc, cat) => acc + cat.sizeBytes, 0);

  const totalFilesDetected = categories.reduce((acc, cat) => acc + cat.fileCount, 0);
  const totalCleanedAllTime = history.reduce((acc, h) => acc + h.cleanedBytes, 0);

  const systemDrive = drives.find(d => d.isSystemDrive) || drives[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>PC Health & Storage Status</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Last scan: {lastScanDate}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {totalJunkBytes > 0 
                ? `${formatBytes(totalJunkBytes)} of unnecessary junk detected`
                : 'Your PC storage is clean and optimized'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Smart PC Afzal identified temporary system caches, leftover update installers, thumbnail archives, and error logs ready for safe removal without risking personal files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onStartScan}
              disabled={isScanning}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isScanning ? 'Scanning in progress...' : 'Scan Junk Files'}</span>
            </button>

            <button
              onClick={onNavigateToCleaner}
              className="px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Review & Clean ({formatBytes(selectedJunkBytes)})</span>
            </button>

            <button
              onClick={onNavigateToInstaller}
              className="px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ml-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Standalone Offline Installer (.exe)</span>
            </button>
          </div>
        </div>

        {/* System Drive Health Gauge Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                System Drive
              </span>
              <span className="text-xs font-mono text-amber-500 font-medium">
                83% Used
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                {formatBytes(systemDrive.freeBytes, 1)}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Free Space</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Total {formatBytes(systemDrive.totalBytes, 0)} ({systemDrive.name})
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-blue-600 h-full" style={{ width: '40%' }} title="Apps & System"></div>
              <div className="bg-amber-500 h-full" style={{ width: '43%' }} title="Media & Other"></div>
              <div className="bg-slate-300 dark:bg-slate-700 h-full" style={{ width: '17%' }} title="Free Space"></div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Recoverable junk on C:</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatBytes(totalJunkBytes)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Junk Found</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {formatBytes(totalJunkBytes)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across 7 Windows categories</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Identified Files</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {totalFilesDetected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Temporary & cache objects</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Locked Files Skipped</div>
          <div className="text-xl font-bold font-mono text-amber-500">
            13 Files
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Protected in-use processes</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Cleaned To Date</div>
          <div className="text-xl font-bold font-mono text-emerald-500">
            {formatBytes(totalCleanedAllTime)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cumulative reclaimed space</div>
        </div>
      </div>

      {/* Main Content Grid: Categories & Drive Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Junk Categories Summary */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Detected Junk Categories
            </h2>
            <button
              onClick={onNavigateToCleaner}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Manage in Cleaner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {categories.slice(0, 5).map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {cat.path}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {formatBytes(cat.sizeBytes)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {cat.fileCount} files
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drives Overview */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Drives & Storage
              </h2>
              <button
                onClick={onNavigateToDiskAnalyzer}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Analyzer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {drives.map((d) => {
                const percent = Math.round((d.usedBytes / d.totalBytes) * 100);
                return (
                  <div key={d.letter} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                        <span>{d.letter} ({d.name})</span>
                      </span>
                      <span className="font-mono text-slate-500">{percent}% full</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div 
                        className={`h-full rounded-full ${percent > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>{formatBytes(d.freeBytes, 0)} free</span>
                      <span>Total {formatBytes(d.totalBytes, 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>NTFS / exFAT storage detected</span>
            <span className="text-emerald-500 font-medium">SMART Status: Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
