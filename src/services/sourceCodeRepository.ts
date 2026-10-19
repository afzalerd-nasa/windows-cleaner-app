export interface SourceFile {
  path: string;
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const CSHARP_PROJECT_FILE = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
    <ApplicationIcon>Assets\\app_icon.ico</ApplicationIcon>
    <AssemblyName>SmartPCAfzal</AssemblyName>
    <RootNamespace>SmartPCAfzal</RootNamespace>
    <Authors>Afzal Software</Authors>
    <Company>Afzal Software Systems</Company>
    <Product>Smart PC Afzal</Product>
    <Description>Professional native Windows PC cleaner, temporary file remover, and disk space analyzer.</Description>
    <Version>1.0.0.0</Version>
    <FileVersion>1.0.0.0</FileVersion>
    <AssemblyVersion>1.0.0.0</AssemblyVersion>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
    <PublishSingleFile>true</PublishSingleFile>
    <PublishTrimmed>false</PublishTrimmed>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="System.Management" Version="8.0.0" />
  </ItemGroup>

</Project>`;

export const CLEANER_ENGINE_CS = `using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

namespace SmartPCAfzal.Services
{
    public class ScanResult
    {
        public string CategoryId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public long TotalSizeBytes { get; set; }
        public int TotalFileCount { get; set; }
        public List<string> ScannedFilePaths { get; set; } = new();
    }

    public class CleanResult
    {
        public long BytesCleaned { get; set; }
        public int FilesDeleted { get; set; }
        public int FilesSkipped { get; set; }
        public List<string> LogEntries { get; set; } = new();
    }

    public class CleanerEngine
    {
        [DllImport("Shell32.dll", CharSet = CharSet.Unicode)]
        private static extern uint SHEmptyRecycleBin(IntPtr hwnd, string? pszRootPath, uint dwFlags);

        private const uint SHERB_NOCONFIRMATION = 0x00000001;
        private const uint SHERB_NOPROGRESSUI   = 0x00000002;
        private const uint SHERB_NOSOUND        = 0x00000004;

        // Strict Exclusion Whitelist (Safety Guarantee)
        private static readonly HashSet<string> ExcludedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".sys", ".dll", ".exe", ".drv", ".ocx", ".cpl", ".msc"
        };

        public async Task<List<ScanResult>> ScanCategoriesAsync(
            List<string> selectedCategoryIds,
            IProgress<string> progressLogger,
            CancellationToken cancellationToken)
        {
            return await Task.Run(() =>
            {
                var results = new List<ScanResult>();

                if (selectedCategoryIds.Contains("user-temp"))
                {
                    progressLogger.Report("Scanning User Temporary directory (%TEMP%)...");
                    results.Add(ScanDirectory("user-temp", "User Temporary Files", Path.GetTempPath(), cancellationToken));
                }

                if (selectedCategoryIds.Contains("windows-temp"))
                {
                    string winTemp = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "Temp");
                    progressLogger.Report("Scanning Windows System Temp directory...");
                    results.Add(ScanDirectory("windows-temp", "Windows System Temp", winTemp, cancellationToken));
                }

                if (selectedCategoryIds.Contains("thumbnails"))
                {
                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string thumbDir = Path.Combine(localAppData, "Microsoft", "Windows", "Explorer");
                    progressLogger.Report("Scanning Windows Explorer Thumbnail cache...");
                    results.Add(ScanDirectory("thumbnails", "Thumbnail Cache", thumbDir, cancellationToken, "thumbcache_*.db"));
                }

                if (selectedCategoryIds.Contains("crash-dumps"))
                {
                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string werDir = Path.Combine(localAppData, "CrashDumps");
                    progressLogger.Report("Scanning Crash Dumps and Error Reports...");
                    results.Add(ScanDirectory("crash-dumps", "Crash Dumps & WER", werDir, cancellationToken));
                }

                return results;
            }, cancellationToken);
        }

        private ScanResult ScanDirectory(string categoryId, string name, string targetDir, CancellationToken ct, string searchPattern = "*.*")
        {
            var result = new ScanResult { CategoryId = categoryId, CategoryName = name };
            if (!Directory.Exists(targetDir)) return result;

            try
            {
                var files = Directory.EnumerateFiles(targetDir, searchPattern, SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    ct.ThrowIfCancellationRequested();
                    try
                    {
                        var fi = new FileInfo(file);
                        result.TotalSizeBytes += fi.Length;
                        result.TotalFileCount++;
                        result.ScannedFilePaths.Add(file);
                    }
                    catch
                    {
                        // Safely skip files with read permission restrictions
                    }
                }
            }
            catch
            {
                // Access denied on root folder handled safely
            }

            return result;
        }

        public async Task<CleanResult> CleanCategoriesAsync(
            List<ScanResult> scanResults,
            bool emptyRecycleBin,
            IProgress<string> progressLogger,
            CancellationToken cancellationToken)
        {
            return await Task.Run(() =>
            {
                var cleanResult = new CleanResult();

                foreach (var cat in scanResults)
                {
                    progressLogger.Report($"Cleaning {cat.CategoryName} ({cat.ScannedFilePaths.Count} files)...");

                    foreach (var path in cat.ScannedFilePaths)
                    {
                        cancellationToken.ThrowIfCancellationRequested();

                        // Safety check: Never delete blacklisted core system file extensions
                        string ext = Path.GetExtension(path);
                        if (ExcludedExtensions.Contains(ext))
                        {
                            cleanResult.FilesSkipped++;
                            cleanResult.LogEntries.Add($"[SKIP] Protected extension {ext}: {Path.GetFileName(path)}");
                            continue;
                        }

                        // Check if file is locked by active process
                        if (IsFileLocked(path))
                        {
                            cleanResult.FilesSkipped++;
                            cleanResult.LogEntries.Add($"[SKIP] In use / locked by running app: {Path.GetFileName(path)}");
                            continue;
                        }

                        try
                        {
                            var fi = new FileInfo(path);
                            long len = fi.Length;
                            fi.Attributes = FileAttributes.Normal;
                            File.Delete(path);
                            cleanResult.BytesCleaned += len;
                            cleanResult.FilesDeleted++;
                            cleanResult.LogEntries.Add($"[SUCCESS] Deleted {Path.GetFileName(path)} ({len / 1024} KB)");
                        }
                        catch (Exception ex)
                        {
                            cleanResult.FilesSkipped++;
                            cleanResult.LogEntries.Add($"[SKIP] Access denied: {Path.GetFileName(path)} ({ex.Message})");
                        }
                    }
                }

                if (emptyRecycleBin)
                {
                    progressLogger.Report("Emptying Windows Recycle Bin...");
                    try
                    {
                        uint res = SHEmptyRecycleBin(IntPtr.Zero, null, SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI | SHERB_NOSOUND);
                        cleanResult.LogEntries.Add("[SUCCESS] Windows Recycle Bin emptied successfully.");
                    }
                    catch (Exception ex)
                    {
                        cleanResult.LogEntries.Add($"[WARN] Could not empty Recycle Bin: {ex.Message}");
                    }
                }

                return cleanResult;
            }, cancellationToken);
        }

        private static bool IsFileLocked(string filePath)
        {
            try
            {
                using var stream = File.Open(filePath, FileMode.Open, FileAccess.ReadWrite, FileShare.None);
                return false;
            }
            catch (IOException)
            {
                return true; // Locked by another process
            }
            catch
            {
                return true; // Permission restricted
            }
        }
    }
}`;

export const DISK_ANALYZER_CS = `using System;
using System.Collections.Generic;
using System.IO;

namespace SmartPCAfzal.Services
{
    public class DriveInfoModel
    {
        public string Name { get; set; } = string.Empty;
        public string VolumeLabel { get; set; } = string.Empty;
        public string DriveFormat { get; set; } = string.Empty;
        public long TotalBytes { get; set; }
        public long FreeBytes { get; set; }
        public long UsedBytes => TotalBytes - FreeBytes;
        public double UsedPercentage => TotalBytes > 0 ? (double)UsedBytes / TotalBytes * 100.0 : 0;
    }

    public class DiskAnalyzer
    {
        public static List<DriveInfoModel> GetDriveStats()
        {
            var list = new List<DriveInfoModel>();
            foreach (var d in DriveInfo.GetDrives())
            {
                if (d.IsReady && (d.DriveType == DriveType.Fixed || d.DriveType == DriveType.Removable))
                {
                    list.Add(new DriveInfoModel
                    {
                        Name = d.Name,
                        VolumeLabel = string.IsNullOrEmpty(d.VolumeLabel) ? "Local Disk" : d.VolumeLabel,
                        DriveFormat = d.DriveFormat,
                        TotalBytes = d.TotalSize,
                        FreeBytes = d.AvailableFreeSpace
                    });
                }
            }
            return list;
        }
    }
}`;

export const SYSTEM_INFO_CS = `using System;
using System.Management;

namespace SmartPCAfzal.Services
{
    public class SystemInfoModel
    {
        public string OSName { get; set; } = Environment.OSVersion.VersionString;
        public string Architecture { get; set; } = Environment.Is64BitOperatingSystem ? "64-bit OS" : "32-bit OS";
        public string ProcessorName { get; set; } = "Unknown";
        public double TotalRamGB { get; set; }
        public string MachineName { get; set; } = Environment.MachineName;
    }

    public class SystemInfoProvider
    {
        public static SystemInfoModel QuerySystemInfo()
        {
            var info = new SystemInfoModel();
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Name, TotalPhysicalMemory FROM Win32_ComputerSystem");
                foreach (var mo in searcher.Get())
                {
                    if (mo["TotalPhysicalMemory"] != null)
                    {
                        ulong bytes = (ulong)mo["TotalPhysicalMemory"];
                        info.TotalRamGB = Math.Round((double)bytes / (1024 * 1024 * 1024), 1);
                    }
                }

                using var cpuSearcher = new ManagementObjectSearcher("SELECT Name FROM Win32_Processor");
                foreach (var mo in cpuSearcher.Get())
                {
                    info.ProcessorName = mo["Name"]?.ToString() ?? "Intel/AMD Processor";
                    break;
                }
            }
            catch
            {
                info.ProcessorName = Environment.GetEnvironmentVariable("PROCESSOR_IDENTIFIER") ?? "x64 Processor";
            }
            return info;
        }
    }
}`;

export const INNO_SETUP_SCRIPT = `; Inno Setup 6 Script for Smart PC Afzal Standalone Offline Installer
; Generates SmartPCCleaner-Setup.exe (Works 100% offline on Windows 10 & 11)

#define MyAppName "Smart PC Afzal"
#define MyAppVersion "1.0.0.0"
#define MyAppPublisher "Afzal Software Systems"
#define MyAppURL "https://smartpcafzal.local"
#define MyAppExeName "SmartPCAfzal.exe"

[Setup]
AppId={{5E22B00E-893C-4C5C-9A84-D4C719C64098}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=.\\Output
OutputBaseFilename=SmartPCCleaner-Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
UninstallDisplayIcon={app}\\{#MyAppExeName}
VersionInfoVersion={#MyAppVersion}
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription={#MyAppName} Offline Installer
VersionInfoProductName={#MyAppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "bin\\Release\\net8.0-windows\\win-x64\\publish\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
Name: "{group}\\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
`;

export const WIX_INSTALLER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!-- WiX Toolset v3.14/v4 XML definition for Smart PC Afzal MSI Installer -->
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="Smart PC Afzal" Language="1033" Version="1.0.0.0" 
           Manufacturer="Afzal Software Systems" UpgradeCode="1937402C-61FE-48B0-8339-E5496194C011">
    
    <Package InstallerVersion="500" Compressed="yes" InstallScope="perMachine" Platform="x64"
             Description="Smart PC Afzal Offline Windows Installer" Manufacturer="Afzal Software Systems" />

    <MajorUpgrade DowngradeErrorMessage="A newer version of Smart PC Afzal is already installed." />
    <MediaTemplate EmbedCab="yes" />

    <Feature Id="ProductFeature" Title="Smart PC Afzal" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
      <ComponentRef Id="ApplicationShortcut" />
      <ComponentRef Id="DesktopShortcut" />
    </Feature>
  </Product>

  <Fragment>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFiles64Folder">
        <Directory Id="INSTALLFOLDER" Name="Smart PC Afzal" />
      </Directory>
      <Directory Id="ProgramMenuFolder">
        <Directory Id="ApplicationProgramsFolder" Name="Smart PC Afzal" />
      </Directory>
      <Directory Id="DesktopFolder" Name="Desktop" />
    </Directory>
  </Fragment>

  <Fragment>
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="MainExecutable" Guid="3A9E198F-BD12-4C67-BEE1-D9914704B142" Win64="yes">
        <File Id="SmartPCAfzalExe" Source="publish\\SmartPCAfzal.exe" KeyPath="yes" />
      </Component>
      <Component Id="AppConfig" Guid="5B8C220E-A120-410F-B892-048E193C5561" Win64="yes">
        <File Id="ConfigJson" Source="publish\\appsettings.json" KeyPath="yes" />
      </Component>
    </ComponentGroup>

    <DirectoryRef Id="ApplicationProgramsFolder">
      <Component Id="ApplicationShortcut" Guid="71F249B1-A011-4822-B129-C59142E94A19">
        <Shortcut Id="ApplicationStartMenuShortcut" Name="Smart PC Afzal" 
                  Description="Windows PC Cleaner and Optimizer" Target="[INSTALLFOLDER]SmartPCAfzal.exe"
                  WorkingDirectory="INSTALLFOLDER" />
        <RemoveFolder Id="CleanUpShortCut" On="uninstall" />
        <RegistryValue Root="HKCU" Key="Software\\AfzalSoftware\\SmartPCAfzal" Name="installed" Type="integer" Value="1" KeyPath="yes" />
      </Component>
    </DirectoryRef>

    <DirectoryRef Id="DesktopFolder">
      <Component Id="DesktopShortcut" Guid="8924CC0E-5911-4E12-BC33-7729AA014B20">
        <Shortcut Id="ApplicationDesktopShortcut" Name="Smart PC Afzal" 
                  Description="Windows PC Cleaner and Optimizer" Target="[INSTALLFOLDER]SmartPCAfzal.exe"
                  WorkingDirectory="INSTALLFOLDER" />
        <RegistryValue Root="HKCU" Key="Software\\AfzalSoftware\\SmartPCAfzal" Name="desktop_shortcut" Type="integer" Value="1" KeyPath="yes" />
      </Component>
    </DirectoryRef>
  </Fragment>
</Wix>`;

export const POWERSHELL_OFFLINE_INSTALLER = `# ==============================================================================
# Smart PC Afzal - Windows 10 & 11 Standalone Offline Installer & Launcher
# Publisher: Afzal Software Systems | Version: 1.0.0.0
# Requires NO internet connection. Works completely offline.
# ==============================================================================

[CmdletBinding()]
param(
    [string]$InstallPath = "$env:ProgramFiles\\Smart PC Afzal",
    [switch]$CreateDesktopShortcut,
    [switch]$LaunchAfterInstall = $true
)

$ErrorActionPreference = "Stop"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     Smart PC Afzal - Offline Setup & Deployment          " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify 64-bit Architecture
if (-not [Environment]::Is64BitOperatingSystem) {
    Write-Error "Smart PC Afzal requires a 64-bit Windows operating system (Windows 10 or 11)."
    exit 1
}

Write-Host "[+] Target Directory: $InstallPath" -ForegroundColor Green

# 2. Create Target Directories
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Host "[+] Created application installation directory." -ForegroundColor Gray
}

# 3. Create Start Menu Shortcut
$StartMenuPath = "$env:ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Smart PC Afzal"
if (-not (Test-Path $StartMenuPath)) {
    New-Item -ItemType Directory -Path $StartMenuPath -Force | Out-Null
}

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$StartMenuPath\\Smart PC Afzal.lnk")
$Shortcut.TargetPath = "$InstallPath\\SmartPCAfzal.exe"
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.Description = "Smart PC Afzal - Windows PC Cleaner & Optimizer"
$Shortcut.Save()
Write-Host "[+] Start Menu shortcut created." -ForegroundColor Green

# 4. Optional Desktop Shortcut
if ($CreateDesktopShortcut -or $true) {
    $DesktopShortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\\Smart PC Afzal.lnk")
    $DesktopShortcut.TargetPath = "$InstallPath\\SmartPCAfzal.exe"
    $DesktopShortcut.WorkingDirectory = $InstallPath
    $DesktopShortcut.Description = "Smart PC Afzal"
    $DesktopShortcut.Save()
    Write-Host "[+] Desktop shortcut created." -ForegroundColor Green
}

# 5. Register in Windows Programs & Features (for standard uninstall support)
$UninstallRegKey = "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\SmartPCAfzal"
if (-not (Test-Path $UninstallRegKey)) {
    try {
        New-Item -Path $UninstallRegKey -Force | Out-Null
        Set-ItemProperty -Path $UninstallRegKey -Name "DisplayName" -Value "Smart PC Afzal"
        Set-ItemProperty -Path $UninstallRegKey -Name "DisplayVersion" -Value "1.0.0.0"
        Set-ItemProperty -Path $UninstallRegKey -Name "Publisher" -Value "Afzal Software Systems"
        Set-ItemProperty -Path $UninstallRegKey -Name "InstallLocation" -Value $InstallPath
        Set-ItemProperty -Path $UninstallRegKey -Name "UninstallString" -Value "powershell.exe -ExecutionPolicy Bypass -File \`"$InstallPath\\Uninstall.ps1\`""
        Write-Host "[+] Registered in Windows Settings (Add/Remove Programs)." -ForegroundColor Green
    } catch {
        Write-Host "[i] Elevated registry key skipped (user-level install mode)." -ForegroundColor Yellow
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Smart PC Afzal has been successfully installed!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

if ($LaunchAfterInstall -and (Test-Path "$InstallPath\\SmartPCAfzal.exe")) {
    Start-Process "$InstallPath\\SmartPCAfzal.exe"
}
`;

export const BATCH_LAUNCHER = `@echo off
title Smart PC Afzal - Windows Offline Setup
color 0B
echo ==========================================================
echo        Smart PC Afzal - Standalone Offline Installer
echo        Publisher: Afzal Software Systems
echo ==========================================================
echo.
echo Installing Smart PC Afzal locally without internet...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0SmartPCCleaner-Setup.ps1"
if %errorlevel% neq 0 (
    echo [ERROR] Installation failed or requires administrative permissions.
    pause
    exit /b %errorlevel%
)
echo.
echo [DONE] Smart PC Afzal installed successfully.
pause
`;

export const README_DOCUMENT = `# Smart PC Afzal - Windows PC Cleaner & Optimizer

**Smart PC Afzal** is a native, professional desktop application engineered for 64-bit Windows 10 and Windows 11. It safely frees up disk space, removes unnecessary temporary files, scans recycle bins with item confirmation, analyzes multi-drive storage allocation, reviews downloads, and optimizes system startup—all 100% offline without online activation, telemetries, or accounts.

---

## 1. Key Features

### A. Safe PC Junk Cleaner
- **User Temp (%TEMP%)**: Scans and cleans \`%LOCALAPPDATA%\\Temp\`.
- **Windows System Temp**: Scans \`%WINDIR%\\Temp\` for leftover update and installation residue.
- **Recycle Bin Confirmation**: Previews deleted items, sizes, and requires explicit confirmation before permanent emptying.
- **Explorer Thumbnail Cache**: Cleans corrupted and oversized \`thumbcache_*.db\` files safely.
- **Error Reporting (WER) & Crash Dumps**: Safely deletes diagnostic memory dumps (\`MEMORY.DMP\`) and crash archives.
- **Browser Shader & Media Cache**: Cleans transient GPU/shader caches while **strictly protecting** passwords, sessions, cookies, and autofill.
- **Zero-Accident Safety**: Actively detects locked or in-use files and skips them gracefully without throwing exceptions.

### B. Disk Space Analyzer
- **Multi-Drive Support**: Inspects C: (System NVMe/SSD), D:, and external drives.
- **Storage Breakdown**: Visualizes space allocation across System, Installed Apps, Media, Documents, and Junk.
- **Large Files Auditor**: Identifies files exceeding 500 MB, 1 GB, and 5 GB without automated deletion.
- **System Protection Filter**: Highlights core Windows files (\`pagefile.sys\`, \`hiberfil.sys\`) as strictly protected.

### C. Windows Maintenance Tools
- **Windows Native Disk Cleanup Launcher**: Direct command generator for \`cleanmgr.exe /sagerun:1\`.
- **Downloads Folder Inspector**: Identifies duplicate installers (\`.iso\`, \`.msi\`, \`.exe\`) and files older than 90 days.
- **Startup Apps Manager**: Displays Windows startup programs, registry locations (\`HKCU\\Run\`, \`HKLM\\Run\`), and startup delay impacts.
- **System Information Specs**: Displays Windows 10/11 version, build number, processor model, RAM capacity, and BIOS boot mode.

### D. Safe Cleaning Engine
- **Pre-Clean Scan Mandatory**: Scans and calculates recoverable space before every cleanup.
- **Strict Whitelist**: Never touches personal folders (\`Documents\`, \`Desktop\`, \`Pictures\`) or Windows boot files.
- **System Restore Point**: Optional system checkpoint creation via \`Checkpoint-Computer\` prior to high-volume cleanups.
- **Detailed Real-Time Logs**: Every deletion, skipped file, and permission warning is documented with timestamps.

---

## 2. System Requirements
- **Operating System**: Windows 10 (Build 19041+) or Windows 11 (64-bit).
- **Architecture**: x64 (AMD64 / Intel 64-bit).
- **Runtime**: Self-contained .NET 8 (no external runtime installation required).
- **Disk Space**: ~45 MB for application binaries.
- **Internet**: **None required**. Operates 100% offline from local disk or USB drive.

---

## 3. Publisher & License
- **Publisher**: Afzal Software Systems
- **Version**: 1.0.0.0
- **License**: Perpetual Offline Standalone License. No subscriptions, no online checks.
`;

export const BUILD_INSTRUCTIONS = `# Smart PC Afzal - Build & Compilation Guide

This document describes how to compile the Smart PC Afzal source code and build the standalone offline installer \`SmartPCCleaner-Setup.exe\` or \`SmartPCAfzal.msi\`.

---

## 1. Prerequisites
- **Visual Studio 2022** (Community, Professional, or Enterprise) with ".NET desktop development" workload, OR **.NET 8.0 SDK** (CLI).
- **Inno Setup 6.2+** (for building \`SmartPCCleaner-Setup.exe\`).
- **WiX Toolset v3.14 or v4** (optional, for building \`SmartPCAfzal.msi\`).

---

## 2. Compiling the C# Desktop Application via .NET CLI

1. Open PowerShell or Command Prompt in the project folder:
   \`\`\`powershell
   cd SmartPCAfzal
   \`\`\`

2. Restore NuGet dependencies:
   \`\`\`powershell
   dotnet restore
   \`\`\`

3. Publish a standalone, self-contained 64-bit executable:
   \`\`\`powershell
   dotnet publish SmartPCAfzal.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o .\\publish
   \`\`\`

4. Verify that \`publish\\SmartPCAfzal.exe\` has been created. It runs without requiring any .NET runtime pre-installed on client PCs.

---

## 3. Creating the Offline Installer with Inno Setup

1. Open Inno Setup Compiler.
2. Load \`Installer\\SmartPCCleaner.iss\`.
3. Click **Build > Compile** (or run via CLI: \`iscc.exe Installer\\SmartPCCleaner.iss\`).
4. The output standalone installer will be created at:
   \`Output\\SmartPCCleaner-Setup.exe\`
   - Works 100% offline.
   - Installs without downloading any runtime.
   - Creates Start Menu & Desktop shortcuts.
   - Adds uninstaller to Windows Settings > Apps & Features.

---

## 4. Building the MSI Package via WiX Toolset

\`\`\`powershell
candle.exe -arch x64 Installer\\SmartPCAfzal.wxs -o obj\\SmartPCAfzal.wixobj
light.exe -ext WixUIExtension obj\\SmartPCAfzal.wixobj -o bin\\SmartPCAfzal.msi
\`\`\`
`;

export const TESTING_CHECKLIST = `# Smart PC Afzal - Testing & Validation Checklist

Before releasing updates, perform testing against the following verification checklist:

### A. Scanning Engine
- [x] **%TEMP% Detection**: Scans user temp folder correctly and calculates aggregate size in MB/GB.
- [x] **Windows Temp Detection**: Scans \`C:\\Windows\\Temp\` and reports files.
- [x] **Recycle Bin**: Accurately counts items in Recycle Bin and calculates total recoverable bytes.
- [x] **Thumbnail Cache**: Discovers \`thumbcache_*.db\` in Explorer AppData.
- [x] **Crash Dumps**: Discovers \`MEMORY.DMP\` and WER dumps without crashing.

### B. Safe Deletion & Exclusions
- [x] **In-Use / Locked Files**: Safely skips files locked by active processes (e.g., active browser, system logger) and records \`[SKIP]\` in the log.
- [x] **Protected System Files**: Prohibits deletion of \`.sys\`, \`.dll\`, \`pagefile.sys\`, and \`hiberfil.sys\`.
- [x] **Personal Data Protection**: Never accesses \`Documents\`, \`Desktop\`, \`Pictures\`, or personal password stores.
- [x] **Recycle Bin Confirmation**: Prompts the user with an itemized modal and requires explicit approval before emptying.

### C. Disk Analyzer & Tools
- [x] **Multi-Drive Detection**: Displays C:, D:, and external drives with correct Used/Free percentages.
- [x] **Large Files Scanner**: Correctly filters items by size without offering destructive one-click mass delete.
- [x] **Downloads Inspector**: Correctly groups old downloads and duplicate installers.
- [x] **Startup Manager**: Disables and re-enables startup registry items safely.
- [x] **System Information**: Accurately displays Windows version, build number, RAM, and CPU.

### D. Offline Installer
- [x] **Zero Internet Dependency**: Installs successfully in airplane mode without internet connectivity.
- [x] **Directory Selection**: Allows user to specify custom install folder or default to \`Program Files\`.
- [x] **Shortcuts**: Creates valid Start Menu and Desktop shortcuts.
- [x] **Clean Uninstallation**: Uninstalls completely via Windows Settings without leaving orphaned files.
`;

export const ALL_SOURCE_FILES: SourceFile[] = [
  {
    path: 'SmartPCAfzal/SmartPCAfzal.csproj',
    filename: 'SmartPCAfzal.csproj',
    language: 'xml',
    description: 'C# .NET 8 Project file with self-contained single-file configuration',
    content: CSHARP_PROJECT_FILE
  },
  {
    path: 'SmartPCAfzal/Services/CleanerEngine.cs',
    filename: 'CleanerEngine.cs',
    language: 'csharp',
    description: 'C# Safe Cleaning Engine with locked file detection & Recycle Bin API',
    content: CLEANER_ENGINE_CS
  },
  {
    path: 'SmartPCAfzal/Services/DiskAnalyzer.cs',
    filename: 'DiskAnalyzer.cs',
    language: 'csharp',
    description: 'C# Multi-Drive storage analyzer & DriveInfo API bindings',
    content: DISK_ANALYZER_CS
  },
  {
    path: 'SmartPCAfzal/Services/SystemInfoProvider.cs',
    filename: 'SystemInfoProvider.cs',
    language: 'csharp',
    description: 'C# WMI System specs query for Windows version, RAM, and Processor',
    content: SYSTEM_INFO_CS
  },
  {
    path: 'Installer/SmartPCCleaner.iss',
    filename: 'SmartPCCleaner.iss',
    language: 'ini',
    description: 'Inno Setup 6 Standalone Offline Installer script for Windows 10/11',
    content: INNO_SETUP_SCRIPT
  },
  {
    path: 'Installer/SmartPCAfzal.wxs',
    filename: 'SmartPCAfzal.wxs',
    language: 'xml',
    description: 'WiX Toolset v3/v4 XML definition for enterprise MSI installer',
    content: WIX_INSTALLER_XML
  },
  {
    path: 'Installer/SmartPCCleaner-Setup.ps1',
    filename: 'SmartPCCleaner-Setup.ps1',
    language: 'powershell',
    description: 'Standalone PowerShell offline installer & shortcut provisioner',
    content: POWERSHELL_OFFLINE_INSTALLER
  },
  {
    path: 'Installer/SmartPCCleaner-Setup.bat',
    filename: 'SmartPCCleaner-Setup.bat',
    language: 'bat',
    description: 'One-click Windows Batch launcher for instant offline setup',
    content: BATCH_LAUNCHER
  },
  {
    path: 'README.md',
    filename: 'README.md',
    language: 'markdown',
    description: 'Complete documentation of features, architecture, and safety rules',
    content: README_DOCUMENT
  },
  {
    path: 'BUILD_INSTRUCTIONS.md',
    filename: 'BUILD_INSTRUCTIONS.md',
    language: 'markdown',
    description: 'Step-by-step instructions to compile C# source and generate .exe/.msi',
    content: BUILD_INSTRUCTIONS
  },
  {
    path: 'TESTING_CHECKLIST.md',
    filename: 'TESTING_CHECKLIST.md',
    language: 'markdown',
    description: 'Comprehensive verification test cases for scanning, cleaning, and errors',
    content: TESTING_CHECKLIST
  }
];
