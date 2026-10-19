/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_JUNK_CATEGORIES, 
  INITIAL_DRIVES, 
  LARGE_FILES_CATALOG, 
  INITIAL_STARTUP_ITEMS, 
  INITIAL_DOWNLOADS_REVIEW, 
  SYSTEM_SPECS, 
  INITIAL_CLEANING_HISTORY,
  formatBytes 
} from './data/mockWindowsData';
import { 
  ActiveTab, 
  JunkCategory, 
  DiskDrive, 
  LargeFileItem, 
  StartupItem, 
  DownloadItem, 
  SystemSpecs, 
  CleaningSessionRecord, 
  ScanLogEntry 
} from './types';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { JunkCleanerView } from './components/JunkCleanerView';
import { DiskAnalyzerView } from './components/DiskAnalyzerView';
import { CleanupToolsView } from './components/CleanupToolsView';
import { SafetyView } from './components/SafetyView';
import { HistoryReportsView } from './components/HistoryReportsView';
import { OfflineInstallerHub } from './components/OfflineInstallerHub';
import { SettingsHelpView } from './components/SettingsHelpView';
import { RecycleBinModal } from './components/RecycleBinModal';
import { RestorePointModal } from './components/RestorePointModal';
import { CleanSummaryModal } from './components/CleanSummaryModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  // Core Data State
  const [categories, setCategories] = useState<JunkCategory[]>(INITIAL_JUNK_CATEGORIES);
  const [drives, setDrives] = useState<DiskDrive[]>(INITIAL_DRIVES);
  const [largeFiles, setLargeFiles] = useState<LargeFileItem[]>(LARGE_FILES_CATALOG);
  const [startupItems, setStartupItems] = useState<StartupItem[]>(INITIAL_STARTUP_ITEMS);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>(INITIAL_DOWNLOADS_REVIEW);
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs>(SYSTEM_SPECS);
  const [history, setHistory] = useState<CleaningSessionRecord[]>(INITIAL_CLEANING_HISTORY);

  // Engine Execution State
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentTaskDescription, setCurrentTaskDescription] = useState('');
  const [lastScanDate, setLastScanDate] = useState('2026-10-19 02:30');

  // Logs
  const [logs, setLogs] = useState<ScanLogEntry[]>([
    {
      id: 'log-1',
      timestamp: '2026-10-19 02:30:11',
      level: 'INFO',
      message: 'Smart PC Afzal engine initialized. 64-bit Windows kernel detected.'
    },
    {
      id: 'log-2',
      timestamp: '2026-10-19 02:30:14',
      level: 'INFO',
      message: 'Loaded strict safety whitelist: .sys, .dll, System32 protected.'
    }
  ]);

  // Modals State
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isRestorePointOpen, setIsRestorePointOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState({
    cleanedBytes: 0,
    filesDeleted: 0,
    filesSkipped: 0,
    durationMs: 0,
    restorePointCreated: false
  });

  const totalJunkBytes = categories.reduce((acc, cat) => acc + cat.sizeBytes, 0);

  // Toggle Category Selection
  const handleToggleCategory = (id: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === id) {
        return { ...cat, selected: !cat.selected };
      }
      return cat;
    }));
  };

  const handleSelectAll = (select: boolean) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      selected: select ? (cat.id !== 'recycle-bin') : false // Recycle bin requires explicit confirmation
    })));
  };

  // Add Log Entry Helper
  const appendLog = (level: 'INFO' | 'SUCCESS' | 'WARN' | 'SKIP', message: string, category?: string) => {
    const newEntry: ScanLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      level,
      message,
      category
    };
    setLogs(prev => [newEntry, ...prev]);
  };

  // 1. Scan Engine Simulation
  const handleStartScan = () => {
    if (isScanning || isCleaning) return;
    setIsScanning(true);
    setProgressPercent(5);
    setCurrentTaskDescription('Initializing Windows file system enumerator...');
    appendLog('INFO', 'Started scanning Windows temporary storage directories...');

    const steps = [
      { pct: 20, desc: 'Scanning User Temporary directory (%TEMP%)...', log: 'Examining C:\\Users\\Afzal\\AppData\\Local\\Temp' },
      { pct: 40, desc: 'Scanning Windows System Temp directory (C:\\Windows\\Temp)...', log: 'Examining C:\\Windows\\Temp leftover update installers' },
      { pct: 60, desc: 'Auditing Windows Explorer Thumbnail Cache database...', log: 'Checking thumbcache_*.db in LocalAppData\\Explorer' },
      { pct: 75, desc: 'Inspecting Windows Error Reporting memory dumps...', log: 'Found 2 crash dumps in C:\\Windows\\WER' },
      { pct: 90, desc: 'Checking file locks against active running processes...', log: 'Verified locks: 13 active files currently in-use will be skipped safely' },
      { pct: 100, desc: 'Scan completed successfully.', log: 'Scan finished. All categories updated.' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const s = steps[currentStep];
        setProgressPercent(s.pct);
        setCurrentTaskDescription(s.desc);
        appendLog('INFO', s.log);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setLastScanDate(nowStr);
        appendLog('SUCCESS', `Scan completed. Total ${formatBytes(totalJunkBytes)} detected across ${categories.length} categories.`);
      }
    }, 450);
  };

  // 2. Clean Engine Simulation
  const handleExecuteClean = (createCheckpoint: boolean) => {
    const selectedCats = categories.filter(c => c.selected && c.sizeBytes > 0);
    if (selectedCats.length === 0) return;

    setIsCleaning(true);
    setProgressPercent(5);
    setCurrentTaskDescription('Preparing safe cleaning environment...');

    if (createCheckpoint) {
      appendLog('INFO', 'Checkpoint-Computer: Created Windows System Restore Point checkpoint.');
    }

    const totalCleanTarget = selectedCats.reduce((acc, c) => acc + c.sizeBytes, 0);
    const totalFiles = selectedCats.reduce((acc, c) => acc + c.fileCount, 0);
    const startTime = Date.now();

    let currentIdx = 0;
    const cleanInterval = setInterval(() => {
      if (currentIdx < selectedCats.length) {
        const cat = selectedCats[currentIdx];
        const pct = Math.round(((currentIdx + 1) / selectedCats.length) * 100);
        setProgressPercent(pct);
        setCurrentTaskDescription(`Purging safe cache: ${cat.name}...`);
        
        appendLog('SUCCESS', `Cleaned ${cat.name}: Freed ${formatBytes(cat.sizeBytes)} (${cat.fileCount} items)`);
        
        if (cat.lockedFilesCount && cat.lockedFilesCount > 0) {
          appendLog('SKIP', `Safely bypassed ${cat.lockedFilesCount} active locked files in ${cat.name}`);
        }
        currentIdx++;
      } else {
        clearInterval(cleanInterval);
        setIsCleaning(false);
        const duration = Date.now() - startTime;
        const skippedCount = selectedCats.reduce((acc, c) => acc + (c.lockedFilesCount || 0), 0);

        // Update categories: zero out cleaned ones
        setCategories(prev => prev.map(c => {
          if (c.selected) {
            return {
              ...c,
              sizeBytes: 0,
              fileCount: c.lockedFilesCount || 0,
              sampleFiles: []
            };
          }
          return c;
        }));

        // Update Drive C: free space
        setDrives(prev => prev.map(d => {
          if (d.isSystemDrive) {
            const newFree = d.freeBytes + totalCleanTarget;
            const newUsed = Math.max(0, d.usedBytes - totalCleanTarget);
            return {
              ...d,
              freeBytes: newFree,
              usedBytes: newUsed,
              breakdown: {
                ...d.breakdown,
                junkBytes: 0
              }
            };
          }
          return d;
        }));

        // Append to cleaning history
        const newRecord: CleaningSessionRecord = {
          id: `clean-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          cleanedBytes: totalCleanTarget,
          filesDeleted: totalFiles,
          filesSkipped: skippedCount,
          durationMs: duration,
          categoriesCleaned: selectedCats.map(c => c.name),
          restorePointCreated: createCheckpoint,
          status: 'Completed'
        };
        setHistory(prev => [newRecord, ...prev]);

        // Show Summary Dialog
        setSummaryData({
          cleanedBytes: totalCleanTarget,
          filesDeleted: totalFiles,
          filesSkipped: skippedCount,
          durationMs: duration,
          restorePointCreated: createCheckpoint
        });
        setIsSummaryOpen(true);

        appendLog('SUCCESS', `Cleaning session finished successfully! Reclaimed ${formatBytes(totalCleanTarget)} free disk space.`);
      }
    }, 550);
  };

  // 3. Confirm Empty Recycle Bin
  const handleConfirmEmptyRecycleBin = () => {
    const rbCat = categories.find(c => c.id === 'recycle-bin');
    if (!rbCat) return;

    const rbSize = rbCat.sizeBytes;
    appendLog('SUCCESS', `SHEmptyRecycleBin: Windows Recycle Bin emptied (+${formatBytes(rbSize)} freed).`);

    setCategories(prev => prev.map(c => {
      if (c.id === 'recycle-bin') {
        return {
          ...c,
          sizeBytes: 0,
          fileCount: 0,
          sampleFiles: []
        };
      }
      return c;
    }));

    // Update system drive
    setDrives(prev => prev.map(d => {
      if (d.isSystemDrive) {
        return {
          ...d,
          freeBytes: d.freeBytes + rbSize,
          usedBytes: d.usedBytes - rbSize
        };
      }
      return d;
    }));
  };

  // 4. Create Restore Point Checkpoint
  const handleCreateRestorePoint = (description: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setSystemSpecs(prev => ({
      ...prev,
      lastRestorePoint: `${nowStr} (${description})`
    }));
    appendLog('SUCCESS', `Windows System Protection checkpoint created: "${description}"`);
  };

  // 5. Toggle Startup Item
  const handleToggleStartupItem = (id: string) => {
    setStartupItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = !item.enabled;
        appendLog('INFO', `Startup entry "${item.name}" set to ${updated ? 'ENABLED' : 'DISABLED'} in registry.`);
        return { ...item, enabled: updated };
      }
      return item;
    }));
  };

  // 6. Toggle and Delete Downloads
  const handleToggleDownloadItem = (id: string) => {
    setDownloadItems(prev => prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  };

  const handleDeleteSelectedDownloads = () => {
    const toDelete = downloadItems.filter(d => d.selected);
    const freed = toDelete.reduce((acc, d) => acc + d.sizeBytes, 0);

    setDownloadItems(prev => prev.filter(d => !d.selected));
    appendLog('SUCCESS', `Deleted ${toDelete.length} selected stale download files (+${formatBytes(freed)} freed).`);

    setDrives(prev => prev.map(d => {
      if (d.isSystemDrive) {
        return {
          ...d,
          freeBytes: d.freeBytes + freed,
          usedBytes: d.usedBytes - freed
        };
      }
      return d;
    }));
  };

  const recycleBinCategory = categories.find(c => c.id === 'recycle-bin') || categories[0];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Windows 11 Title Bar */}
      <TitleBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onQuickScan={() => {
          setActiveTab('cleaner');
          handleStartScan();
        }}
        isScanning={isScanning}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          junkTotalDisplay={totalJunkBytes > 0 ? formatBytes(totalJunkBytes) : ''}
          darkMode={darkMode}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              categories={categories}
              drives={drives}
              history={history}
              onStartScan={() => {
                setActiveTab('cleaner');
                handleStartScan();
              }}
              onNavigateToCleaner={() => setActiveTab('cleaner')}
              onNavigateToDiskAnalyzer={() => setActiveTab('disk-analyzer')}
              onNavigateToInstaller={() => setActiveTab('installer')}
              isScanning={isScanning}
              lastScanDate={lastScanDate}
            />
          )}

          {activeTab === 'cleaner' && (
            <JunkCleanerView
              categories={categories}
              onToggleCategory={handleToggleCategory}
              onSelectAll={handleSelectAll}
              onStartScan={handleStartScan}
              onExecuteClean={handleExecuteClean}
              onOpenRecycleBinModal={() => setIsRecycleBinOpen(true)}
              isScanning={isScanning}
              isCleaning={isCleaning}
              progressPercent={progressPercent}
              currentTaskDescription={currentTaskDescription}
              logs={logs}
            />
          )}

          {activeTab === 'disk-analyzer' && (
            <DiskAnalyzerView
              drives={drives}
              largeFiles={largeFiles}
            />
          )}

          {activeTab === 'tools' && (
            <CleanupToolsView
              startupItems={startupItems}
              onToggleStartupItem={handleToggleStartupItem}
              downloadItems={downloadItems}
              onToggleDownloadItem={handleToggleDownloadItem}
              onDeleteSelectedDownloads={handleDeleteSelectedDownloads}
              systemSpecs={systemSpecs}
            />
          )}

          {activeTab === 'safety' && (
            <SafetyView
              onOpenCreateRestorePoint={() => setIsRestorePointOpen(true)}
              lastRestorePoint={systemSpecs.lastRestorePoint}
            />
          )}

          {activeTab === 'history' && (
            <HistoryReportsView
              history={history}
              onClearHistory={() => setHistory([])}
            />
          )}

          {activeTab === 'installer' && (
            <OfflineInstallerHub />
          )}

          {activeTab === 'settings' && (
            <SettingsHelpView
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <RecycleBinModal
        isOpen={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        recycleBinCategory={recycleBinCategory}
        onConfirmEmpty={handleConfirmEmptyRecycleBin}
      />

      <RestorePointModal
        isOpen={isRestorePointOpen}
        onClose={() => setIsRestorePointOpen(false)}
        onCreated={handleCreateRestorePoint}
      />

      <CleanSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => {
          setIsSummaryOpen(false);
          setActiveTab('dashboard');
        }}
        cleanedBytes={summaryData.cleanedBytes}
        filesDeleted={summaryData.filesDeleted}
        filesSkipped={summaryData.filesSkipped}
        durationMs={summaryData.durationMs}
        restorePointCreated={summaryData.restorePointCreated}
      />
    </div>
  );
}
