import React, { useState } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, CATEGORY_META, formatMinutes } from '../data/mockUsageData';
import { AppIcon } from './AppIcon';
import { TrackedApp } from '../types';
import {
  Search,
  Sliders,
  Play,
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Smartphone,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const AppList: React.FC = () => {
  const {
    currentDayRecord,
    categoryFilter,
    setCategoryFilter,
    limits,
    setSelectedAppForDetail,
    liveTracking,
    startLiveTracking,
    stopLiveTracking,
    addUsageMinutes,
  } = useScreenTime();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter apps by category and search
  const filteredApps = React.useMemo(() => {
    return TRACKED_APPS.filter((app) => {
      const matchCat = categoryFilter === 'all' || app.category === categoryFilter;
      const matchSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }).sort((a, b) => {
      const minA = currentDayRecord.apps[a.id]?.minutes || 0;
      const minB = currentDayRecord.apps[b.id]?.minutes || 0;
      return minB - minA; // highest usage first
    });
  }, [categoryFilter, searchQuery, currentDayRecord]);

  const totalDayMinutes = currentDayRecord.totalMinutes || 1;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
      {/* Top Controls: Title, Search, Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            App Screen Time Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor social networks, mobile browsers, and system tools
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Instagram, Chrome..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === 'all'
              ? 'bg-white text-slate-950 font-bold shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All Apps ({TRACKED_APPS.length})
        </button>

        <button
          onClick={() => setCategoryFilter('social')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            categoryFilter === 'social'
              ? 'bg-pink-500 text-white font-bold shadow-md shadow-pink-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-pink-400" />
          Social Media (Insta, FB, WA)
        </button>

        <button
          onClick={() => setCategoryFilter('browsing')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            categoryFilter === 'browsing'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          Browsing (Chrome, Firefox)
        </button>

        <button
          onClick={() => setCategoryFilter('productivity')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            categoryFilter === 'productivity'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Productivity
        </button>

        <button
          onClick={() => setCategoryFilter('entertainment')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            categoryFilter === 'entertainment'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Entertainment
        </button>
      </div>

      {/* App Rows */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No apps found matching your query.
          </div>
        ) : (
          filteredApps.map((app) => {
            const usage = currentDayRecord.apps[app.id] || {
              minutes: 0,
              opens: 0,
              notifications: 0,
            };
            const appLimit = limits.find((l) => l.targetId === app.id);
            const limitMinutes = appLimit ? appLimit.limitMinutes : null;
            const percentOfTotal = Math.round((usage.minutes / totalDayMinutes) * 100);

            // Limit calculation
            let limitProgress = 0;
            let isOverLimit = false;
            let isNearLimit = false;

            if (limitMinutes && appLimit?.enabled) {
              limitProgress = Math.min(100, Math.round((usage.minutes / limitMinutes) * 100));
              isOverLimit = usage.minutes >= limitMinutes;
              isNearLimit = usage.minutes >= limitMinutes * 0.8 && !isOverLimit;
            }

            const isCurrentlyTracking = liveTracking.isActive && liveTracking.appId === app.id;

            return (
              <div
                key={app.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                  isCurrentlyTracking
                    ? 'bg-sky-950/30 border-sky-500/50 ring-1 ring-sky-500/50'
                    : isOverLimit
                    ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                    : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: App Icon + Name + Package */}
                  <div
                    onClick={() => setSelectedAppForDetail(app)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <div className="relative shrink-0">
                      <AppIcon appId={app.id} size="md" />
                      {isCurrentlyTracking && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white group-hover:text-sky-400 transition truncate">
                          {app.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden sm:inline-block ${
                            CATEGORY_META[app.category].tailwindBg
                          } ${CATEGORY_META[app.category].tailwindText} ${
                            CATEGORY_META[app.category].tailwindBorder
                          }`}
                        >
                          {CATEGORY_META[app.category].label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-slate-400" />
                          {usage.opens} opens
                        </span>
                        <span className="flex items-center gap-1">
                          <Bell className="w-3 h-3 text-slate-400" />
                          {usage.notifications} notifs
                        </span>
                        <span className="text-slate-400 font-mono text-[10px] hidden md:inline truncate">
                          {app.packageName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Custom Limit Progress Bar */}
                  <div className="hidden lg:flex flex-col w-44 shrink-0 px-2">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400">
                        {limitMinutes ? `Limit: ${formatMinutes(limitMinutes)}` : 'No limit set'}
                      </span>
                      {limitMinutes && (
                        <span
                          className={`font-semibold ${
                            isOverLimit
                              ? 'text-rose-400'
                              : isNearLimit
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {limitProgress}%
                        </span>
                      )}
                    </div>
                    {limitMinutes ? (
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverLimit
                              ? 'bg-rose-500'
                              : isNearLimit
                              ? 'bg-amber-400'
                              : 'bg-sky-400'
                          }`}
                          style={{ width: `${limitProgress}%` }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedAppForDetail(app)}
                        className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" /> Set Daily Limit
                      </button>
                    )}
                  </div>

                  {/* Right: Usage Time & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-extrabold text-white">
                        {formatMinutes(usage.minutes)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {percentOfTotal}% of day
                      </div>
                    </div>

                    {/* Quick Live Tracking toggle for this app */}
                    <div className="flex items-center gap-1.5">
                      {isCurrentlyTracking ? (
                        <button
                          onClick={stopLiveTracking}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition"
                          title="Stop tracking session"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span className="hidden sm:inline">Pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => startLiveTracking(app.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition"
                          title="Simulate opening and using this app live"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-sky-400" />
                          <span className="hidden sm:inline">Track</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAppForDetail(app)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="View detailed hourly analytics & configure limit"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status alert pill if over limit */}
                {isOverLimit && (
                  <div className="mt-2.5 pt-2 border-t border-rose-900/40 flex items-center justify-between text-xs text-rose-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Daily usage limit exceeded by{' '}
                      <strong>{formatMinutes(usage.minutes - (limitMinutes || 0))}</strong>!
                    </span>
                    <button
                      onClick={() => setSelectedAppForDetail(app)}
                      className="underline hover:text-rose-300 text-[11px]"
                    >
                      Adjust Limit
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
