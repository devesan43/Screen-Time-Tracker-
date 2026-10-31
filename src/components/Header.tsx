import React from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  ShieldAlert,
  Download,
  Github,
  Moon,
  Laptop,
  Sparkles,
  RotateCcw,
  Sliders,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  onOpenAlerts: () => void;
  onOpenExport: () => void;
  onOpenApk: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAlerts,
  onOpenExport,
  onOpenApk,
}) => {
  const {
    deviceViewMode,
    setDeviceViewMode,
    bedtime,
    updateBedtime,
    resetTodayData,
    limits,
    syncDeviceData,
    isSyncing,
    lastSyncTime,
  } = useScreenTime();

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const activeLimitsCount = limits.filter((l) => l.enabled).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Smartphone className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                ChronosScreen
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
                Android Monitor
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Social Media & Browsing Screen Time Analyzer
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* PWA Install Button (Mandatory per PWA skill) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 hover:brightness-110 transition"
              title="Install ChronosScreen as an Android WebAPK"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Real-time Synchronous Device Sync */}
          <button
            onClick={syncDeviceData}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
            title={`Real-time Android Sync (Last: ${lastSyncTime})`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            <span className="sm:hidden">Sync</span>
          </button>

          {/* Android APK & GitHub modal trigger */}
          <button
            onClick={onOpenApk}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
            title="Download APK instructions & GitHub repo code"
          >
            <Github className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">APK & GitHub</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Limits & Alerts */}
          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition relative"
            title="Manage custom limits and bedtime mode"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Alerts ({activeLimitsCount})</span>
            {activeLimitsCount > 0 && (
              <span className="sm:hidden flex h-2 w-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Export Data */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
            title="Export CSV / JSON / Print Report"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Bedtime Quick Toggle */}
          <button
            onClick={() => updateBedtime({ enabled: !bedtime.enabled })}
            className={`p-2 rounded-xl border transition ${
              bedtime.enabled
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={`Bedtime Mode: ${bedtime.enabled ? 'ON' : 'OFF'}`}
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Device View Mode Toggle (Phone frame simulator vs Fluid responsive) */}
          <button
            onClick={() => setDeviceViewMode(deviceViewMode === 'phone' ? 'fluid' : 'phone')}
            className={`p-2 rounded-xl border transition hidden lg:flex items-center justify-center ${
              deviceViewMode === 'phone'
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={`Switch to ${deviceViewMode === 'phone' ? 'Fluid Dashboard' : 'Android Mobile Frame'}`}
          >
            {deviceViewMode === 'phone' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
