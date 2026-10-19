import React, { useState } from 'react';
import { 
  DownloadCloud, 
  FileCode, 
  PackageCheck, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  FolderDown, 
  Check, 
  ShieldCheck, 
  Cpu, 
  HardDrive,
  FileText,
  FileCheck
} from 'lucide-react';
import { ALL_SOURCE_FILES, SourceFile } from '../services/sourceCodeRepository';
import { 
  generateFullOfflinePackage, 
  generateStandaloneExeInstaller, 
  triggerDownload, 
  triggerTextDownload 
} from '../services/nativePackageBuilder';

export const OfflineInstallerHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(ALL_SOURCE_FILES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBuildingPackage, setIsBuildingPackage] = useState(false);
  const [isBuildingExe, setIsBuildingExe] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadFullZip = async () => {
    setIsBuildingPackage(true);
    try {
      const blob = await generateFullOfflinePackage();
      triggerDownload(blob, 'SmartPCAfzal-Complete-Windows-Suite.zip');
    } catch (e) {
      console.error(e);
    } finally {
      setIsBuildingPackage(false);
    }
  };

  const handleDownloadExeInstaller = async () => {
    setIsBuildingExe(true);
    try {
      const blob = await generateStandaloneExeInstaller();
      triggerDownload(blob, 'SmartPCCleaner-Setup.exe');
    } catch (e) {
      console.error(e);
    } finally {
      setIsBuildingExe(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Installer Card Banner */}
      <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Offline Windows 10 & 11 Deployment
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              100% Offline · No Activation Needed
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Standalone Offline Installer & Source Code Hub
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Download the pre-packaged offline executable installer (<code className="font-mono bg-blue-100/60 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-800 dark:text-blue-300">SmartPCCleaner-Setup.exe</code>), native Inno Setup / WiX MSI packaging scripts, or the full C# .NET WPF source solution ready to run on any USB or local disk without internet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadExeInstaller}
            disabled={isBuildingExe}
            className="px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>{isBuildingExe ? 'Packing Installer...' : 'Download SmartPCCleaner-Setup.exe'}</span>
          </button>

          <button
            onClick={handleDownloadFullZip}
            disabled={isBuildingPackage}
            className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <FolderDown className="w-4 h-4 text-emerald-500" />
            <span>{isBuildingPackage ? 'Bundling Suite...' : 'Download Complete Suite (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Package Specs Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Target Platform</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Windows 10 / 11 (64-bit)</div>
          <div className="text-[11px] text-slate-400 mt-1">x64 architecture native</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deployment Model</div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">100% Standalone Offline</div>
          <div className="text-[11px] text-slate-400 mt-1">Zero internet dependency</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Integration Support</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Inno Setup + WiX MSI</div>
          <div className="text-[11px] text-slate-400 mt-1">Start Menu & Uninstaller</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Publisher & Version</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">Afzal Software · v1.0.0.0</div>
          <div className="text-[11px] text-slate-400 mt-1">Permanent offline license</div>
        </div>
      </div>

      {/* Interactive Code & Script Viewer */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Source Code, Packaging Scripts & Documentation Explorer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse, inspect, copy, or download any of the included Windows desktop project files.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerTextDownload(selectedFile.content, selectedFile.filename)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-blue-500" />
              <span>Download {selectedFile.filename}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Content'}</span>
            </button>
          </div>
        </div>

        {/* File Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100 dark:border-slate-800">
          {ALL_SOURCE_FILES.map((file) => {
            const isSelected = selectedFile.filename === file.filename;
            return (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`px-3 py-1.5 rounded-t-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-blue-400 border-t-2 border-blue-500'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 opacity-70" />
                <span>{file.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Active File Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-mono text-[11px]">{selectedFile.path}</span>
          <span>{selectedFile.description}</span>
        </div>

        {/* Code Content Container */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs">
          <pre className="p-4 overflow-x-auto max-h-96 leading-relaxed select-text">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
