import React from 'react';
import { 
  LayoutDashboard, 
  Trash2, 
  PieChart, 
  Wrench, 
  ShieldCheck, 
  History, 
  DownloadCloud, 
  Settings,
  HardDrive
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  junkTotalDisplay: string;
  darkMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  junkTotalDisplay,
  darkMode
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'cleaner' as ActiveTab, 
      label: 'PC Junk Cleaner', 
      icon: Trash2,
      extraText: junkTotalDisplay 
    },
    { id: 'disk-analyzer' as ActiveTab, label: 'Disk Space Analyzer', icon: PieChart },
    { id: 'tools' as ActiveTab, label: 'Windows Tools', icon: Wrench },
    { id: 'safety' as ActiveTab, label: 'Safety & Restore', icon: ShieldCheck },
    { id: 'history' as ActiveTab, label: 'Cleaning History', icon: History },
    { id: 'installer' as ActiveTab, label: 'Offline Installer', icon: DownloadCloud },
    { id: 'settings' as ActiveTab, label: 'Settings & Help', icon: Settings }
  ];

  return (
    <aside className={`w-64 border-r flex flex-col justify-between shrink-0 select-none ${
      darkMode 
        ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
        : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Navigation
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                isActive
                  ? darkMode
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                    : 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : darkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? (darkMode ? 'text-blue-400' : 'text-blue-600') : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.extraText && (
                <span className="text-[11px] font-mono text-amber-500 font-medium pl-1 shrink-0">
                  {item.extraText}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom System Status Widget */}
      <div className={`p-3 m-3 rounded-lg border ${
        darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 mb-1.5">
          <HardDrive className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-slate-900 dark:text-white">Windows Drive C:</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1.5">
          <div className="bg-amber-500 h-full rounded-full" style={{ width: '83%' }}></div>
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>84.0 GB free</span>
          <span>428 GB / 512 GB</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Afzal Software</span>
          <span>v1.0.0.0</span>
        </div>
      </div>
    </aside>
  );
};
