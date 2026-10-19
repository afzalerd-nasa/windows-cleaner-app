import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  AlertCircle, 
  FileCheck, 
  Layers,
  ShieldAlert,
  Plus
} from 'lucide-react';

interface SafetyViewProps {
  onOpenCreateRestorePoint: () => void;
  lastRestorePoint: string;
}

export const SafetyView: React.FC<SafetyViewProps> = ({
  onOpenCreateRestorePoint,
  lastRestorePoint
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'restore'>('rules');

  const safetyGuarantees = [
    {
      title: 'Zero Personal File Deletion',
      desc: 'Smart PC Afzal is hard-coded to ignore user personal directories: C:\\Users\\*\\Documents, Desktop, Pictures, Music, Videos, and OneDrive.',
      icon: CheckCircle2,
      color: 'text-emerald-500'
    },
    {
      title: 'Browser Password & Session Preservation',
      desc: 'Browser cookies, saved credentials, auto-complete profiles, and active session tokens are never scanned or removed. Only transient GPU shader caches are cleared.',
      icon: Lock,
      color: 'text-blue-500'
    },
    {
      title: 'In-Use / Locked File Protection',
      desc: 'Before attempting removal, the engine attempts an exclusive read-write lock. If another process has the file open, it is safely recorded as [SKIP] without interruption.',
      icon: ShieldCheck,
      color: 'text-purple-500'
    },
    {
      title: 'Core Windows Kernel Integrity',
      desc: 'System files (.sys, .dll, .exe, System32, SysWOW64, pagefile.sys, hiberfil.sys) are permanently protected in the binary exclusion list.',
      icon: ShieldAlert,
      color: 'text-amber-500'
    }
  ];

  const excludedExtensions = [
    '.sys', '.dll', '.exe', '.drv', '.ocx', '.cpl', '.msc', '.dat', '.reg'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Safety Architecture & System Restore
            </h1>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Strict Non-Destructive Policy
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Engineered with strict safety rails. Smart PC Afzal never compromises operating system stability or touches private user files.
          </p>
        </div>

        <button
          onClick={onOpenCreateRestorePoint}
          className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Restore Point</span>
        </button>
      </div>

      {/* Safety Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safetyGuarantees.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-3"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${item.color}`} />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {item.title}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restore Point Status Card */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Windows System Restore Integration (Checkpoint-Computer)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Last checkpoint: {lastRestorePoint}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Before performing any major cleaning operation, Smart PC Afzal invokes the native Windows System Restore Provider via WMI / PowerShell (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">Checkpoint-Computer -Description &quot;Smart PC Afzal Pre-Clean Checkpoint&quot;</code>). If any issue occurs, you can roll back your system settings in Windows System Properties at any time.
        </p>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Windows System Protection is actively configured on Volume C: (NVMe OS)</span>
          </div>
          <button
            onClick={onOpenCreateRestorePoint}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Create New Checkpoint Now
          </button>
        </div>
      </div>

      {/* Excluded File Extensions */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          System Binary Whitelist (Permanent Exclusions)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The following executable, driver, and system extension types are unconditionally skipped by the cleaning engine, regardless of folder location:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {excludedExtensions.map((ext) => (
            <div
              key={ext}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              {ext}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
