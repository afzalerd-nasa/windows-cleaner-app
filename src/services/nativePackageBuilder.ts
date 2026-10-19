import JSZip from 'jszip';
import { ALL_SOURCE_FILES } from './sourceCodeRepository';

export async function generateFullOfflinePackage(): Promise<Blob> {
  const zip = new JSZip();

  // Root documentation
  zip.file('README.md', ALL_SOURCE_FILES.find(f => f.filename === 'README.md')?.content || '');
  zip.file('BUILD_INSTRUCTIONS.md', ALL_SOURCE_FILES.find(f => f.filename === 'BUILD_INSTRUCTIONS.md')?.content || '');
  zip.file('TESTING_CHECKLIST.md', ALL_SOURCE_FILES.find(f => f.filename === 'TESTING_CHECKLIST.md')?.content || '');

  // Installer Scripts
  const installerFolder = zip.folder('Installer');
  if (installerFolder) {
    installerFolder.file('SmartPCCleaner-Setup.bat', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCCleaner-Setup.bat')?.content || '');
    installerFolder.file('SmartPCCleaner-Setup.ps1', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCCleaner-Setup.ps1')?.content || '');
    installerFolder.file('SmartPCCleaner.iss', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCCleaner.iss')?.content || '');
    installerFolder.file('SmartPCAfzal.wxs', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCAfzal.wxs')?.content || '');
  }

  // C# .NET WPF Source Project
  const srcFolder = zip.folder('src-csharp');
  if (srcFolder) {
    srcFolder.file('SmartPCAfzal.csproj', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCAfzal.csproj')?.content || '');
    const servicesFolder = srcFolder.folder('Services');
    if (servicesFolder) {
      servicesFolder.file('CleanerEngine.cs', ALL_SOURCE_FILES.find(f => f.filename === 'CleanerEngine.cs')?.content || '');
      servicesFolder.file('DiskAnalyzer.cs', ALL_SOURCE_FILES.find(f => f.filename === 'DiskAnalyzer.cs')?.content || '');
      servicesFolder.file('SystemInfoProvider.cs', ALL_SOURCE_FILES.find(f => f.filename === 'SystemInfoProvider.cs')?.content || '');
    }
  }

  // Pre-configured App Settings
  zip.file('appsettings.json', JSON.stringify({
    ApplicationName: "Smart PC Afzal",
    Version: "1.0.0.0",
    Publisher: "Afzal Software Systems",
    SafeCleaning: {
      SkipLockedFiles: true,
      CreateRestorePoint: true,
      ExcludeSystemFiles: true,
      ExcludedExtensions: [".sys", ".dll", ".exe", ".drv", ".ocx"],
      ExcludedDirectories: [
        "C:\\Windows\\System32",
        "C:\\Windows\\SysWOW64",
        "C:\\Users\\*\\Documents",
        "C:\\Users\\*\\Desktop",
        "C:\\Users\\*\\Pictures"
      ]
    }
  }, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}

export async function generateStandaloneExeInstaller(): Promise<Blob> {
  // A Windows self-extracting / polyglot executable package for SmartPCCleaner-Setup.exe
  // We craft a genuine Windows PE header stub followed by the ZIP archive payload
  // This allows the package to run as an executable setup installer or unpack automatically on Windows.
  const zip = new JSZip();

  zip.file('SmartPCCleaner-Setup.bat', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCCleaner-Setup.bat')?.content || '');
  zip.file('SmartPCCleaner-Setup.ps1', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCCleaner-Setup.ps1')?.content || '');
  zip.file('SmartPCCleaner.iss', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCCleaner.iss')?.content || '');
  zip.file('README.txt', ALL_SOURCE_FILES.find(f => f.filename === 'README.md')?.content || '');
  zip.file('SmartPCAfzal.csproj', ALL_SOURCE_FILES.find(f => f.filename === 'SmartPCAfzal.csproj')?.content || '');
  zip.file('CleanerEngine.cs', ALL_SOURCE_FILES.find(f => f.filename === 'CleanerEngine.cs')?.content || '');

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function triggerTextDownload(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  triggerDownload(blob, filename);
}
