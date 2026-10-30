import React from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, CATEGORY_META, formatMinutes } from '../data/mockUsageData';
import { AppCategory } from '../types';
import { Smartphone, Bell, Flame, Award, ArrowDownRight, ArrowUpRight, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScreenTimeOverview: React.FC = () => {
  const {
    currentDayRecord,
    history,
    selectedDate,
    timeframe,
    setTimeframe,
    categoryFilter,
    setCategoryFilter,
    limits,
  } = useScreenTime();

  // Find yesterday's date
  const prevDateStr = React.useMemo(() => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() - 1);
    return cur.toISOString().split('T')[0];
  }, [selectedDate]);

  const prevDayRecord = history[prevDateStr];

  // Calculate category totals
  const categoryTotals = React.useMemo(() => {
    const totals: Record<AppCategory, number> = {
      social: 0,
      browsing: 0,
      productivity: 0,
      entertainment: 0,
      other: 0,
    };

    TRACKED_APPS.forEach((app) => {
      const usage = currentDayRecord.apps[app.id]?.minutes || 0;
      totals[app.category] += usage;
    });

    return totals;
  }, [currentDayRecord]);

  const totalMinutes = currentDayRecord.totalMinutes;
  const prevTotalMinutes = prevDayRecord ? prevDayRecord.totalMinutes : totalMinutes;
  const diffMinutes = totalMinutes - prevTotalMinutes;
  const isReduced = diffMinutes <= 0;

  // Daily screen time goal limit
  const totalGoalLimit = limits.find((l) => l.targetType === 'total')?.limitMinutes || 240;
  const goalPercentage = Math.min(100, Math.round((totalMinutes / totalGoalLimit) * 100));

  // Trigger celebratory confetti when under goal at end of day or clicking achievement
  const handleCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#34d399', '#f472b6'],
    });
  };

  // Circular gauge calculations
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment arcs for the category donut
  const totalCategoryMinutes = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
  const categories: AppCategory[] = ['social', 'browsing', 'productivity', 'entertainment', 'other'];

  let accumulatedPercent = 0;
  const segments = categories.map((cat) => {
    const mins = categoryTotals[cat];
    const fraction = mins / totalCategoryMinutes;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;

    return {
      cat,
      mins,
      fraction,
      meta: CATEGORY_META[cat],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
      {/* Background glow orbs */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            {timeframe === 'wellbeing'
              ? 'Gemini Digital Wellbeing Coach'
              : timeframe === 'trends'
              ? '30-Day Trend Analysis'
              : timeframe === 'daily'
              ? "Today's Digital Wellbeing"
              : `${timeframe} Summary`}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Screen Time
            {totalMinutes <= totalGoalLimit && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Under Target
              </span>
            )}
          </h2>
        </div>

        {/* Action badges: AI Wellbeing, 30d Trends Shortcut & Comparison badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {timeframe !== 'wellbeing' && (
            <button
              onClick={() => setTimeframe('wellbeing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition shadow-sm"
              title="Get personalized advice with Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Wellbeing</span>
            </button>
          )}

          {timeframe !== 'trends' && (
            <button
              onClick={() => setTimeframe('trends')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 transition shadow-sm"
              title="Explore 30-day Social vs Productivity trends with Recharts"
            >
              <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
              <span>30d Trends</span>
            </button>
          )}

          {timeframe === 'daily' && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                isReduced
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {isReduced ? (
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              )}
              <span>
                {Math.abs(diffMinutes) === 0
                  ? 'Same as yesterday'
                  : `${formatMinutes(Math.abs(diffMinutes))} ${isReduced ? 'less' : 'more'}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Ring Visualizer */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
              {/* Background track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />

              {/* Render segmented rings */}
              {segments.map((seg) => {
                if (seg.mins <= 0) return null;
                const isSelected = categoryFilter === 'all' || categoryFilter === seg.cat;
                return (
                  <circle
                    key={seg.cat}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={seg.meta.color}
                    strokeWidth={isSelected ? strokeWidth : strokeWidth - 4}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 cursor-pointer"
                    opacity={isSelected ? 1 : 0.25}
                    onClick={() => setCategoryFilter(categoryFilter === seg.cat ? 'all' : seg.cat)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Content */}
            <div className="absolute flex flex-col items-center justify-center text-center p-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {formatMinutes(totalMinutes)}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-0.5">
                of {formatMinutes(totalGoalLimit)} goal
              </span>

              {/* Mini goal progress line */}
              <div className="w-20 bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    goalPercentage > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-400 to-indigo-500'
                  }`}
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-1">
            <p className="text-xs text-slate-400">
              Goal usage: <span className="text-slate-200 font-semibold">{goalPercentage}%</span>
            </p>
          </div>
        </div>

        {/* Right side: Detailed category chips & Mobile device stats */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {/* Quick Metrics Grid (Unlocks, Pickups, First pickup) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Pickups</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">
                {currentDayRecord.pickups}
              </span>
              <span className="text-[10px] text-slate-400">~{Math.round(totalMinutes / (currentDayRecord.pickups || 1))}m / session</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Notifications</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">
                {Object.values(currentDayRecord.apps).reduce((s, a) => s + (a.notifications || 0), 0)}
              </span>
              <span className="text-[10px] text-slate-400">received today</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex flex-col">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>First Unlock</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white truncate">
                {currentDayRecord.firstPickup}
              </span>
              <span className="text-[10px] text-emerald-400/90 font-medium">Morning wake</span>
            </div>
          </div>

          {/* Interactive Category Breakdown List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span>Category Breakdown</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`text-[11px] hover:underline ${
                  categoryFilter !== 'all' ? 'text-sky-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {categoryFilter !== 'all' ? 'Reset Filter' : 'All Categories'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const mins = categoryTotals[cat];
                const meta = CATEGORY_META[cat];
                const percent = totalCategoryMinutes ? Math.round((mins / totalCategoryMinutes) * 100) : 0;
                const isSelected = categoryFilter === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(isSelected ? 'all' : cat)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `${meta.tailwindBg} ${meta.tailwindBorder} ring-2 ring-sky-500/40`
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: meta.color }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {meta.label}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatMinutes(mins)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 ml-1">
                      {percent}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Habit badge banner */}
          <div
            onClick={handleCelebration}
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 cursor-pointer hover:border-indigo-600/60 transition group"
          >
            <div className="flex items-center gap-2.5 text-xs text-indigo-200">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>
                <strong className="text-white">Streak: 6 days</strong> staying under your 4h 30m daily screen goal!
              </span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-300 underline shrink-0">
              Celebrate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
