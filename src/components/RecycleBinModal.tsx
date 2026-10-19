import React from 'react';
import { Trash2, AlertTriangle, X, Check, FolderOpen } from 'lucide-react';
import { JunkCategory } from '../types';
import { formatBytes } from '../data/mockWindowsData';

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  recycleBinCategory: JunkCategory;
  onConfirmEmpty: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  onClose,
  recycleBinCategory,
  onConfirmEmpty
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Inspect Windows Recycle Bin
              </h3>
              <p className="text-[11px] text-slate-500">
                {recycleBinCategory.fileCount} items found · {formatBytes(recycleBinCategory.sizeBytes)} total
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Permanent Deletion Warning:</strong> Emptying the Recycle Bin will permanently purge these files from your storage drives. Please verify that no personal documents or essential files are present.
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Detected Items Awaiting Purge:
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {recycleBinCategory.sampleFiles.map((file, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {file.path}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatBytes(file.sizeBytes)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmEmpty();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm & Empty Recycle Bin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
