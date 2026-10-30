import React, { useState } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { AppIcon } from './AppIcon';
import { CATEGORY_META, formatMinutes, formatTime24to12 } from '../data/mockUsageData';
import {
  X,
  Clock,
  Bell,
  Smartphone,
  ShieldAlert,
  Volume2,
  Check,
  Plus,
  Minus,
  Sparkles,
  Sliders,
} from 'lucide-react';

export const AppDetailModal: React.FC = () => {
  const {
    selectedAppForDetail,
    setSelectedAppForDetail,
    currentDayRecord,
    limits,
    updateLimit,
    addLimit,
    deleteLimit,
    addUsageMinutes,
  } = useScreenTime();

  if (!selectedAppForDetail) return null;

  const app = selectedAppForDetail;
  const usage = currentDayRecord.apps[app.id] || {
    minutes: 0,
    opens: 0,
    notifications: 0,
    hourlyMinutes: new Array(24).fill(0),
  };

  // Find existing limit or generate fallback
  const existingLimit = limits.find((l) => l.targetId === app.id);
  const [limitEnabled, setLimitEnabled] = useState(existingLimit?.enabled ?? false);
  const [limitMinutes, setLimitMinutes] = useState(existingLimit?.limitMinutes ?? 45);
  const [warn80, setWarn80] = useState(existingLimit?.warnAt80Percent ?? true);
  const [hardBlock, setHardBlock] = useState(existingLimit?.hardBlock ?? true);
  const [soundAlert, setSoundAlert] = useState(existingLimit?.soundAlert ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveLimit = () => {
    if (existingLimit) {
      updateLimit(existingLimit.id, {
        enabled: limitEnabled,
        limitMinutes,
        warnAt80Percent: warn80,
        hardBlock,
        soundAlert,
      });
    } else {
      addLimit({
        id: `limit_${app.id}`,
        targetType: 'app',
        targetId: app.id,
        targetName: app.name,
        limitMinutes,
        enabled: limitEnabled,
        warnAt80Percent: warn80,
        hardBlock,
        soundAlert,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const maxHourlyVal = Math.max(15, ...(usage.hourlyMinutes || []));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setSelectedAppForDetail(null)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Title & Header */}
        <div className="flex items-center gap-4 mb-6">
          <AppIcon appId={app.id} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{app.name}</h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  CATEGORY_META[app.category].tailwindBg
                } ${CATEGORY_META[app.category].tailwindText} ${
                  CATEGORY_META[app.category].tailwindBorder
                }`}
              >
                {CATEGORY_META[app.category].label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{app.description}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{app.packageName}</p>
          </div>
        </div>

        {/* 3 Quick Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Total Usage Today</span>
            <span className="text-xl font-bold text-white">{formatMinutes(usage.minutes)}</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Times Opened</span>
            <span className="text-xl font-bold text-sky-400">{usage.opens}</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Notifications</span>
            <span className="text-xl font-bold text-amber-400">{usage.notifications}</span>
          </div>
        </div>

        {/* Hourly Distribution Specific to this App */}
        <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-semibold">
            <span>24-Hour Activity for {app.name}</span>
            <span>Peak at {formatTime24to12(usage.hourlyMinutes.indexOf(Math.max(...usage.hourlyMinutes)))}</span>
          </div>

          <div className="h-24 flex items-end justify-between gap-1 border-b border-slate-800 pb-1">
            {usage.hourlyMinutes.map((mins, h) => {
              const hPercent = maxHourlyVal > 0 ? (mins / maxHourlyVal) * 100 : 0;
              return (
                <div
                  key={h}
                  className="flex-1 flex flex-col justify-end items-center h-full group relative"
                  title={`${formatTime24to12(h)}: ${mins} mins`}
                >
                  <div
                    className="w-full rounded-t-sm transition-all bg-sky-500 group-hover:bg-rose-400"
                    style={{ height: mins > 0 ? `${Math.max(12, hPercent)}%` : '3px' }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 pt-1">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* Custom Daily Limit Configuration */}
        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Daily Usage Limit & Alerts</h4>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={limitEnabled}
                onChange={(e) => setLimitEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {limitEnabled && (
            <div className="space-y-4 pt-2">
              {/* Slider & Presets */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Daily Maximum Allowed:</span>
                  <span className="text-base font-bold text-sky-400">{formatMinutes(limitMinutes)}</span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="240"
                  step="5"
                  value={limitMinutes}
                  onChange={(e) => setLimitMinutes(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />

                {/* Preset quick buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  {[15, 30, 45, 60, 90, 120].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setLimitMinutes(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        limitMinutes === preset
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {formatMinutes(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={warn80}
                    onChange={(e) => setWarn80(e.target.checked)}
                    className="rounded border-slate-700 text-sky-500 focus:ring-0 bg-slate-900"
                  />
                  <span>Warn me at 80% usage (e.g. at {formatMinutes(Math.round(limitMinutes * 0.8))})</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hardBlock}
                    onChange={(e) => setHardBlock(e.target.checked)}
                    className="rounded border-slate-700 text-sky-500 focus:ring-0 bg-slate-900"
                  />
                  <span>Show screen pause lock overlay when 100% limit is reached</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundAlert}
                    onChange={(e) => setSoundAlert(e.target.checked)}
                    className="rounded border-slate-700 text-sky-500 focus:ring-0 bg-slate-900"
                  />
                  <span>Play pleasant Android alert chime on limit warning</span>
                </label>
              </div>

              <button
                onClick={handleSaveLimit}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" /> Saved!
                  </>
                ) : (
                  'Apply Limit Settings'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Interactive Testing Simulator */}
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold block mb-2">
            Simulate App Usage for Testing:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addUsageMinutes(app.id, 5)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> +5 Mins
            </button>

            <button
              onClick={() => addUsageMinutes(app.id, 15)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> +15 Mins
            </button>

            <button
              onClick={() => addUsageMinutes(app.id, -10)}
              disabled={usage.minutes < 10}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-medium transition disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5 text-rose-400" /> -10 Mins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
