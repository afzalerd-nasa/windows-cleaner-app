export type ActiveTab = 
  | 'dashboard'
  | 'cleaner'
  | 'disk-analyzer'
  | 'tools'
  | 'safety'
  | 'history'
  | 'installer'
  | 'settings';

export interface JunkCategory {
  id: string;
  name: string;
  description: string;
  path: string;
  sizeBytes: number;
  fileCount: number;
  selected: boolean;
  isSafe: boolean;
  requiresConfirmation?: boolean;
  iconName: string;
  lockedFilesCount?: number;
  sampleFiles: {
    name: string;
    path: string;
    sizeBytes: number;
    isLocked?: boolean;
    dateModified: string;
  }[];
}

export interface DiskDrive {
  letter: string;
  name: string;
  type: 'SSD' | 'HDD' | 'NVMe';
  fileSystem: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  isSystemDrive: boolean;
  breakdown: {
    systemBytes: number;
    appsBytes: number;
    mediaBytes: number;
    documentsBytes: number;
    junkBytes: number;
    otherBytes: number;
  };
}

export interface LargeFileItem {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  extension: string;
  category: 'Video' | 'Archive' | 'Installer' | 'Virtual Disk' | 'Database' | 'Document';
  dateModified: string;
  drive: string;
  isProtected?: boolean;
}

export interface StartupItem {
  id: string;
  name: string;
  publisher: string;
  command: string;
  location: 'HKCU\\Run' | 'HKLM\\Run' | 'Startup Folder';
  impact: 'High' | 'Medium' | 'Low' | 'None';
  enabled: boolean;
  estimatedDelaySeconds: number;
  description: string;
}

export interface DownloadItem {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  extension: string;
  dateDownloaded: string;
  daysOld: number;
  isInstaller: boolean;
  isDuplicate: boolean;
  selected: boolean;
}

export interface SystemSpecs {
  osName: string;
  osVersion: string;
  buildNumber: string;
  architecture: string;
  processor: string;
  installedRamGB: number;
  availableRamGB: number;
  systemModel: string;
  biosMode: string;
  uptimeHours: number;
  antivirusStatus: string;
  lastRestorePoint: string;
}

export interface CleaningSessionRecord {
  id: string;
  timestamp: string;
  cleanedBytes: number;
  filesDeleted: number;
  filesSkipped: number;
  durationMs: number;
  categoriesCleaned: string[];
  restorePointCreated: boolean;
  status: 'Completed' | 'Completed with warnings';
}

export interface ScanLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'SKIP';
  message: string;
  category?: string;
  filePath?: string;
}
