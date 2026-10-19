import React, { useState } from 'react';
import { 
  HardDrive, 
  FileText, 
  Film, 
  Archive, 
  Box, 
  ShieldAlert, 
  Info, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { DiskDrive, LargeFileItem } from '../types';
import { formatBytes } from '../data/mockWindowsData';

interface DiskAnalyzerViewProps {
  drives: DiskDrive[];
  largeFiles: LargeFileItem[];
  onOpenExplorerLocation?: (path: string) => void;
}

export const DiskAnalyzerView: React.FC<DiskAnalyzerViewProps> = ({
  drives,
  largeFiles
}) => {
  const [selectedDriveLetter, setSelectedDriveLetter] = useState('C:');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [minSizeFilter, setMinSizeFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const activeDrive = drives.find(d => d.letter === selectedDriveLetter) || drives[0];

  const filteredFiles = largeFiles.filter(item => {
    if (item.drive !== selectedDriveLetter && selectedDriveLetter !== 'ALL') return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (item.sizeBytes < minSizeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q);
    }
    return true;
  });

  const totalUsedPercent = Math.round((activeDrive.usedBytes / activeDrive.totalBytes) * 100);

  // Proportional calculation for breakdown bar
  const bd = activeDrive.breakdown;
  const sysPct = ((bd.systemBytes / activeDrive.totalBytes) * 100).toFixed(1);
  const appPct = ((bd.appsBytes / activeDrive.totalBytes) * 100).toFixed(1);
  const medPct = ((bd.mediaBytes / activeDrive.totalBytes) * 100).toFixed(1);
  const docPct = ((bd.documentsBytes / activeDrive.totalBytes) * 100).toFixed(1);
  const jnkPct = ((bd.junkBytes / activeDrive.totalBytes) * 100).toFixed(1);
  const freePct = ((activeDrive.freeBytes / activeDrive.totalBytes) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Drive Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {drives.map(drive => {
          const isSelected = selectedDriveLetter === drive.letter;
          const pct = Math.round((drive.usedBytes / drive.totalBytes) * 100);

          return (
            <button
              key={drive.letter}
              onClick={() => setSelectedDriveLetter(drive.letter)}
              className={`px-4 py-3 rounded-xl border transition-all text-left min-w-[200px] shrink-0 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HardDrive className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span>{drive.letter} ({drive.name})</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-medium">{pct}%</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>{formatBytes(drive.freeBytes, 0)} free</span>
                <span>{formatBytes(drive.totalBytes, 0)} total</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Storage Breakdown Visualizer */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Storage Distribution for {activeDrive.letter} ({activeDrive.type} · {activeDrive.fileSystem})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive allocation of used and free storage space on this volume
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {formatBytes(activeDrive.freeBytes, 1)}
            </span>
            <span className="text-xs text-slate-400 ml-1">Available</span>
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="w-full h-4 rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-4 shadow-inner">
          <div style={{ width: `${sysPct}%` }} className="bg-indigo-600 h-full" title={`System: ${formatBytes(bd.systemBytes)} (${sysPct}%)`} />
          <div style={{ width: `${appPct}%` }} className="bg-blue-500 h-full" title={`Apps: ${formatBytes(bd.appsBytes)} (${appPct}%)`} />
          <div style={{ width: `${medPct}%` }} className="bg-purple-500 h-full" title={`Media: ${formatBytes(bd.mediaBytes)} (${medPct}%)`} />
          <div style={{ width: `${docPct}%` }} className="bg-emerald-500 h-full" title={`Documents: ${formatBytes(bd.documentsBytes)} (${docPct}%)`} />
          <div style={{ width: `${jnkPct}%` }} className="bg-amber-500 h-full" title={`Junk: ${formatBytes(bd.junkBytes)} (${jnkPct}%)`} />
          <div style={{ width: `${freePct}%` }} className="bg-slate-300 dark:bg-slate-700 h-full" title={`Free Space: ${formatBytes(activeDrive.freeBytes)} (${freePct}%)`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shrink-0"></div>
            <div className="min-w-0">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">System & OS</div>
              <div className="font-mono font-semibold text-slate-900 dark:text-white">{formatBytes(bd.systemBytes, 1)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0"></div>
            <div className="min-w-0">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Installed Apps</div>
              <div className="font-mono font-semibold text-slate-900 dark:text-white">{formatBytes(bd.appsBytes, 1)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-500 shrink-0"></div>
            <div className="min-w-0">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Media & Video</div>
              <div className="font-mono font-semibold text-slate-900 dark:text-white">{formatBytes(bd.mediaBytes, 1)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0"></div>
            <div className="min-w-0">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Documents</div>
              <div className="font-mono font-semibold text-slate-900 dark:text-white">{formatBytes(bd.documentsBytes, 1)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0"></div>
            <div className="min-w-0">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Temporary Junk</div>
              <div className="font-mono font-semibold text-slate-900 dark:text-white">{formatBytes(bd.junkBytes, 1)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700 shrink-0"></div>
            <div className="min-w-0">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Free Capacity</div>
              <div className="font-mono font-semibold text-slate-900 dark:text-white">{formatBytes(activeDrive.freeBytes, 1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Files & Space Consumers Explorer */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Large Space Consumers & Files Finder
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identify oversized files without automatic deletion. Review files carefully before taking action.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search file name or path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Installer">Installers (.iso, .exe)</option>
              <option value="Virtual Disk">Virtual Disks (.vhdx)</option>
              <option value="Video">Video Files (.mov, .mp4)</option>
              <option value="Archive">Archives (.zip, .tar)</option>
              <option value="Database">System Databases (.sys)</option>
            </select>
          </div>
        </div>

        {/* Files Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Last Modified</th>
                <th className="py-2.5 px-3 text-right">Size</th>
                <th className="py-2.5 px-3 text-center">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No files found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {file.category === 'Video' && <Film className="w-3.5 h-3.5 text-purple-500" />}
                        {file.category === 'Installer' && <Box className="w-3.5 h-3.5 text-blue-500" />}
                        {file.category === 'Archive' && <Archive className="w-3.5 h-3.5 text-amber-500" />}
                        {file.category === 'Virtual Disk' && <HardDrive className="w-3.5 h-3.5 text-indigo-500" />}
                        {file.category === 'Database' && <FileText className="w-3.5 h-3.5 text-rose-500" />}
                        <span className="truncate max-w-[200px]" title={file.name}>{file.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-[260px]" title={file.path}>
                      {file.path}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {file.category}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {file.dateModified}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatBytes(file.sizeBytes)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {file.isProtected ? (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1" title="Core Windows kernel / swapfile. Never modify or delete.">
                          <ShieldAlert className="w-3 h-3" />
                          <span>System Protected</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Safe to review
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>
            <strong>Safety Notice:</strong> Smart PC Afzal strictly adheres to non-destructive analysis principles. Large media files, virtual disks, and installer archives are surfaced solely for user visibility and will never be deleted automatically without your explicit consent.
          </span>
        </div>
      </div>
    </div>
  );
};
