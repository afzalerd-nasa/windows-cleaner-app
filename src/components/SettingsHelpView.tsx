import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  Lock, 
  FileText, 
  ExternalLink,
  Laptop
} from 'lucide-react';

interface SettingsHelpViewProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const SettingsHelpView: React.FC<SettingsHelpViewProps> = ({
  darkMode,
  setDarkMode
}) => {
  const [skipLockedFiles, setSkipLockedFiles] = useState(true);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [autoRestorePoint, setAutoRestorePoint] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const [lowDiskAlertPct, setLowDiskAlertPct] = useState(15);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
          Settings & Application Information
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure cleaning safety parameters, alerts, and inspect version specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cleaning Engine Preferences */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Cleaning Engine Rules
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Skip In-Use & Locked Files
                </div>
                <div className="text-[11px] text-slate-500">
                  Safely bypass files locked by running applications without halting the engine.
                </div>
              </div>
              <input
                type="checkbox"
                checked={skipLockedFiles}
                onChange={(e) => setSkipLockedFiles(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </label>

            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Require Confirmation for Recycle Bin
                </div>
                <div className="text-[11px] text-slate-500">
                  Display an itemized confirmation dialog before permanently purging items.
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireConfirmation}
                onChange={(e) => setRequireConfirmation(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </label>

            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Automatic Restore Point Checkpoint
                </div>
                <div className="text-[11px] text-slate-500">
                  Create a Windows System Restore point before initiating high-volume cleaning.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRestorePoint}
                onChange={(e) => setAutoRestorePoint(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Interface & Notifications */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Settings className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Interface & Notifications
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Appearance Theme
                </div>
                <div className="text-[11px] text-slate-500">
                  Toggle between Windows 11 Dark Mode and Light Mode.
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                {darkMode ? 'Dark Theme' : 'Light Theme'}
              </button>
            </label>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Low Disk Space Alert Threshold</span>
                <span className="font-mono text-slate-500">{lowDiskAlertPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={lowDiskAlertPct}
                onChange={(e) => setLowDiskAlertPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[11px] text-slate-500">
                Warns when free space on the system drive falls below {lowDiskAlertPct}%.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publisher & Security Pledge */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            About Smart PC Afzal
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <div className="text-slate-500">Publisher:</div>
            <div className="font-semibold text-slate-900 dark:text-white">Afzal Software Systems</div>
          </div>
          <div>
            <div className="text-slate-500">Version:</div>
            <div className="font-mono font-semibold text-slate-900 dark:text-white">1.0.0.0 (Build 2026.10)</div>
          </div>
          <div>
            <div className="text-slate-500">License:</div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">Perpetual Offline License</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Offline Security Guarantee:</strong> Smart PC Afzal operates in strict air-gapped isolation without requiring an internet connection or account login. The application does not collect telemetry, transmit scan results, modify the Windows Registry automatically, or interfere with Windows Defender and Windows Update services.
        </div>
      </div>
    </div>
  );
};
