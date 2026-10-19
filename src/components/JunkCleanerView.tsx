import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  Terminal, 
  RotateCcw,
  Shield,
  FolderOpen,
  Info
} from 'lucide-react';
import { JunkCategory, ScanLogEntry } from '../types';
import { formatBytes } from '../data/mockWindowsData';

interface JunkCleanerViewProps {
  categories: JunkCategory[];
  onToggleCategory: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onStartScan: () => void;
  onExecuteClean: (createRestorePoint: boolean) => void;
  onOpenRecycleBinModal: () => void;
  isScanning: boolean;
  isCleaning: boolean;
  progressPercent: number;
  currentTaskDescription: string;
  logs: ScanLogEntry[];
}

export const JunkCleanerView: React.FC<JunkCleanerViewProps> = ({
  categories,
  onToggleCategory,
  onSelectAll,
  onStartScan,
  onExecuteClean,
  onOpenRecycleBinModal,
  isScanning,
  isCleaning,
  progressPercent,
  currentTaskDescription,
  logs
}) => {
  const [createRestorePoint, setCreateRestorePoint] = useState(true);
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState<string | null>(categories[0]?.id || null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'SKIP' | 'SUCCESS'>('ALL');

  const selectedCount = categories.filter(c => c.selected).length;
  const selectedBytes = categories
    .filter(c => c.selected)
    .reduce((acc, c) => acc + c.sizeBytes, 0);

  const activeCategory = categories.find(c => c.id === selectedCategoryDetails) || categories[0];

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'SKIP') return log.level === 'SKIP';
    if (logFilter === 'SUCCESS') return log.level === 'SUCCESS';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PC Junk File Cleaner
            </h1>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Safe Clean Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select safe categories to clean. Active locked files are automatically skipped to guarantee zero system instability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={createRestorePoint}
              onChange={(e) => setCreateRestorePoint(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Create System Restore Point checkpoint</span>
            </span>
          </label>

          <button
            onClick={onStartScan}
            disabled={isScanning || isCleaning}
            className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Rescan Categories</span>
          </button>

          <button
            onClick={() => onExecuteClean(createRestorePoint)}
            disabled={isScanning || isCleaning || selectedBytes === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean Selected ({formatBytes(selectedBytes)})</span>
          </button>
        </div>
      </div>

      {/* Progress & Live Task Bar (when scanning or cleaning) */}
      {(isScanning || isCleaning) && (
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
              <span>{isCleaning ? 'Cleaning Files...' : 'Scanning Windows Temporary Directories...'}</span>
            </span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-blue-200 dark:bg-blue-900/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
            Current: {currentTaskDescription}
          </div>
        </div>
      )}

      {/* Two Column Layout: Categories Table + Details/Log Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Categories List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Selected <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCount}</span> of {categories.length} categories ({formatBytes(selectedBytes)})
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectAll(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Select All Safe
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => onSelectAll(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const isSelected = cat.selected;
              const isDetailOpen = selectedCategoryDetails === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryDetails(cat.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isDetailOpen
                      ? 'border-blue-500/60 ring-1 ring-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCategory(cat.id);
                      }}
                      className="mt-0.5 text-blue-600 dark:text-blue-400 focus:outline-none"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {cat.name}
                          </span>
                          {cat.requiresConfirmation && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              Confirmation Required
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white shrink-0 pl-2">
                          {formatBytes(cat.sizeBytes)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5">
                        {cat.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono truncate max-w-xs">{cat.path}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {cat.lockedFilesCount ? (
                            <span className="text-amber-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>{cat.lockedFilesCount} locked</span>
                            </span>
                          ) : null}
                          <span>{cat.fileCount} files</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {cat.id === 'recycle-bin' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Preview Recycle Bin contents before cleaning</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRecycleBinModal();
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Inspect Files ({cat.fileCount})</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Category File Preview & Live Execution Log */}
        <div className="lg:col-span-5 space-y-4">
          {/* Detailed Inspector Card */}
          {activeCategory && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Folder Inspector
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {formatBytes(activeCategory.sizeBytes)}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                {activeCategory.name}
              </div>
              <div className="text-[11px] font-mono text-slate-500 break-all mb-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-100 dark:border-slate-800">
                {activeCategory.path}
              </div>

              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Sample Files Detected
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeCategory.sampleFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Modified {file.dateModified}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {formatBytes(file.sizeBytes)}
                      </div>
                      {file.isLocked && (
                        <span className="text-[10px] text-amber-500 flex items-center gap-0.5 justify-end">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cleaning & Scan Engine Log Terminal */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-300">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Engine Execution Log</span>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setLogFilter('ALL')}
                  className={`px-2 py-0.5 rounded ${logFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setLogFilter('SKIP')}
                  className={`px-2 py-0.5 rounded ${logFilter === 'SKIP' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Skipped
                </button>
                <button
                  onClick={() => setLogFilter('SUCCESS')}
                  className={`px-2 py-0.5 rounded ${logFilter === 'SUCCESS' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Deleted
                </button>
              </div>
            </div>

            <div className="font-mono text-[11px] space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 py-6 text-center">
                  Engine ready. Click &quot;Scan Junk Files&quot; to inspect directories.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  let badgeColor = 'text-slate-400';
                  if (log.level === 'SUCCESS') badgeColor = 'text-emerald-400 font-semibold';
                  if (log.level === 'SKIP') badgeColor = 'text-amber-400 font-semibold';
                  if (log.level === 'WARN') badgeColor = 'text-rose-400 font-semibold';

                  return (
                    <div key={log.id} className="leading-tight flex items-start gap-2">
                      <span className="text-slate-600 shrink-0">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                      <span className={`${badgeColor} shrink-0`}>[{log.level}]</span>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
