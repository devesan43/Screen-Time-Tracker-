import React, { useState } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, formatMinutes, formatTime24to12 } from '../data/mockUsageData';
import { Zap, Clock3, Moon } from 'lucide-react';

export const DailyAnalysis: React.FC = () => {
  const { currentDayRecord, categoryFilter } = useScreenTime();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Filter apps according to active category
  const filteredApps = React.useMemo(() => {
    if (categoryFilter === 'all') return TRACKED_APPS;
    return TRACKED_APPS.filter((a) => a.category === categoryFilter);
  }, [categoryFilter]);

  // Compute total minutes per hour slot (0 to 23)
  const hourlyTotals = React.useMemo(() => {
    const slots = new Array(24).fill(0);
    const hourlyAppBreakdown: Array<Array<{ appName: string; minutes: number; color: string }>> = Array.from(
      { length: 24 },
      () => []
    );

    filteredApps.forEach((app) => {
      const appUsage = currentDayRecord.apps[app.id];
      if (appUsage && appUsage.hourlyMinutes) {
        appUsage.hourlyMinutes.forEach((mins, h) => {
          if (mins > 0) {
            slots[h] += mins;
            hourlyAppBreakdown[h].push({
              appName: app.name,
              minutes: mins,
              color: app.color,
            });
          }
        });
      }
    });

    return { slots, hourlyAppBreakdown };
  }, [filteredApps, currentDayRecord]);

  const maxHourMinutes = Math.max(60, ...hourlyTotals.slots);
  const currentHour = new Date().getHours();

  // Find peak hour
  const peakHourIndex = hourlyTotals.slots.indexOf(Math.max(...hourlyTotals.slots));
  const peakMinutes = hourlyTotals.slots[peakHourIndex] || 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-sky-400" />
            24-Hour Usage Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly timeline of screen activity throughout the day
          </p>
        </div>

        {peakMinutes > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs text-amber-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Peak: <strong>{formatTime24to12(peakHourIndex)}</strong> ({formatMinutes(peakMinutes)})
            </span>
          </div>
        )}
      </div>

      {/* Bar Chart Area */}
      <div className="relative pt-6 pb-2">
        {/* Hovered Hour Tooltip */}
        {hoveredHour !== null && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-400">
                {formatTime24to12(hoveredHour)}:
              </span>
              <span className="font-bold text-white">
                {formatMinutes(hourlyTotals.slots[hoveredHour])}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {hourlyTotals.hourlyAppBreakdown[hoveredHour].slice(0, 3).map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.appName}</span>
                  <span className="text-slate-400">{item.minutes}m</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 24 Columns */}
        <div className="h-44 flex items-end justify-between gap-1 sm:gap-1.5 pt-4 border-b border-slate-800/80">
          {hourlyTotals.slots.map((mins, hour) => {
            const heightPercent = maxHourMinutes > 0 ? (mins / maxHourMinutes) * 100 : 0;
            const isCurrent = hour === currentHour;
            const isPeak = hour === peakHourIndex && mins > 0;
            const isNight = hour >= 23 || hour <= 6;

            return (
              <div
                key={hour}
                onMouseEnter={() => setHoveredHour(hour)}
                onMouseLeave={() => setHoveredHour(null)}
                className="group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isPeak
                      ? 'bg-gradient-to-t from-amber-500 to-rose-500 shadow-lg shadow-rose-500/20'
                      : isCurrent
                      ? 'bg-gradient-to-t from-sky-500 to-indigo-500 shadow-lg shadow-sky-500/20'
                      : mins > 0
                      ? 'bg-slate-700 group-hover:bg-sky-400'
                      : 'bg-slate-800/40 group-hover:bg-slate-700/60'
                  }`}
                  style={{
                    height: mins > 0 ? `${Math.max(10, heightPercent)}%` : '4px',
                  }}
                />

                {/* Night mode indicator icon on chart bottom */}
                {isNight && hour === 3 && (
                  <Moon className="absolute -bottom-5 w-3 h-3 text-slate-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Hour Axis Labels */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-2 px-1">
          <span>12 AM</span>
          <span>4 AM</span>
          <span>8 AM</span>
          <span>12 PM</span>
          <span>4 PM</span>
          <span>8 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Legend & Advice */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-sky-500 to-indigo-500" />
            <span>Active hours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-amber-500 to-rose-500" />
            <span>Peak hour</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          Tip: Screen time after 10 PM disrupts melatonin production.
        </span>
      </div>
    </div>
  );
};
