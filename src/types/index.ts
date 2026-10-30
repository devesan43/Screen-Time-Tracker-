export type AppCategory = 'social' | 'browsing' | 'productivity' | 'entertainment' | 'other';

export interface TrackedApp {
  id: string;
  name: string;
  packageName: string;
  category: AppCategory;
  color: string;
  textColor: string;
  badgeBg: string;
  iconName: string;
  description: string;
}

export interface AppHourlyUsage {
  appId: string;
  hourlyMinutes: number[]; // 24 slots (00 to 23)
}

export interface AppDayUsage {
  appId: string;
  minutes: number;
  opens: number;
  notifications: number;
  hourlyMinutes: number[]; // 24 hours
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  pickups: number;
  firstPickup: string; // "07:15 AM"
  screenOnCount: number;
  apps: Record<string, AppDayUsage>;
}

export interface UsageLimit {
  id: string; // appId or category id like 'cat:social' or 'total'
  targetType: 'app' | 'category' | 'total';
  targetId: string;
  targetName: string;
  limitMinutes: number;
  enabled: boolean;
  warnAt80Percent: boolean;
  hardBlock: boolean;
  soundAlert: boolean;
}

export interface BedtimeSettings {
  enabled: boolean;
  startTime: string; // "22:30"
  endTime: string;   // "07:00"
  grayscale: boolean;
  dndMode: boolean;
  activeToday: boolean;
}

export type TimeframeMode = 'daily' | 'weekly' | 'monthly' | 'trends' | 'wellbeing';
export type CategoryFilter = 'all' | AppCategory;

export interface LiveTrackingState {
  isActive: boolean;
  appId: string;
  elapsedSeconds: number;
  startedAt: number | null;
}

export interface TriggeredAlert {
  id: string;
  appId: string;
  appName: string;
  currentMinutes: number;
  limitMinutes: number;
  percentage: number;
  type: 'warning' | 'limit_reached' | 'hard_block';
  timestamp: number;
}
