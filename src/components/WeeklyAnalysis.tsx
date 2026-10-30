import React from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, CATEGORY_META, formatMinutes } from '../data/mockUsageData';
import { AppCategory } from '../types';
import { BarChart2, TrendingDown, TrendingUp, CalendarCheck, Zap } from 'lucide-react';

export const WeeklyAnalysis: React.FC = () => {
  const { history, selectedDate, setSelectedDate, categoryFilter, limits } = useScreenTime();

  // Compute 7 days leading up to selectedDate
  const weekDays = React.useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayLabel: string;
      fullDateLabel: string;
      isCurrentDay: boolean;
      totalMin: number;
      categoryMins: Record<AppCategory, number>;
      pickups: number;
    }> = [];

    const end = new Date(selectedDate + 'T00:00:00');

    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const record = history[dateStr] || {
        date: dateStr,
        totalMinutes: 0,
        pickups: 0,
        apps: {},
      };

      const categoryMins: Record<AppCategory, number> = {
        social: 0,
        browsing: 0,
        productivity: 0,
        entertainment: 0,
        other: 0,
      };

      TRACKED_APPS.forEach((app) => {
        if (categoryFilter === 'all' || categoryFilter === app.category) {
          const m = record.apps[app.id]?.minutes || 0;
          categoryMins[app.category] += m;
        }
      });

      const dayTotal = Object.values(categoryMins).reduce((a, b) => a + b, 0);

      list.push({
        dateStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isCurrentDay: dateStr === selectedDate,
        totalMin: dayTotal,
        categoryMins,
        pickups: record.pickups || 0,
      });
    }

    return list;
  }, [selectedDate, history, categoryFilter]);

  // Aggregate stats
  const totalWeekMinutes = weekDays.reduce((acc, d) => acc + d.totalMin, 0);
  const avgDailyMinutes = Math.round(totalWeekMinutes / 7);
  const maxDayMinutes = Math.max(1, ...weekDays.map((d) => d.totalMin));

  // Find peak day
  const peakDay = weekDays.reduce((max, cur) => (cur.totalMin > max.totalMin ? cur : max), weekDays[0]);

  // Daily goal
  const dailyLimit = limits.find((l) => l.targetType === 'total')?.limitMinutes || 240;
  const daysUnderGoal = weekDays.filter((d) => d.totalMin <= dailyLimit).length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            7-Day Usage Trends
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click on any day bar to inspect its hourly and app breakdown
          </p>
        </div>

        {/* Weekly overview chips */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">Daily Average:</span>
            <span className="font-bold text-white">{formatMinutes(avgDailyMinutes)}</span>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs text-emerald-400 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{daysUnderGoal}/7 days on goal</span>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-800">
        {weekDays.map((day) => {
          const heightPercent = maxDayMinutes > 0 ? (day.totalMin / maxDayMinutes) * 100 : 0;
          const isSelected = day.dateStr === selectedDate;
          const isOverGoal = day.totalMin > dailyLimit;

          return (
            <div
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer"
            >
              {/* Value on hover or selected */}
              <span
                className={`text-[11px] font-semibold mb-1 transition-opacity ${
                  isSelected ? 'text-sky-400 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                }`}
              >
                {formatMinutes(day.totalMin)}
              </span>

              {/* Stacked / Category Bar */}
              <div
                className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 relative overflow-hidden flex flex-col-reverse ${
                  isSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900' : ''
                }`}
                style={{ height: `${Math.max(12, heightPercent)}%` }}
              >
                {/* Segments for each category */}
                {(['social', 'browsing', 'productivity', 'entertainment', 'other'] as AppCategory[]).map(
                  (cat) => {
                    const catMins = day.categoryMins[cat];
                    if (catMins <= 0) return null;
                    const catHeight = (catMins / (day.totalMin || 1)) * 100;
                    return (
                      <div
                        key={cat}
                        style={{
                          height: `${catHeight}%`,
                          backgroundColor: CATEGORY_META[cat].color,
                        }}
                        className="w-full transition-all"
                        title={`${CATEGORY_META[cat].label}: ${formatMinutes(catMins)}`}
                      />
                    );
                  }
                )}
              </div>

              {/* Day Label */}
              <div className="mt-2.5 text-center">
                <span
                  className={`text-xs block font-bold transition-colors ${
                    isSelected ? 'text-sky-400' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {day.dayLabel}
                </span>
                <span className="text-[10px] text-slate-400 block">{day.fullDateLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly highlights footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2.5 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Highest Usage Day</span>
            <span className="text-slate-200 font-semibold">
              {peakDay.dayLabel} ({formatMinutes(peakDay.totalMin)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
          <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Weekly Total</span>
            <span className="text-slate-200 font-semibold">{formatMinutes(totalWeekMinutes)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
          <CalendarCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[11px]">Consistency Score</span>
            <span className="text-slate-200 font-semibold">
              {Math.round((daysUnderGoal / 7) * 100)}% Under Budget
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
