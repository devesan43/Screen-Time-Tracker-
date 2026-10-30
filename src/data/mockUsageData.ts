import { TrackedApp, DayRecord, UsageLimit, BedtimeSettings } from '../types';

export const TRACKED_APPS: TrackedApp[] = [
  // Social Media
  {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'social',
    color: '#E1306C',
    textColor: '#FFF',
    badgeBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
    iconName: 'Instagram',
    description: 'Reels, Stories, Direct Messages & Feed',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    category: 'social',
    color: '#25D366',
    textColor: '#FFF',
    badgeBg: 'bg-emerald-500',
    iconName: 'MessageCircle',
    description: 'Chats, Calls & Status Updates',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    category: 'social',
    color: '#1877F2',
    textColor: '#FFF',
    badgeBg: 'bg-blue-600',
    iconName: 'Facebook',
    description: 'Social feed, Groups & Marketplace',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    category: 'social',
    color: '#FF0000',
    textColor: '#FFF',
    badgeBg: 'bg-red-600',
    iconName: 'PlaySquare',
    description: 'Videos, Shorts & Subscriptions',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    category: 'social',
    color: '#00F2FE',
    textColor: '#000',
    badgeBg: 'bg-gradient-to-r from-teal-400 to-rose-500',
    iconName: 'Video',
    description: 'Short-form algorithmic video feed',
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    category: 'social',
    color: '#FFFFFF',
    textColor: '#000',
    badgeBg: 'bg-slate-800 text-white border border-slate-700',
    iconName: 'Twitter',
    description: 'Breaking news, discussions & timeline',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    packageName: 'com.reddit.frontpage',
    category: 'social',
    color: '#FF4500',
    textColor: '#FFF',
    badgeBg: 'bg-orange-600',
    iconName: 'Flame',
    description: 'Subreddits, discussions & communities',
  },

  // Browsing
  {
    id: 'chrome',
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    category: 'browsing',
    color: '#4285F4',
    textColor: '#FFF',
    badgeBg: 'bg-gradient-to-r from-amber-500 via-emerald-500 to-blue-500',
    iconName: 'Globe',
    description: 'Web search, articles & tab navigation',
  },
  {
    id: 'samsung_browser',
    name: 'Samsung Internet',
    packageName: 'com.sec.android.app.sbrowser',
    category: 'browsing',
    color: '#1A73E8',
    textColor: '#FFF',
    badgeBg: 'bg-indigo-600',
    iconName: 'Compass',
    description: 'Fast mobile web browsing',
  },
  {
    id: 'firefox',
    name: 'Firefox Focus',
    packageName: 'org.mozilla.firefox',
    category: 'browsing',
    color: '#FF7139',
    textColor: '#FFF',
    badgeBg: 'bg-orange-500',
    iconName: 'Flame',
    description: 'Private privacy-first web browser',
  },
  {
    id: 'brave',
    name: 'Brave Browser',
    packageName: 'com.brave.browser',
    category: 'browsing',
    color: '#FB542B',
    textColor: '#FFF',
    badgeBg: 'bg-amber-600',
    iconName: 'Shield',
    description: 'Ad-blocking web browser',
  },

  // Productivity
  {
    id: 'gmail',
    name: 'Gmail',
    packageName: 'com.google.android.gm',
    category: 'productivity',
    color: '#EA4335',
    textColor: '#FFF',
    badgeBg: 'bg-rose-600',
    iconName: 'Mail',
    description: 'Work & personal email communications',
  },
  {
    id: 'slack',
    name: 'Slack',
    packageName: 'com.Slack',
    category: 'productivity',
    color: '#4A154B',
    textColor: '#FFF',
    badgeBg: 'bg-purple-800',
    iconName: 'Hash',
    description: 'Workplace chat & team channels',
  },

  // Entertainment & Other
  {
    id: 'spotify',
    name: 'Spotify',
    packageName: 'com.spotify.music',
    category: 'entertainment',
    color: '#1DB954',
    textColor: '#000',
    badgeBg: 'bg-emerald-600',
    iconName: 'Music',
    description: 'Podcasts, music playlists & streaming',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    packageName: 'com.netflix.mediaclient',
    category: 'entertainment',
    color: '#E50914',
    textColor: '#FFF',
    badgeBg: 'bg-red-700',
    iconName: 'Tv',
    description: 'Movies, Series & Documentaries',
  },
  {
    id: 'system_ui',
    name: 'Android System & Tools',
    packageName: 'com.android.systemui',
    category: 'other',
    color: '#94A3B8',
    textColor: '#FFF',
    badgeBg: 'bg-slate-700',
    iconName: 'Smartphone',
    description: 'Settings, Camera, Files & Phone dialer',
  },
];

export const CATEGORY_META = {
  social: {
    label: 'Social Media',
    color: '#EC4899', // Pink
    tailwindBg: 'bg-pink-500/15',
    tailwindText: 'text-pink-400',
    tailwindBorder: 'border-pink-500/30',
    barColor: '#EC4899',
  },
  browsing: {
    label: 'Web Browsing',
    color: '#0EA5E9', // Sky blue
    tailwindBg: 'bg-sky-500/15',
    tailwindText: 'text-sky-400',
    tailwindBorder: 'border-sky-500/30',
    barColor: '#0EA5E9',
  },
  productivity: {
    label: 'Productivity',
    color: '#10B981', // Emerald
    tailwindBg: 'bg-emerald-500/15',
    tailwindText: 'text-emerald-400',
    tailwindBorder: 'border-emerald-500/30',
    barColor: '#10B981',
  },
  entertainment: {
    label: 'Entertainment',
    color: '#F59E0B', // Amber
    tailwindBg: 'bg-amber-500/15',
    tailwindText: 'text-amber-400',
    tailwindBorder: 'border-amber-500/30',
    barColor: '#F59E0B',
  },
  other: {
    label: 'Other & System',
    color: '#8B5CF6', // Purple
    tailwindBg: 'bg-purple-500/15',
    tailwindText: 'text-purple-400',
    tailwindBorder: 'border-purple-500/30',
    barColor: '#8B5CF6',
  },
};

export const DEFAULT_LIMITS: UsageLimit[] = [
  {
    id: 'limit_instagram',
    targetType: 'app',
    targetId: 'instagram',
    targetName: 'Instagram',
    limitMinutes: 45, // 45 mins
    enabled: true,
    warnAt80Percent: true,
    hardBlock: true,
    soundAlert: true,
  },
  {
    id: 'limit_facebook',
    targetType: 'app',
    targetId: 'facebook',
    targetName: 'Facebook',
    limitMinutes: 30, // 30 mins
    enabled: true,
    warnAt80Percent: true,
    hardBlock: false,
    soundAlert: true,
  },
  {
    id: 'limit_whatsapp',
    targetType: 'app',
    targetId: 'whatsapp',
    targetName: 'WhatsApp',
    limitMinutes: 60, // 1 hour
    enabled: true,
    warnAt80Percent: true,
    hardBlock: false,
    soundAlert: true,
  },
  {
    id: 'limit_chrome',
    targetType: 'app',
    targetId: 'chrome',
    targetName: 'Google Chrome',
    limitMinutes: 50, // 50 mins
    enabled: true,
    warnAt80Percent: true,
    hardBlock: false,
    soundAlert: true,
  },
  {
    id: 'limit_tiktok',
    targetType: 'app',
    targetId: 'tiktok',
    targetName: 'TikTok',
    limitMinutes: 30,
    enabled: true,
    warnAt80Percent: true,
    hardBlock: true,
    soundAlert: true,
  },
  {
    id: 'limit_cat_social',
    targetType: 'category',
    targetId: 'social',
    targetName: 'All Social Media',
    limitMinutes: 120, // 2 hours
    enabled: true,
    warnAt80Percent: true,
    hardBlock: false,
    soundAlert: true,
  },
  {
    id: 'limit_total',
    targetType: 'total',
    targetId: 'total',
    targetName: 'Daily Screen Time Goal',
    limitMinutes: 240, // 4 hours
    enabled: true,
    warnAt80Percent: true,
    hardBlock: false,
    soundAlert: true,
  },
];

export const DEFAULT_BEDTIME: BedtimeSettings = {
  enabled: true,
  startTime: '22:30',
  endTime: '07:00',
  grayscale: true,
  dndMode: true,
  activeToday: false,
};

// Generates 30 days of realistic history leading up to today
export function generateInitialHistory(): Record<string, DayRecord> {
  const history: Record<string, DayRecord> = {};
  const today = new Date();

  // Pattern weights for days (weekends have more social & streaming)
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Multipliers for realistic variances
    const weekendFactor = isWeekend ? 1.25 : 0.95;
    const randomVariance = 0.85 + (Math.sin(i * 1.5) + 1) * 0.15;

    const appsRecord: Record<string, {
      appId: string;
      minutes: number;
      opens: number;
      notifications: number;
      hourlyMinutes: number[];
    }> = {};

    let totalDayMinutes = 0;

    // Base usage profile per app in minutes
    const baseProfiles: Record<string, { baseMin: number; baseOpens: number; baseNotifs: number; peakHour: number }> = {
      instagram: { baseMin: 42, baseOpens: 34, baseNotifs: 48, peakHour: 20 },
      whatsapp: { baseMin: 55, baseOpens: 58, baseNotifs: 85, peakHour: 13 },
      facebook: { baseMin: 22, baseOpens: 14, baseNotifs: 22, peakHour: 19 },
      youtube: { baseMin: 48, baseOpens: 12, baseNotifs: 18, peakHour: 21 },
      tiktok: { baseMin: 28, baseOpens: 16, baseNotifs: 35, peakHour: 22 },
      x_twitter: { baseMin: 18, baseOpens: 15, baseNotifs: 26, peakHour: 12 },
      reddit: { baseMin: 16, baseOpens: 8, baseNotifs: 12, peakHour: 23 },
      chrome: { baseMin: 38, baseOpens: 22, baseNotifs: 6, peakHour: 15 },
      samsung_browser: { baseMin: 12, baseOpens: 7, baseNotifs: 2, peakHour: 11 },
      firefox: { baseMin: 8, baseOpens: 5, baseNotifs: 1, peakHour: 16 },
      brave: { baseMin: 10, baseOpens: 6, baseNotifs: 0, peakHour: 14 },
      gmail: { baseMin: 15, baseOpens: 19, baseNotifs: 42, peakHour: 10 },
      slack: { baseMin: 20, baseOpens: 28, baseNotifs: 60, peakHour: 14 },
      spotify: { baseMin: 35, baseOpens: 8, baseNotifs: 4, peakHour: 9 },
      netflix: { baseMin: 25, baseOpens: 4, baseNotifs: 6, peakHour: 21 },
      system_ui: { baseMin: 18, baseOpens: 40, baseNotifs: 0, peakHour: 8 },
    };

    TRACKED_APPS.forEach((app) => {
      const profile = baseProfiles[app.id] || { baseMin: 10, baseOpens: 5, baseNotifs: 5, peakHour: 12 };
      let minutes = Math.round(profile.baseMin * weekendFactor * randomVariance);

      // If it's today, we might be partway through the day or live tracking
      if (isToday) {
        minutes = Math.round(minutes * 0.78); // ~78% of day completed
      }

      const opens = Math.max(1, Math.round(profile.baseOpens * weekendFactor * randomVariance));
      const notifications = Math.max(0, Math.round(profile.baseNotifs * randomVariance));

      // Distribute minutes realistically into 24 hours
      const hourly = new Array(24).fill(0);
      let remaining = minutes;
      
      // Hours active: mostly 7am to 23pm
      for (let h = 7; h < 24; h++) {
        if (remaining <= 0) break;
        // Bell-ish curve around peakHour
        const dist = Math.abs(h - profile.peakHour);
        const weight = Math.max(0.1, 1 - dist * 0.15);
        const chunk = Math.min(remaining, Math.round((minutes / 10) * weight));
        hourly[h] = chunk;
        remaining -= chunk;
      }
      if (remaining > 0) {
        hourly[profile.peakHour] += remaining;
      }

      totalDayMinutes += minutes;

      appsRecord[app.id] = {
        appId: app.id,
        minutes,
        opens,
        notifications,
        hourlyMinutes: hourly,
      };
    });

    const pickups = Math.round(75 * weekendFactor * randomVariance);
    const screenOnCount = Math.round(pickups * 1.3);

    history[dateStr] = {
      date: dateStr,
      totalMinutes: totalDayMinutes,
      pickups,
      firstPickup: isWeekend ? '08:42 AM' : '06:58 AM',
      screenOnCount,
      apps: appsRecord,
    };
  }

  return history;
}

export function formatMinutes(totalMin: number): string {
  if (totalMin < 1) return '0m';
  const hours = Math.floor(totalMin / 60);
  const mins = Math.round(totalMin % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTime24to12(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}
