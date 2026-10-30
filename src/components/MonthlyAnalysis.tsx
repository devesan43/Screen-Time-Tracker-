import React from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, CATEGORY_META, formatMinutes } from '../data/mockUsageData';
import { AppCategory } from '../types';
import { CalendarDays, Flame, Award, PieChart, Sparkles } from 'lucide-react';

export const MonthlyAnalysis: React.FC = () => {
  const { history, selectedDate, setSelectedDate, categoryFilter, limits } = useScreenTime();

  // Sort history dates in ascending order
  const allDates = React.useMemo(() => {
    return Object.keys(history).sort();
  }, [history]);

  // Aggregate stats across all historical records
  const monthStats = React.useMemo(() => {
    let totalMinutes = 0;
    let totalPickups = 0;
    let bestDay = { date: '', minutes: Infinity };
    let peakDay = { date: '', minutes: 0 };
    const categoryTotals: Record<AppCategory, number> = {
      social: 0,
      browsing: 0,
      productivity: 0,
      entertainment: 0,
      other: 0,
    };

    allDates.forEach((dateStr) => {
      const rec = history[dateStr];
      if (!rec) return;

      let dayFilteredMin = 0;
      TRACKED_APPS.forEach((app) => {
        const m = rec.apps[app.id]?.minutes || 0;
        categoryTotals[app.category] += m;
        if (categoryFilter === 'all' || categoryFilter === app.category) {
          dayFilteredMin += m;
        }
      });

      totalMinutes += dayFilteredMin;
      totalPickups += rec.pickups || 0;

      if (dayFilteredMin < bestDay.minutes && dayFilteredMin > 0) {
        bestDay = { date: dateStr, minutes: dayFilteredMin };
      }
      if (dayFilteredMin > peakDay.minutes) {
        peakDay = { date: dateStr, minutes: dayFilteredMin };
      }
    });

    const dayCount = Math.max(1, allDates.length);
    const avgDaily = Math.round(totalMinutes / dayCount);

    return {
      totalMinutes,
      totalPickups,
      avgDaily,
      bestDay,
      peakDay,
      dayCount,
      categoryTotals,
    };
  }, [allDates, history, categoryFilter]);

  const dailyLimit = limits.find((l) => l.targetType === 'total')?.limitMinutes || 240;

  // Heatmap intensity helper
  const getCellColor = (minutes: number, isSelected: boolean) => {
    if (minutes === 0) return 'bg-slate-800/40 text-slate-500';
    if (minutes > dailyLimit * 1.25) {
      return isSelected ? 'bg-rose-500 text-white ring-2 ring-white' : 'bg-rose-500/70 text-rose-100 hover:bg-rose-500';
    }
    if (minutes > dailyLimit) {
      return isSelected ? 'bg-amber-500 text-slate-950 ring-2 ring-white' : 'bg-amber-500/70 text-amber-100 hover:bg-amber-500';
    }
    if (minutes > dailyLimit * 0.7) {
      return isSelected ? 'bg-sky-500 text-slate-950 ring-2 ring-white' : 'bg-sky-500/70 text-sky-100 hover:bg-sky-500';
    }
    return isSelected ? 'bg-emerald-500 text-slate-950 ring-2 ring-white' : 'bg-emerald-500/60 text-emerald-100 hover:bg-emerald-500';
  };

  const totalCatMins = Object.values(monthStats.categoryTotals).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-400" />
            30-Day Activity Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any day to jump to its detailed timeline & usage report
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/70" />
            <span>On Goal</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/70" />
            <span>Near Limit</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/70" />
            <span>Over</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 mb-6">
        {allDates.map((dateStr) => {
          const rec = history[dateStr];
          const isSelected = dateStr === selectedDate;
          const d = new Date(dateStr + 'T00:00:00');
          const dayNum = d.getDate();
          const monthShort = d.toLocaleDateString('en-US', { month: 'short' });

          let mins = 0;
          if (rec) {
            TRACKED_APPS.forEach((app) => {
              if (categoryFilter === 'all' || categoryFilter === app.category) {
                mins += rec.apps[app.id]?.minutes || 0;
              }
            });
          }

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-between transition-all aspect-square border border-slate-700/40 ${getCellColor(
                mins,
                isSelected
              )}`}
              title={`${dateStr}: ${formatMinutes(mins)}`}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                {monthShort}
              </div>
              <div className="text-base font-extrabold">{dayNum}</div>
              <div className="text-[10px] font-semibold truncate w-full">
                {mins > 0 ? formatMinutes(mins) : '0m'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Monthly Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block mb-1">Monthly Total Screen Time</span>
          <span className="text-xl font-bold text-white block">
            {formatMinutes(monthStats.totalMinutes)}
          </span>
          <span className="text-[10px] text-slate-400">Across {monthStats.dayCount} tracked days</span>
        </div>

        <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block mb-1">Daily Average</span>
          <span className="text-xl font-bold text-sky-400 block">
            {formatMinutes(monthStats.avgDaily)}
          </span>
          <span className="text-[10px] text-slate-400">Goal: {formatMinutes(dailyLimit)}</span>
        </div>

        <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> Best Day
          </span>
          <span className="text-lg font-bold text-emerald-400 block truncate">
            {monthStats.bestDay.date ? monthStats.bestDay.date : '--'}
          </span>
          <span className="text-[10px] text-slate-400">
            {monthStats.bestDay.minutes < Infinity ? formatMinutes(monthStats.bestDay.minutes) : '0m'}
          </span>
        </div>

        <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
          <span className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Total Phone Pickups
          </span>
          <span className="text-xl font-bold text-amber-300 block">
            {monthStats.totalPickups}
          </span>
          <span className="text-[10px] text-slate-400">
            ~{Math.round(monthStats.totalPickups / monthStats.dayCount)} pickups / day
          </span>
        </div>
      </div>

      {/* Monthly Category Distribution Bar */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
          <span className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-sky-400" /> 30-Day Category Share
          </span>
          <span className="text-slate-400">100% of tracked time</span>
        </div>

        {/* Multi-segment bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
          {(['social', 'browsing', 'productivity', 'entertainment', 'other'] as AppCategory[]).map(
            (cat) => {
              const mins = monthStats.categoryTotals[cat];
              const pct = (mins / totalCatMins) * 100;
              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%`, backgroundColor: CATEGORY_META[cat].color }}
                  className="h-full transition-all"
                  title={`${CATEGORY_META[cat].label}: ${formatMinutes(mins)} (${Math.round(pct)}%)`}
                />
              );
            }
          )}
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          {(['social', 'browsing', 'productivity', 'entertainment', 'other'] as AppCategory[]).map(
            (cat) => {
              const mins = monthStats.categoryTotals[cat];
              const pct = Math.round((mins / totalCatMins) * 100);
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[cat].color }}
                  />
                  <span className="text-slate-300 font-medium">{CATEGORY_META[cat].label}</span>
                  <span className="text-slate-400">({pct}%)</span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
