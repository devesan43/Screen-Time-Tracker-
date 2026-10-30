import React from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TimeframeMode } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Clock, BarChart3, CalendarDays, TrendingUp, Sparkles } from 'lucide-react';

export const TimeframeSelector: React.FC = () => {
  const { timeframe, setTimeframe, selectedDate, setSelectedDate } = useScreenTime();

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (timeframe === 'daily') {
      d.setDate(d.getDate() - 1);
    } else if (timeframe === 'weekly') {
      d.setDate(d.getDate() - 7);
    } else if (timeframe === 'monthly') {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date(selectedDate);
    if (timeframe === 'daily') {
      d.setDate(d.getDate() + 1);
    } else if (timeframe === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else if (timeframe === 'monthly') {
      d.setMonth(d.getMonth() + 1);
    }
    const nextDateStr = d.toISOString().split('T')[0];
    if (nextDateStr <= today) {
      setSelectedDate(nextDateStr);
    }
  };

  const isToday = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  }, [selectedDate]);

  // Formatted date label
  const displayLabel = React.useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    if (timeframe === 'wellbeing') {
      return 'AI Wellbeing Plan';
    } else if (timeframe === 'trends') {
      return 'Last 30 Days (Rolling)';
    } else if (timeframe === 'daily') {
      if (isToday) return 'Today, ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (timeframe === 'weekly') {
      const end = new Date(d);
      const start = new Date(d);
      start.setDate(end.getDate() - 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }, [selectedDate, timeframe, isToday]);

  const tabs: { id: TimeframeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'daily', label: 'Daily', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'weekly', label: 'Weekly', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'monthly', label: 'Monthly', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { id: 'trends', label: 'Trends (30d)', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'wellbeing', label: 'AI Wellbeing', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
      {/* Timeframe Tabs */}
      <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
        {tabs.map((tab) => {
          const isActive = timeframe === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between sm:justify-end gap-2">
        <div className="flex items-center bg-slate-950/70 px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={handlePrev}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 text-xs font-semibold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="min-w-[120px] text-center">{displayLabel}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={isToday}
            className={`p-1 rounded-lg transition ${
              isToday
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!isToday && (
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 text-sky-400 hover:bg-slate-700 transition border border-slate-700"
          >
            Today
          </button>
        )}
      </div>
    </div>
  );
};
