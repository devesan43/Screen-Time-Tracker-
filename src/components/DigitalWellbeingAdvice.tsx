import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScreenTime } from '../context/ScreenTimeContext';
import { TRACKED_APPS, formatMinutes } from '../data/mockUsageData';
import { AppIcon } from './AppIcon';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Circle,
  RefreshCw,
  Award,
  Clock,
  HeartHandshake,
  Lightbulb,
  Moon,
  Smartphone,
  Check,
  Target,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '../utils/audioAlert';

interface BehavioralTrigger {
  app: string;
  trigger: string;
  frictionFix: string;
}

interface ActionableTip {
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'quick_win';
}

interface DailyCurfew {
  app: string;
  recommendedLimitMinutes: number;
  reason: string;
}

interface MicroChallenge {
  title: string;
  steps: string[];
}

interface WellbeingAdviceData {
  healthScore: number;
  summary: string;
  behavioralTriggers: BehavioralTrigger[];
  actionableTips: ActionableTip[];
  dailyCurfews: DailyCurfew[];
  microChallenge: MicroChallenge;
}

export const DigitalWellbeingAdvice: React.FC = () => {
  const {
    currentDayRecord,
    history,
    limits,
    updateLimit,
    addLimit,
    bedtime,
    updateBedtime,
  } = useScreenTime();

  const [advice, setAdvice] = useState<WellbeingAdviceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [appliedLimits, setAppliedLimits] = useState<Record<string, boolean>>({});
  const [challengeSteps, setChallengeSteps] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('chronos_wellbeing_challenge_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  // Calculate top high-usage apps today
  const highUsageApps = useMemo(() => {
    return TRACKED_APPS.map((app) => {
      const usage = currentDayRecord.apps[app.id] || { minutes: 0, opens: 0 };
      return {
        id: app.id,
        name: app.name,
        category: app.category,
        minutes: usage.minutes,
        opens: usage.opens,
      };
    })
      .filter((a) => a.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  }, [currentDayRecord]);

  // Fetch advice from server-side Gemini route
  const fetchWellbeingAdvice = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        highUsageApps,
        totalScreenTimeMinutes: currentDayRecord.totalMinutes,
        pickups: currentDayRecord.pickups,
        goalMinutes: limits.find((l) => l.targetType === 'total')?.limitMinutes || 240,
        detectedSpikesCount: 3,
        focusRatio: '1:2.4',
      };

      const res = await fetch('/api/wellbeing/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to generate advice');
      }

      const data = await res.json();
      setAdvice(data);
    } catch (err) {
      console.error('Error fetching wellbeing advice:', err);
    } finally {
      setLoading(false);
    }
  }, [highUsageApps, currentDayRecord, limits]);

  // Auto fetch on first load
  useEffect(() => {
    fetchWellbeingAdvice();
  }, [fetchWellbeingAdvice]);

  // Save challenge progress
  const toggleStep = (index: number) => {
    const updated = { ...challengeSteps, [index]: !challengeSteps[index] };
    setChallengeSteps(updated);
    try {
      localStorage.setItem('chronos_wellbeing_challenge_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // If completed all steps in challenge
    if (advice && Object.values(updated).filter(Boolean).length === advice.microChallenge.steps.length) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#34d399', '#f472b6', '#a855f7'],
      });
      soundService.playSuccessChime();
    }
  };

  // 1-Click apply AI suggested limit
  const handleApplyLimit = (curfew: DailyCurfew) => {
    const targetApp = TRACKED_APPS.find(
      (a) => a.name.toLowerCase() === curfew.app.toLowerCase()
    );
    if (!targetApp) return;

    const existing = limits.find((l) => l.targetId === targetApp.id);
    if (existing) {
      updateLimit(existing.id, {
        limitMinutes: curfew.recommendedLimitMinutes,
        enabled: true,
      });
    } else {
      addLimit({
        id: `limit_${targetApp.id}`,
        targetType: 'app',
        targetId: targetApp.id,
        targetName: targetApp.name,
        limitMinutes: curfew.recommendedLimitMinutes,
        enabled: true,
        warnAt80Percent: true,
        hardBlock: true,
        soundAlert: true,
      });
    }

    setAppliedLimits((prev) => ({ ...prev, [curfew.app]: true }));
    soundService.playSuccessChime();
  };

  // Health Score Color Helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Digital Wellbeing Engine
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Powered by Gemini API
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Personalized Screen Time Reduction Plan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted behavioral coaching based on your high-usage social and browsing apps
            </p>
          </div>

          <button
            onClick={fetchWellbeingAdvice}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing with Gemini...' : 'Refresh Advice'}</span>
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && !advice && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-sky-500 animate-spin flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Gemini is analyzing your high-usage apps and screen unlock patterns...
            </p>
            <p className="text-xs text-slate-500">Formulating evidence-based digital detox recommendations</p>
          </div>
        )}

        {/* Main Content when Advice is Loaded */}
        {advice && (
          <div className="space-y-6 relative z-10">
            {/* Top Insight & Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              {/* Score circle */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-2 border-b md:border-b-0 md:border-r border-slate-800">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(advice.healthScore)}`}>
                  <span className="text-3xl font-extrabold tracking-tight">
                    {advice.healthScore}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    / 100 Score
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-200 mt-2">
                  Digital Wellbeing Index
                </span>
                <span className="text-[11px] text-slate-400">
                  {advice.healthScore >= 75 ? 'Healthy Balance' : advice.healthScore >= 50 ? 'Moderate Distraction' : 'High Screen Fatigue'}
                </span>
              </div>

              {/* Summary copy */}
              <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <Lightbulb className="w-4 h-4" />
                  <span>Executive Assessment</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {advice.summary}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                    Top Distraction: <strong>{highUsageApps[0]?.name || 'Instagram'}</strong> ({formatMinutes(highUsageApps[0]?.minutes || 0)})
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
                    Unlocks: <strong>{currentDayRecord.pickups} pickups</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Behavioral Triggers & Friction Fixes */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>Identified Habit Loops & Behavioral Friction Fixes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {advice.behavioralTriggers.map((trig, idx) => {
                  const matchedApp = TRACKED_APPS.find(
                    (a) => a.name.toLowerCase() === trig.app.toLowerCase()
                  );
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {matchedApp ? (
                            <AppIcon appId={matchedApp.id} size="sm" />
                          ) : (
                            <Smartphone className="w-7 h-7 text-sky-400 p-1 bg-slate-800 rounded-lg" />
                          )}
                        </div>

                        <div>
                          <span className="text-xs font-bold text-white block">
                            {trig.app} Habit Trigger
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {trig.trigger}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block text-[11px]">Friction Prescription:</strong>
                          <span>{trig.frictionFix}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Daily Caps with 1-Click Apply */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Target className="w-4 h-4 text-sky-400" />
                  <span>AI Recommended App Curfews</span>
                </div>
                <span className="text-xs text-slate-400">
                  Targeted reductions to prevent binge loops
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {advice.dailyCurfews.map((curfew, idx) => {
                  const isApplied = appliedLimits[curfew.app];
                  const currentAppObj = TRACKED_APPS.find(
                    (a) => a.name.toLowerCase() === curfew.app.toLowerCase()
                  );
                  const currentMinutesUsed = currentAppObj
                    ? currentDayRecord.apps[currentAppObj.id]?.minutes || 0
                    : 0;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white">{curfew.app}</span>
                          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                            Cap: {formatMinutes(curfew.recommendedLimitMinutes)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {curfew.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          Used today: {formatMinutes(currentMinutesUsed)}
                        </span>

                        <button
                          onClick={() => handleApplyLimit(curfew)}
                          disabled={isApplied}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            isApplied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Applied
                            </>
                          ) : (
                            <>
                              <Sliders className="w-3 h-3" /> Apply Limit
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actionable Tips Grid */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Actionable Screen Reduction Tactics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {advice.actionableTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {tip.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tip.impact === 'high'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : tip.impact === 'quick_win'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {tip.impact === 'high' ? 'High Impact' : tip.impact === 'quick_win' ? 'Quick Win' : 'Medium Impact'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{tip.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Digital Detox Mini-Challenge */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950/40 border border-indigo-800/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{advice.microChallenge.title}</h3>
                    <p className="text-xs text-indigo-300/80">
                      Step-by-step habit rewiring challenge. Tap to complete each step:
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold text-indigo-300">
                  {Object.values(challengeSteps).filter(Boolean).length}/{advice.microChallenge.steps.length} Done
                </div>
              </div>

              <div className="space-y-2">
                {advice.microChallenge.steps.map((step, idx) => {
                  const isChecked = Boolean(challengeSteps[idx]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <button className="shrink-0 text-emerald-400">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'font-medium'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
