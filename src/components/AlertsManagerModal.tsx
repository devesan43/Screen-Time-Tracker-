import React, { useState } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, formatMinutes } from '../data/mockUsageData';
import { AppIcon } from './AppIcon';
import { UsageLimit } from '../types';
import { soundService } from '../utils/audioAlert';
import {
  X,
  ShieldAlert,
  Moon,
  Volume2,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';

interface AlertsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsManagerModal: React.FC<AlertsManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    limits,
    updateLimit,
    addLimit,
    deleteLimit,
    bedtime,
    updateBedtime,
  } = useScreenTime();

  const [selectedNewApp, setSelectedNewApp] = useState(TRACKED_APPS[0].id);
  const [newLimitMins, setNewLimitMins] = useState(45);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAddNewLimit = () => {
    const targetApp = TRACKED_APPS.find((a) => a.id === selectedNewApp);
    if (!targetApp) return;

    addLimit({
      id: `limit_${targetApp.id}`,
      targetType: 'app',
      targetId: targetApp.id,
      targetName: targetApp.name,
      limitMinutes: newLimitMins,
      enabled: true,
      warnAt80Percent: true,
      hardBlock: true,
      soundAlert: true,
    });
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Custom Usage Limits & Alerts</h2>
              <p className="text-xs text-slate-400">
                Manage screen time caps for social apps, browsers, and bedtime
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bedtime / Wind-Down Schedule Section */}
        <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Bedtime Wind-Down Mode</h4>
                <p className="text-xs text-slate-400">
                  Turns display to calming grayscale and silences notifications
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={bedtime.enabled}
                onChange={(e) => updateBedtime({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {bedtime.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Start Bedtime:</label>
                <input
                  type="time"
                  value={bedtime.startTime}
                  onChange={(e) => updateBedtime({ startTime: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Wake Up:</label>
                <input
                  type="time"
                  value={bedtime.endTime}
                  onChange={(e) => updateBedtime({ endTime: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={bedtime.grayscale}
                    onChange={(e) => updateBedtime({ grayscale: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-500 bg-slate-900"
                  />
                  <span>Grayscale Filter</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Limits List Header & Add Button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Configured App Limits ({limits.length})</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => soundService.playLimitReachedChime()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
              title="Test audio chime"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Test Chime</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition shadow-md shadow-sky-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Limit</span>
            </button>
          </div>
        </div>

        {/* Add Limit Form */}
        {showAddForm && (
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-sky-500/40 mb-4 animate-in slide-in-from-top-2 duration-150">
            <span className="text-xs font-bold text-white block mb-2">Create New App Limit</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Select App</label>
                <select
                  value={selectedNewApp}
                  onChange={(e) => setSelectedNewApp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {TRACKED_APPS.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Daily Limit: {formatMinutes(newLimitMins)}
                </label>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={newLimitMins}
                  onChange={(e) => setNewLimitMins(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400 mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewLimit}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-500 text-slate-950 hover:bg-sky-400 transition"
              >
                Save Limit
              </button>
            </div>
          </div>
        )}

        {/* Existing Limits Table */}
        <div className="space-y-2.5">
          {limits.map((lim) => {
            const isApp = lim.targetType === 'app';
            const app = isApp ? TRACKED_APPS.find((a) => a.id === lim.targetId) : null;

            return (
              <div
                key={lim.id}
                className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {isApp && app ? (
                    <AppIcon appId={app.id} size="sm" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      ★
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-bold text-white block">
                      {lim.targetName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Cap: <strong className="text-sky-400">{formatMinutes(lim.limitMinutes)}</strong>/day
                      {lim.hardBlock ? ' • Block when reached' : ' • Warn only'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Active Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lim.enabled}
                      onChange={(e) => updateLimit(lim.id, { enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>

                  {/* Delete */}
                  <button
                    onClick={() => deleteLimit(lim.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition"
                    title="Delete Limit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
