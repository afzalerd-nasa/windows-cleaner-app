import React from 'react';
import { Sparkles, CheckCircle2, Shield, X, ArrowRight, HardDrive } from 'lucide-react';
import { formatBytes } from '../data/mockWindowsData';

interface CleanSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cleanedBytes: number;
  filesDeleted: number;
  filesSkipped: number;
  durationMs: number;
  restorePointCreated: boolean;
}

export const CleanSummaryModal: React.FC<CleanSummaryModalProps> = ({
  isOpen,
  onClose,
  cleanedBytes,
  filesDeleted,
  filesSkipped,
  durationMs,
  restorePointCreated
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cleaning Completed Successfully
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your Windows storage has been safely cleaned and optimized.
            </p>
          </div>

          {/* Big Reclaimed Space Stat */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 mb-0.5">Total Disk Space Freed</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-500">
              +{formatBytes(cleanedBytes)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Returned to free space pool on Drive C:
            </div>
          </div>

          {/* Detailed stats */}
          <div className="grid grid-cols-3 gap-2 text-left text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-500">Files Deleted</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {filesDeleted.toLocaleString()}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-500">Locked Skipped</div>
              <div className="font-mono font-bold text-amber-500 mt-0.5">
                {filesSkipped}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-500">Elapsed Time</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {(durationMs / 1000).toFixed(1)}s
              </div>
            </div>
          </div>

          {restorePointCreated && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>System Restore Point checkpoint saved before cleanup</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-colors"
          >
            Done & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
