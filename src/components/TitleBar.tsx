import React from 'react';
import { Shield, Sun, Moon, Minus, Square, X, Laptop } from 'lucide-react';

interface TitleBarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onQuickScan: () => void;
  isScanning: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  darkMode,
  setDarkMode,
  onQuickScan,
  isScanning
}) => {
  return (
    <header className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 select-none shrink-0 z-30">
      {/* Brand Title Zone */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold tracking-tight text-white whitespace-nowrap">
            Smart PC Afzal
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400 font-normal">
            Windows 10 / 11 · 64-bit Edition
          </span>
        </div>
      </div>

      {/* Middle Status Text */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Laptop className="w-3.5 h-3.5 text-blue-400" />
          <span>Dell XPS 15 · C: NVMe (83% Full)</span>
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-emerald-400 font-medium">Offline Standalone Mode</span>
      </div>

      {/* Primary Action & Windows Controls Zone */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onQuickScan}
          disabled={isScanning}
          className="mr-2 px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded transition-colors whitespace-nowrap"
        >
          {isScanning ? 'Scanning PC...' : 'Quick Scan'}
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark / Light Theme"
          className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
        </button>

        {/* Windows Window Controls */}
        <div className="flex items-center ml-1 border-l border-slate-800 pl-1">
          <button
            title="Minimize"
            className="w-8 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            title="Maximize / Restore"
            className="w-8 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            title="Close Application"
            className="w-8 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
