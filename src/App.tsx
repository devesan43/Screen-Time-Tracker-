import React, { useState } from 'react';
import { ScreenTimeProvider, useScreenTime } from './context/ScreenTimeContext';
import { Header } from './components/Header';
import { ScreenTimeOverview } from './components/ScreenTimeOverview';
import { TimeframeSelector } from './components/TimeframeSelector';
import { DailyAnalysis } from './components/DailyAnalysis';
import { WeeklyAnalysis } from './components/WeeklyAnalysis';
import { MonthlyAnalysis } from './components/MonthlyAnalysis';
import { TrendsAnalysis } from './components/TrendsAnalysis';
import { DigitalWellbeingAdvice } from './components/DigitalWellbeingAdvice';
import { AppList } from './components/AppList';
import { AppDetailModal } from './components/AppDetailModal';
import { AlertsManagerModal } from './components/AlertsManagerModal';
import { ExportDataModal } from './components/ExportDataModal';
import { ApkGitHubModal } from './components/ApkGitHubModal';
import { AlertNotificationBanner } from './components/AlertNotificationBanner';
import { LiveTrackerBar } from './components/LiveTrackerBar';
import { PhoneFrame } from './components/PhoneFrame';

const ScreenTimeDashboard: React.FC = () => {
  const { timeframe, deviceViewMode } = useScreenTime();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isApkOpen, setIsApkOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <Header
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenApk={() => setIsApkOpen(true)}
      />

      {/* Main Content Area */}
      <PhoneFrame isPhoneMode={deviceViewMode === 'phone'}>
        <main className={`mx-auto w-full py-6 space-y-6 ${deviceViewMode === 'phone' ? 'max-w-none' : 'max-w-7xl px-4 sm:px-6'}`}>
          {/* Top Circular Donut Screen Time Overview */}
          <ScreenTimeOverview />

          {/* Timeframe & Date Navigation */}
          <TimeframeSelector />

          {/* Timeframe Active Tab View */}
          {timeframe === 'daily' && <DailyAnalysis />}
          {timeframe === 'weekly' && <WeeklyAnalysis />}
          {timeframe === 'monthly' && <MonthlyAnalysis />}
          {timeframe === 'trends' && <TrendsAnalysis />}
          {timeframe === 'wellbeing' && <DigitalWellbeingAdvice />}

          {/* App List (Social Media, Browsing, Productivity, Other) */}
          <AppList />
        </main>
      </PhoneFrame>

      {/* Live Foreground Tracking Bar */}
      <LiveTrackerBar />

      {/* Modals & Overlays */}
      <AppDetailModal />
      <AlertsManagerModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
      <ExportDataModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <ApkGitHubModal isOpen={isApkOpen} onClose={() => setIsApkOpen(false)} />
      <AlertNotificationBanner />
    </div>
  );
};

export default function App() {
  return (
    <ScreenTimeProvider>
      <ScreenTimeDashboard />
    </ScreenTimeProvider>
  );
}
