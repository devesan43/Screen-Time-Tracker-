import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  DayRecord,
  UsageLimit,
  BedtimeSettings,
  TimeframeMode,
  CategoryFilter,
  LiveTrackingState,
  TriggeredAlert,
  TrackedApp,
} from '../types';
import {
  TRACKED_APPS,
  DEFAULT_LIMITS,
  DEFAULT_BEDTIME,
  generateInitialHistory,
} from '../data/mockUsageData';
import { soundService } from '../utils/audioAlert';

interface ScreenTimeContextType {
  history: Record<string, DayRecord>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  timeframe: TimeframeMode;
  setTimeframe: (tf: TimeframeMode) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (filter: CategoryFilter) => void;
  limits: UsageLimit[];
  updateLimit: (id: string, updates: Partial<UsageLimit>) => void;
  addLimit: (limit: UsageLimit) => void;
  deleteLimit: (id: string) => void;
  bedtime: BedtimeSettings;
  updateBedtime: (updates: Partial<BedtimeSettings>) => void;
  liveTracking: LiveTrackingState;
  startLiveTracking: (appId: string) => void;
  stopLiveTracking: () => void;
  activeAlert: TriggeredAlert | null;
  dismissAlert: () => void;
  snoozeAlert: (minutes: number) => void;
  deviceViewMode: 'phone' | 'fluid';
  setDeviceViewMode: (mode: 'phone' | 'fluid') => void;
  selectedAppForDetail: TrackedApp | null;
  setSelectedAppForDetail: (app: TrackedApp | null) => void;
  currentDayRecord: DayRecord;
  addUsageMinutes: (appId: string, minutes: number) => void;
  resetTodayData: () => void;
  importHistoryData: (newHistory: Record<string, DayRecord>, newLimits?: UsageLimit[]) => boolean;
}

const ScreenTimeContext = createContext<ScreenTimeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HISTORY: 'chronos_screentime_history_v2',
  LIMITS: 'chronos_screentime_limits_v2',
  BEDTIME: 'chronos_screentime_bedtime_v2',
  VIEW_MODE: 'chronos_screentime_view_mode_v2',
};

export const ScreenTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [timeframe, setTimeframe] = useState<TimeframeMode>('daily');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [deviceViewMode, setDeviceViewMode] = useState<'phone' | 'fluid'>('fluid');
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<TrackedApp | null>(null);

  // Initialize history from localStorage or generate fresh
  const [history, setHistory] = useState<Record<string, DayRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          // ensure today exists
          if (!parsed[todayStr]) {
            const fresh = generateInitialHistory();
            return { ...parsed, [todayStr]: fresh[todayStr] };
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return generateInitialHistory();
  });

  // Initialize limits from localStorage or defaults
  const [limits, setLimits] = useState<UsageLimit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIMITS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_LIMITS;
  });

  // Bedtime mode
  const [bedtime, setBedtime] = useState<BedtimeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BEDTIME);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_BEDTIME;
  });

  // Live tracking state
  const [liveTracking, setLiveTracking] = useState<LiveTrackingState>({
    isActive: false,
    appId: 'instagram',
    elapsedSeconds: 0,
    startedAt: null,
  });

  // Active Alert popup
  const [activeAlert, setActiveAlert] = useState<TriggeredAlert | null>(null);
  const [snoozedApps, setSnoozedApps] = useState<Record<string, number>>({});

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIMITS, JSON.stringify(limits));
    } catch {
      // ignore
    }
  }, [limits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BEDTIME, JSON.stringify(bedtime));
    } catch {
      // ignore
    }
  }, [bedtime]);

  // Current Day Record
  const currentDayRecord = useMemo(() => {
    if (history[selectedDate]) {
      return history[selectedDate];
    }
    // Return empty fallback structure
    return {
      date: selectedDate,
      totalMinutes: 0,
      pickups: 0,
      firstPickup: '08:00 AM',
      screenOnCount: 0,
      apps: {},
    };
  }, [history, selectedDate]);

  // Check limits and trigger alerts if needed
  const checkAlertLimits = useCallback((dateStr: string, currentHist: Record<string, DayRecord>) => {
    const day = currentHist[dateStr];
    if (!day) return;

    const now = Date.now();

    for (const lim of limits) {
      if (!lim.enabled) continue;

      let usedMinutes = 0;
      let appName = lim.targetName;
      let trackedAppId = lim.targetId;

      if (lim.targetType === 'app') {
        const appUsage = day.apps[lim.targetId];
        usedMinutes = appUsage ? appUsage.minutes : 0;
        const appObj = TRACKED_APPS.find((a) => a.id === lim.targetId);
        if (appObj) appName = appObj.name;
      } else if (lim.targetType === 'category') {
        const appsInCat = TRACKED_APPS.filter((a) => a.category === lim.targetId);
        usedMinutes = appsInCat.reduce((sum, a) => sum + (day.apps[a.id]?.minutes || 0), 0);
      } else if (lim.targetType === 'total') {
        usedMinutes = day.totalMinutes;
      }

      // Check snooze expiration
      if (snoozedApps[lim.id] && snoozedApps[lim.id] > now) {
        continue;
      }

      const ratio = usedMinutes / lim.limitMinutes;

      if (ratio >= 1.0) {
        // Limit reached or hard block
        setActiveAlert({
          id: `${lim.id}_100_${Math.floor(usedMinutes)}`,
          appId: trackedAppId,
          appName,
          currentMinutes: usedMinutes,
          limitMinutes: lim.limitMinutes,
          percentage: Math.round(ratio * 100),
          type: lim.hardBlock ? 'hard_block' : 'limit_reached',
          timestamp: now,
        });

        if (lim.soundAlert) {
          soundService.playLimitReachedChime();
        }
        break; // Show highest priority alert
      } else if (ratio >= 0.8 && lim.warnAt80Percent) {
        // Warning threshold reached
        setActiveAlert({
          id: `${lim.id}_80`,
          appId: trackedAppId,
          appName,
          currentMinutes: usedMinutes,
          limitMinutes: lim.limitMinutes,
          percentage: Math.round(ratio * 100),
          type: 'warning',
          timestamp: now,
        });

        if (lim.soundAlert) {
          soundService.playWarningChime();
        }
        break;
      }
    }
  }, [limits, snoozedApps]);

  // Method to increment usage on a specific app
  const addUsageMinutes = useCallback((appId: string, minutesToAdd: number) => {
    setHistory((prev) => {
      const day = prev[selectedDate] || {
        date: selectedDate,
        totalMinutes: 0,
        pickups: 1,
        firstPickup: '08:00 AM',
        screenOnCount: 1,
        apps: {},
      };

      const existingApp = day.apps[appId] || {
        appId,
        minutes: 0,
        opens: 0,
        notifications: 0,
        hourlyMinutes: new Array(24).fill(0),
      };

      const currentHour = new Date().getHours();
      const updatedHourly = [...existingApp.hourlyMinutes];
      updatedHourly[currentHour] = (updatedHourly[currentHour] || 0) + minutesToAdd;

      const updatedApp = {
        ...existingApp,
        minutes: existingApp.minutes + minutesToAdd,
        opens: existingApp.opens + (minutesToAdd > 0 && existingApp.opens === 0 ? 1 : 0),
        hourlyMinutes: updatedHourly,
      };

      const updatedApps = {
        ...day.apps,
        [appId]: updatedApp,
      };

      const newTotal = Object.values(updatedApps).reduce((sum, a) => sum + a.minutes, 0);

      const updatedDay: DayRecord = {
        ...day,
        totalMinutes: newTotal,
        apps: updatedApps,
      };

      const nextHistory = {
        ...prev,
        [selectedDate]: updatedDay,
      };

      // Trigger limit checking
      setTimeout(() => checkAlertLimits(selectedDate, nextHistory), 100);

      return nextHistory;
    });
  }, [selectedDate, checkAlertLimits]);

  // Live tracking timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (liveTracking.isActive) {
      interval = setInterval(() => {
        setLiveTracking((prev) => {
          const nextSec = prev.elapsedSeconds + 1;
          // Every 60 seconds of real-time usage, persist 1 minute to the app!
          if (nextSec > 0 && nextSec % 60 === 0) {
            addUsageMinutes(prev.appId, 1);
          }
          return {
            ...prev,
            elapsedSeconds: nextSec,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveTracking.isActive, addUsageMinutes]);

  const startLiveTracking = (appId: string) => {
    setLiveTracking({
      isActive: true,
      appId,
      elapsedSeconds: 0,
      startedAt: Date.now(),
    });
  };

  const stopLiveTracking = () => {
    if (liveTracking.isActive && liveTracking.elapsedSeconds >= 10) {
      // Add any partial minutes if user used > 20s
      const partialMins = Math.max(1, Math.round(liveTracking.elapsedSeconds / 60));
      addUsageMinutes(liveTracking.appId, partialMins);
    }
    setLiveTracking((prev) => ({
      ...prev,
      isActive: false,
    }));
  };

  const updateLimit = (id: string, updates: Partial<UsageLimit>) => {
    setLimits((prev) => prev.map((lim) => (lim.id === id ? { ...lim, ...updates } : lim)));
  };

  const addLimit = (newLim: UsageLimit) => {
    setLimits((prev) => {
      const filtered = prev.filter((l) => l.id !== newLim.id);
      return [...filtered, newLim];
    });
  };

  const deleteLimit = (id: string) => {
    setLimits((prev) => prev.filter((lim) => lim.id !== id));
  };

  const updateBedtime = (updates: Partial<BedtimeSettings>) => {
    setBedtime((prev) => ({ ...prev, ...updates }));
  };

  const dismissAlert = () => {
    setActiveAlert(null);
  };

  const snoozeAlert = (minutes: number) => {
    if (activeAlert) {
      const expireTime = Date.now() + minutes * 60 * 1000;
      setSnoozedApps((prev) => ({ ...prev, [activeAlert.id.split('_')[0]]: expireTime }));
      setActiveAlert(null);
    }
  };

  const resetTodayData = () => {
    setHistory((prev) => {
      const cleanDay: DayRecord = {
        date: selectedDate,
        totalMinutes: 0,
        pickups: 0,
        firstPickup: '--:--',
        screenOnCount: 0,
        apps: {},
      };
      return { ...prev, [selectedDate]: cleanDay };
    });
  };

  const importHistoryData = (newHistory: Record<string, DayRecord>, newLimits?: UsageLimit[]) => {
    try {
      if (typeof newHistory === 'object' && Object.keys(newHistory).length > 0) {
        setHistory(newHistory);
        if (newLimits && Array.isArray(newLimits)) {
          setLimits(newLimits);
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  return (
    <ScreenTimeContext.Provider
      value={{
        history,
        selectedDate,
        setSelectedDate,
        timeframe,
        setTimeframe,
        categoryFilter,
        setCategoryFilter,
        limits,
        updateLimit,
        addLimit,
        deleteLimit,
        bedtime,
        updateBedtime,
        liveTracking,
        startLiveTracking,
        stopLiveTracking,
        activeAlert,
        dismissAlert,
        snoozeAlert,
        deviceViewMode,
        setDeviceViewMode,
        selectedAppForDetail,
        setSelectedAppForDetail,
        currentDayRecord,
        addUsageMinutes,
        resetTodayData,
        importHistoryData,
      }}
    >
      <div className={bedtime.enabled && bedtime.grayscale ? 'bedtime-grayscale' : ''}>
        {children}
      </div>
    </ScreenTimeContext.Provider>
  );
};

export function useScreenTime() {
  const context = useContext(ScreenTimeContext);
  if (!context) {
    throw new Error('useScreenTime must be used within a ScreenTimeProvider');
  }
  return context;
}
