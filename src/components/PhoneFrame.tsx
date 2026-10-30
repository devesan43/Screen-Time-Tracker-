import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isPhoneMode: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, isPhoneMode }) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isPhoneMode) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="py-6 px-4 flex justify-center items-center min-h-[calc(100vh-80px)]">
      <div className="relative w-full max-w-[430px] rounded-[48px] bg-slate-950 border-[10px] border-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_2px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col h-[880px]">
        {/* Android Status Bar */}
        <div className="h-10 bg-slate-950 px-6 flex items-center justify-between text-xs text-slate-300 select-none z-30 shrink-0">
          <span className="font-semibold text-[13px]">{currentTime || '09:41'}</span>

          {/* Camera Cutout (Punch-Hole) */}
          <div className="w-4 h-4 rounded-full bg-black border border-slate-800 -ml-2" />

          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Content inside Phone */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 scrollbar-none pb-14">
          {children}
        </div>

        {/* Android Navigation Gesture Pill */}
        <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0 z-30">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
