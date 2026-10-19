import React, { useState } from 'react';
import { 
  Wrench, 
  Download, 
  Play, 
  Cpu, 
  HardDrive, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  Trash2,
  Calendar,
  Layers,
  Shield
} from 'lucide-react';
import { StartupItem, DownloadItem, SystemSpecs } from '../types';
import { formatBytes } from '../data/mockWindowsData';

interface CleanupToolsViewProps {
  startupItems: StartupItem[];
  onToggleStartupItem: (id: string) => void;
  downloadItems: DownloadItem[];
  onToggleDownloadItem: (id: string) => void;
  onDeleteSelectedDownloads: () => void;
  systemSpecs: SystemSpecs;
}

export const CleanupToolsView: React.FC<CleanupToolsViewProps> = ({
  startupItems,
  onToggleStartupItem,
  downloadItems,
  onToggleDownloadItem,
  onDeleteSelectedDownloads,
  systemSpecs
}) => {
  const [subTab, setSubTab] = useState<'disk-cleanup' | 'downloads' | 'startup' | 'sysinfo'>('disk-cleanup');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const selectedDownloadsCount = downloadItems.filter(d => d.selected).length;
  const selectedDownloadsBytes = downloadItems
    .filter(d => d.selected)
    .reduce((acc, d) => acc + d.sizeBytes, 0);

  const handleCopyCleanmgr = () => {
    navigator.clipboard.writeText('cleanmgr.exe /sageset:1');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg w-fit border border-slate-200 dark:border-slate-700/60">
        <button
          onClick={() => setSubTab('disk-cleanup')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            subTab === 'disk-cleanup'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Windows Disk Cleanup
        </button>
        <button
          onClick={() => setSubTab('downloads')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            subTab === 'downloads'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Downloads Review
        </button>
        <button
          onClick={() => setSubTab('startup')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            subTab === 'startup'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Startup Programs
        </button>
        <button
          onClick={() => setSubTab('sysinfo')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            subTab === 'sysinfo'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          System Information
        </button>
      </div>

      {/* 1. Windows Native Disk Cleanup Tool Launcher */}
      {subTab === 'disk-cleanup' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Windows Native Disk Cleanup Launcher (cleanmgr.exe)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Microsoft Windows includes a built-in maintenance utility (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">cleanmgr.exe</code>) to safely prune Windows Update component stores, system memory dumps, and offline webpages.
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Direct Command Launcher
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="cleanmgr.exe /sageset:1"
                className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleCopyCleanmgr}
                className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedCmd ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">Win + R</kbd>, paste the command, and press Enter to open Microsoft Windows Disk Cleanup dialog.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Windows Update Cleanup
              </div>
              <div className="text-[11px] text-slate-500">
                Removes redundant previous versions of patched system files from WinSxS directory.
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Delivery Optimization Files
              </div>
              <div className="text-[11px] text-slate-500">
                Clears downloaded staging files used for peer-to-peer Windows updates.
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                DirectX Shader Cache
              </div>
              <div className="text-[11px] text-slate-500">
                Cleans stale graphics shader caches to resolve display glitches in games and apps.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Downloads Folder Review Tool */}
      {subTab === 'downloads' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Downloads Folder Auditor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review stale downloads and duplicate installers. Never deletes files automatically.
              </p>
            </div>

            {selectedDownloadsBytes > 0 && (
              <button
                onClick={onDeleteSelectedDownloads}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Selected ({formatBytes(selectedDownloadsBytes)})</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8">Select</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Age</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {downloadItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => onToggleDownloadItem(item.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      <div className="truncate max-w-xs">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.path}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {item.daysOld} days ago
                    </td>
                    <td className="py-2.5 px-3">
                      {item.isDuplicate ? (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Duplicate Installer</span>
                      ) : item.isInstaller ? (
                        <span className="text-[11px] text-blue-600 dark:text-blue-400">Installer</span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Document</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatBytes(item.sizeBytes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Startup Programs Inspector */}
      {subTab === 'startup' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Windows Startup Programs Manager
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Disable non-essential startup background tasks to reduce Windows boot latency.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {startupItems.filter(s => s.enabled).length} enabled / {startupItems.length} registered
            </span>
          </div>

          <div className="space-y-2.5">
            {startupItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({item.publisher})
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      item.impact === 'High' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' :
                      item.impact === 'Medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' :
                      'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                    }`}>
                      {item.impact} Impact (~{item.estimatedDelaySeconds}s delay)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 line-clamp-1">
                    {item.description}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {item.location} · {item.command}
                  </div>
                </div>

                <button
                  onClick={() => onToggleStartupItem(item.id)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded transition-colors"
                >
                  {item.enabled ? (
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <ToggleRight className="w-5 h-5 text-blue-600" />
                      <span>Enabled</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span>Disabled</span>
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. System Information Specs */}
      {subTab === 'sysinfo' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Windows Hardware & System Specifications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live device specifications collected via Windows API & WMI provider
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Operating System</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">OS Edition:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{systemSpecs.osName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Version & Build:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{systemSpecs.osVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Architecture:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{systemSpecs.architecture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Provider:</span>
                  <span className="text-emerald-500 font-medium">Windows Defender Active</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Processor & Memory</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Processor:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]" title={systemSpecs.processor}>
                    {systemSpecs.processor}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Installed RAM:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{systemSpecs.installedRamGB} GB DDR5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BIOS / Firmware:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{systemSpecs.biosMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active System Uptime:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{systemSpecs.uptimeHours} Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
