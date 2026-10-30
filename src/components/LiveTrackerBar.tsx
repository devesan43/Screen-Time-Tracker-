import React, { useState } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, formatMinutes } from '../data/mockUsageData';
import { AppIcon } from './AppIcon';
import {
  Play,
  Square,
  ChevronUp,
  ChevronDown,
  Clock,
  Zap,
  Plus,
  Radio,
} from 'lucide-react';

export const LiveTrackerBar: React.FC = () => {
  const {
    liveTracking,
    startLiveTracking,
    stopLiveTracking,
    addUsageMinutes,
  } = useScreenTime();

  const [isExpanded, setIsExpanded] = useState(false);

  const activeApp = TRACKED_APPS.find((a) => a.id === liveTracking.appId) || TRACKED_APPS[0];

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 transition-all duration-200">
      <div className="rounded-2xl bg-slate-900/95 border border-sky-500/40 shadow-2xl backdrop-blur-xl p-3 sm:p-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Active app icon + status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <AppIcon appId={activeApp.id} size="sm" />
              {liveTracking.isActive && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1">
                  <Radio className={`w-3 h-3 ${liveTracking.isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                  {liveTracking.isActive ? 'Monitoring Active App' : 'Idle Simulator'}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {activeApp.name}
              </div>
            </div>
          </div>

          {/* Running Clock Timer */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-center">
              <span className="font-mono text-sm font-bold text-emerald-400">
                {formatSeconds(liveTracking.elapsedSeconds)}
              </span>
            </div>

            {/* Play / Pause button */}
            {liveTracking.isActive ? (
              <button
                onClick={stopLiveTracking}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-md shadow-rose-500/20"
                title="Pause live session"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => startLiveTracking(activeApp.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20"
                title="Start tracking active session"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </button>
            )}

            {/* Expand switcher */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Change active app or add minutes"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded options: Switch foreground app or simulate chunk */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 animate-in slide-in-from-top-1 text-xs">
            <div className="mb-2 text-slate-400 font-semibold flex items-center justify-between">
              <span>Switch Active Foreground App:</span>
              <span className="text-[10px] text-sky-400">Updates live per second</span>
            </div>

            {/* App Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-3">
              {TRACKED_APPS.slice(0, 8).map((app) => (
                <button
                  key={app.id}
                  onClick={() => startLiveTracking(app.id)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-xl text-left border transition ${
                    activeApp.id === app.id
                      ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <AppIcon appId={app.id} size="sm" className="w-5 h-5 shrink-0" />
                  <span className="truncate text-[11px]">{app.name}</span>
                </button>
              ))}
            </div>

            {/* Fast booster buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-slate-400 text-[11px]">Quick Add:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => addUsageMinutes(activeApp.id, 5)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                >
                  +5m
                </button>
                <button
                  onClick={() => addUsageMinutes(activeApp.id, 15)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                >
                  +15m
                </button>
                <button
                  onClick={() => addUsageMinutes(activeApp.id, 30)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                >
                  +30m
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
