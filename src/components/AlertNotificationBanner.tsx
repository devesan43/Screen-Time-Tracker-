import React from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { AppIcon } from './AppIcon';
import { formatMinutes } from '../data/mockUsageData';
import {
  AlertTriangle,
  Clock,
  Coffee,
  X,
  Volume2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const AlertNotificationBanner: React.FC = () => {
  const {
    activeAlert,
    dismissAlert,
    snoozeAlert,
    setSelectedAppForDetail,
    TRACKED_APPS,
  } = useScreenTime() as any;

  if (!activeAlert) return null;

  const isHardBlock = activeAlert.type === 'hard_block';

  // Full Screen Take-A-Break Hard Block Overlay
  if (isHardBlock) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in-95 duration-200">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-center shadow-2xl relative">
          {/* Top Android App Paused Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldAlert className="w-4 h-4" /> App Paused for Today
          </div>

          {/* App Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <AppIcon appId={activeAlert.appId} size="xl" />
              <div className="absolute -bottom-2 -right-2 bg-rose-500 p-1.5 rounded-full text-white shadow-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Time's Up for {activeAlert.appName}
          </h2>

          <p className="text-slate-300 text-sm mb-4">
            You've spent <strong className="text-white">{formatMinutes(activeAlert.currentMinutes)}</strong> on{' '}
            {activeAlert.appName} today, meeting your daily limit of{' '}
            <strong className="text-sky-400">{formatMinutes(activeAlert.limitMinutes)}</strong>.
          </p>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-xs text-slate-300 mb-6 flex items-start gap-3 text-left">
            <Coffee className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">Mindful Digital Wellbeing</span>
              Take a breath, rest your eyes, or take a quick stretch break. Your future self will thank you.
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={dismissAlert}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold hover:from-sky-400 hover:to-indigo-500 transition shadow-lg shadow-sky-500/20"
            >
              Close & Step Away
            </button>

            <button
              onClick={() => snoozeAlert(5)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
            >
              Extend 5 Minutes (+5m Snooze)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Top Heads-up Warning Card (for 80% warning or soft notification)
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-200">
      <div className="rounded-2xl bg-slate-900/95 border border-amber-500/40 p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <AppIcon appId={activeAlert.appId} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Usage Alert
              </span>
              <span className="text-xs text-slate-400">• {activeAlert.percentage}% of limit</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              {activeAlert.appName}: {formatMinutes(activeAlert.currentMinutes)} used of {formatMinutes(activeAlert.limitMinutes)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => snoozeAlert(10)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition"
          >
            Snooze 10m
          </button>
          <button
            onClick={dismissAlert}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
