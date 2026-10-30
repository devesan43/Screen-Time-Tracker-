import React, { useState, useMemo } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, CATEGORY_META, formatMinutes } from '../data/mockUsageData';
import { AppCategory, TrackedApp } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import * as d3 from 'd3';
import {
  TrendingUp,
  Zap,
  Activity,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface DayTrendPoint {
  dateStr: string;
  displayDate: string;
  dayOfWeek: string;
  socialMinutes: number;
  prodMinutes: number;
  browsingMinutes: number;
  ratio: number;
  socialMovingAvg: number;
  prodMovingAvg: number;
  isSpike: boolean;
  spikeMagnitude: number; // percentage above mean
  topSocialApp: { name: string; minutes: number; color: string };
  topProdApp: { name: string; minutes: number; color: string };
  totalMinutes: number;
}

export const TrendsAnalysis: React.FC = () => {
  const { history, setSelectedDate, setTimeframe } = useScreenTime();

  const [viewMode, setViewMode] = useState<'area' | 'ratio' | 'stacked'>('area');
  const [showMovingAvg, setShowMovingAvg] = useState(false);
  const [highlightSpikes, setHighlightSpikes] = useState(true);
  const [selectedSpikeDay, setSelectedSpikeDay] = useState<string | null>(null);

  // Group apps by category
  const socialApps = useMemo(
    () => TRACKED_APPS.filter((a) => a.category === 'social'),
    []
  );
  const prodApps = useMemo(
    () => TRACKED_APPS.filter((a) => a.category === 'productivity'),
    []
  );
  const browsingApps = useMemo(
    () => TRACKED_APPS.filter((a) => a.category === 'browsing'),
    []
  );

  // Sorted list of dates for the last 30 days
  const sortedDates = useMemo(() => {
    return Object.keys(history).sort();
  }, [history]);

  // Compute 30-day data points using D3 statistical utilities
  const trendData: DayTrendPoint[] = useMemo(() => {
    if (sortedDates.length === 0) return [];

    // First pass: extract raw minutes
    const rawList = sortedDates.map((dateStr) => {
      const rec = history[dateStr] || { totalMinutes: 0, apps: {} };
      const d = new Date(dateStr + 'T00:00:00');

      let socialTotal = 0;
      let prodTotal = 0;
      let browsingTotal = 0;

      let topSocial = { name: 'Instagram', minutes: 0, color: '#ec4899' };
      let topProd = { name: 'Slack', minutes: 0, color: '#10b981' };

      socialApps.forEach((app) => {
        const m = rec.apps[app.id]?.minutes || 0;
        socialTotal += m;
        if (m > topSocial.minutes) {
          topSocial = { name: app.name, minutes: m, color: app.color };
        }
      });

      prodApps.forEach((app) => {
        const m = rec.apps[app.id]?.minutes || 0;
        prodTotal += m;
        if (m > topProd.minutes) {
          topProd = { name: app.name, minutes: m, color: app.color };
        }
      });

      browsingApps.forEach((app) => {
        browsingTotal += rec.apps[app.id]?.minutes || 0;
      });

      const ratio = prodTotal > 0 ? parseFloat((socialTotal / prodTotal).toFixed(2)) : socialTotal > 0 ? 5.0 : 1.0;

      return {
        dateStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        socialMinutes: socialTotal,
        prodMinutes: prodTotal,
        browsingMinutes: browsingTotal,
        ratio,
        topSocialApp: topSocial,
        topProdApp: topProd,
        totalMinutes: rec.totalMinutes || (socialTotal + prodTotal + browsingTotal),
      };
    });

    // Statistical analysis using D3
    const socialValues = rawList.map((d) => d.socialMinutes);
    const meanSocial = d3.mean(socialValues) || 120;
    const stdDevSocial = d3.deviation(socialValues) || 30;

    // A "spike" is defined when social usage exceeds mean + 1.15 * stdDev (top statistical outliers)
    const spikeThreshold = meanSocial + 1.15 * stdDevSocial;

    // Moving average helper (7-day window)
    const windowSize = 7;

    return rawList.map((item, idx) => {
      const start = Math.max(0, idx - Math.floor(windowSize / 2));
      const end = Math.min(rawList.length, idx + Math.ceil(windowSize / 2));
      const windowItems = rawList.slice(start, end);

      const socialAvg = Math.round(d3.mean(windowItems, (d) => d.socialMinutes) || item.socialMinutes);
      const prodAvg = Math.round(d3.mean(windowItems, (d) => d.prodMinutes) || item.prodMinutes);

      const isSpike = item.socialMinutes >= spikeThreshold && item.socialMinutes > 130;
      const spikeMagnitude = Math.round(((item.socialMinutes - meanSocial) / meanSocial) * 100);

      return {
        ...item,
        socialMovingAvg: socialAvg,
        prodMovingAvg: prodAvg,
        isSpike,
        spikeMagnitude,
      };
    });
  }, [sortedDates, history, socialApps, prodApps, browsingApps]);

  // Aggregate Metrics for Top Cards
  const totalSocialMin = useMemo(() => d3.sum(trendData, (d) => d.socialMinutes), [trendData]);
  const totalProdMin = useMemo(() => d3.sum(trendData, (d) => d.prodMinutes), [trendData]);
  const avgSocialDaily = Math.round(d3.mean(trendData, (d) => d.socialMinutes) || 0);
  const avgProdDaily = Math.round(d3.mean(trendData, (d) => d.prodMinutes) || 0);
  const detectedSpikes = useMemo(() => trendData.filter((d) => d.isSpike), [trendData]);
  const overallRatio = totalProdMin > 0 ? (totalSocialMin / totalProdMin).toFixed(1) : '1.0';

  // Navigate to specific day
  const handleInspectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setTimeframe('daily');
  };

  // Custom Glassmorphic Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DayTrendPoint;
      const isSpike = dataPoint.isSpike;

      return (
        <div className="rounded-2xl bg-slate-900/95 border border-slate-700/80 p-4 shadow-2xl backdrop-blur-xl text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-3 mb-2 border-b border-slate-800 pb-2">
            <div>
              <span className="font-extrabold text-white text-sm block">
                {dataPoint.dayOfWeek}, {dataPoint.displayDate}
              </span>
              <span className="text-[11px] text-slate-400">
                Total Screen Time: {formatMinutes(dataPoint.totalMinutes)}
              </span>
            </div>

            {isSpike && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse">
                <Zap className="w-3 h-3 fill-current text-rose-400" /> Spike
              </span>
            )}
          </div>

          <div className="space-y-2 mb-3">
            {/* Social item */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-pink-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                Social Media:
              </span>
              <span className="font-bold text-white text-sm">
                {formatMinutes(dataPoint.socialMinutes)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
              Top app: <span className="text-slate-200 font-medium">{dataPoint.topSocialApp.name}</span> ({formatMinutes(dataPoint.topSocialApp.minutes)})
            </div>

            {/* Productivity item */}
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Productivity:
              </span>
              <span className="font-bold text-white text-sm">
                {formatMinutes(dataPoint.prodMinutes)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pl-4">
              Top app: <span className="text-slate-200 font-medium">{dataPoint.topProdApp.name}</span> ({formatMinutes(dataPoint.topProdApp.minutes)})
            </div>
          </div>

          {/* Tradeoff / Ratio note */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
            {dataPoint.socialMinutes > dataPoint.prodMinutes * 2 ? (
              <span className="text-amber-400 font-medium">
                ⚡ Distraction ratio: {dataPoint.ratio}x social vs work
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                ✓ Balanced focus day: 1:{dataPoint.ratio} ratio
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Trends Container Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> 30-Day Trend Analytics
              </span>
              <span className="text-[10px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full">
                D3 + Recharts
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Social Media Activity vs Productivity Patterns
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizes 30-day surges in Instagram/TikTok/WhatsApp usage contrasted against work tools (Gmail, Slack)
            </p>
          </div>

          {/* Interactive Mode & Display Switches */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Pills */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('area')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'area'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Volume Area
              </button>
              <button
                onClick={() => setViewMode('ratio')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'ratio'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Distraction Ratio
              </button>
              <button
                onClick={() => setViewMode('stacked')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  viewMode === 'stacked'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Category Bars
              </button>
            </div>

            {/* Moving Average Toggle */}
            <button
              onClick={() => setShowMovingAvg(!showMovingAvg)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                showMovingAvg
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="7-Day Moving Average trend smoothing"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>7d Smoothing</span>
            </button>

            {/* Spike Markers Toggle */}
            <button
              onClick={() => setHighlightSpikes(!highlightSpikes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                highlightSpikes
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Highlight detected spikes on chart"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Spikes ({detectedSpikes.length})</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 relative z-10">
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-pink-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-pink-400 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> Social Media Total
              </span>
              <span className="text-[10px] text-slate-400 font-normal">30 Days</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatMinutes(totalSocialMin)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Avg <strong className="text-pink-300">{formatMinutes(avgSocialDaily)}</strong> / day
            </span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Productivity Total
              </span>
              <span className="text-[10px] text-slate-400 font-normal">30 Days</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {formatMinutes(totalProdMin)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Avg <strong className="text-emerald-300">{formatMinutes(avgProdDaily)}</strong> / day
            </span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-rose-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-rose-400 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" /> Spikes Detected
              </span>
              <span className="text-[10px] text-rose-400 font-bold">&gt;130m</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight">
              {detectedSpikes.length} Surge Days
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Avg <strong className="text-rose-300">+{d3.mean(detectedSpikes, (d) => d.spikeMagnitude) || 0}%</strong> above baseline
            </span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-indigo-400 mb-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Distraction Index
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Social:Work</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-tight">
              1 : {overallRatio}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              Social outweighs productivity by <strong className="text-white">{overallRatio}x</strong>
            </span>
          </div>
        </div>

        {/* Recharts Visualization Canvas */}
        <div className="w-full h-80 sm:h-96 relative z-10 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'area' ? (
              <ComposedChart data={trendData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {/* Pink gradient for social */}
                  <linearGradient id="socialGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
                  </linearGradient>

                  {/* Emerald gradient for productivity */}
                  <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={Math.floor(trendData.length / 8)}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${Math.round(val / 60)}h`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                />

                {/* Social Media Area */}
                <Area
                  type="monotone"
                  name="Social Media (Insta, WA, FB)"
                  dataKey="socialMinutes"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  fill="url(#socialGradient)"
                />

                {/* Productivity Area */}
                <Area
                  type="monotone"
                  name="Productivity (Slack, Gmail)"
                  dataKey="prodMinutes"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#prodGradient)"
                />

                {/* 7-day Moving Average lines when enabled */}
                {showMovingAvg && (
                  <>
                    <Line
                      type="monotone"
                      name="Social 7d Trend"
                      dataKey="socialMovingAvg"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      name="Productivity 7d Trend"
                      dataKey="prodMovingAvg"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}

                {/* Highlight Spikes as Dots on Top */}
                {highlightSpikes &&
                  detectedSpikes.map((spike) => (
                    <ReferenceDot
                      key={spike.dateStr}
                      x={spike.displayDate}
                      y={spike.socialMinutes}
                      r={6}
                      fill="#f43f5e"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
              </ComposedChart>
            ) : viewMode === 'ratio' ? (
              <ComposedChart data={trendData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ratioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}x`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }} />

                {/* Healthy baseline line: 1.0 */}
                <ReferenceLine
                  y={1.0}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: '1:1 Balanced Baseline', fill: '#10b981', fontSize: 11, position: 'right' }}
                />

                <Area
                  type="monotone"
                  name="Distraction Ratio (Social / Productivity)"
                  dataKey="ratio"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fill="url(#ratioGrad)"
                />
              </ComposedChart>
            ) : (
              <ComposedChart data={trendData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }} />

                <Bar
                  name="Social Media"
                  dataKey="socialMinutes"
                  stackId="a"
                  fill="#ec4899"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  name="Productivity"
                  dataKey="prodMinutes"
                  stackId="a"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  name="Web Browsing"
                  dataKey="browsingMinutes"
                  stackId="a"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Explanation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50" />
              <span>Social Media Volume</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Productivity Volume</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
              <span>Spike Incursion (&gt;1.15σ above normal)</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Hover over any point to inspect detailed app culprits and distraction quotients.
          </span>
        </div>
      </div>

      {/* Spike Incident Log & Behavioral Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Spike Outliers in the past 30 days */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400" />
                Detected Social Media Spikes ({detectedSpikes.length})
              </h3>
              <p className="text-xs text-slate-400">
                Days where social media usage dramatically suppressed productive apps
              </p>
            </div>
            <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Outlier Analysis
            </span>
          </div>

          <div className="space-y-3">
            {detectedSpikes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No high-distraction spikes detected in this 30-day period. Well done!
              </div>
            ) : (
              detectedSpikes.map((spike) => (
                <div
                  key={spike.dateStr}
                  className="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-rose-500/40 transition group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex flex-col items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 fill-current" />
                      <span className="text-[9px] font-extrabold uppercase">{spike.dayOfWeek}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-rose-300 transition">
                          {spike.displayDate}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">
                          +{spike.spikeMagnitude}% spike
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>
                          Social: <strong className="text-pink-400">{formatMinutes(spike.socialMinutes)}</strong>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>
                          Work: <strong className="text-emerald-400">{formatMinutes(spike.prodMinutes)}</strong>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[11px] text-slate-400">
                          Primary: <span className="text-slate-200">{spike.topSocialApp.name}</span> ({formatMinutes(spike.topSocialApp.minutes)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInspectDay(spike.dateStr)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition border border-slate-700 group-hover:border-transparent shrink-0"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Behavioral Insights & Recommendations */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Productivity Tradeoff Insights
            </div>
            <p className="text-xs text-slate-400">
              Correlations derived from 30 days of phone usage
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Insight 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">The Weekend Inversion Effect</strong>
                On Saturdays and Sundays, social media time jumps by an average of{' '}
                <span className="text-rose-400 font-bold">+72%</span> while productivity applications decline by{' '}
                <span className="text-amber-400 font-bold">-65%</span>.
              </div>
            </div>

            {/* Insight 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Primary Distraction Culprit</strong>
                Instagram Reels and WhatsApp account for over{' '}
                <span className="text-pink-400 font-bold">64%</span> of all spikes detected in the last month.
              </div>
            </div>

            {/* Insight 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">High Focus Days</strong>
                Tuesdays and Thursdays consistently maintain the cleanest 1:1 focus-to-social ratio with zero limit violations.
              </div>
            </div>
          </div>

          {/* Actionable Prompt */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/40 text-xs">
            <span className="text-white font-semibold block mb-1">
              Want to eliminate future spikes?
            </span>
            <p className="text-slate-300 text-[11px] mb-2">
              Set a 45m hard block limit on Instagram and enable Bedtime Wind-Down starting at 10:30 PM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
