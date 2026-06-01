/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export default function AndroidFrame({ children }: AndroidFrameProps) {
  const [isMobileMode, setIsMobileMode] = useState(true);
  const [currentTime, setCurrentTime] = useState('17:22');

  useEffect(() => {
    // Format to HH:MM based on current local time
    const updateClock = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    
    updateClock();
    const interval = setInterval(updateClock, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4 md:p-8 font-sans transition-colors duration-300">
      
      {/* Visual Workspace Controls / Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg shrink-0 mt-2 sm:mt-0">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-300">Режим отображения</span>
          <span className="text-[10px] text-slate-400 font-mono">Android UI Emulator</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            id="toggle-emulator-mobile"
            onClick={() => setIsMobileMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              isMobileMode
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
            }`}
            title="Эмулировать экран Android-смартфона"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Смартфон</span>
          </button>
          
          <button
            id="toggle-emulator-tablet"
            onClick={() => setIsMobileMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              !isMobileMode
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
            }`}
            title="Режим веб-приложения на весь экран"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Планшет / Веб</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-500 ease-out flex justify-center ${
          isMobileMode ? 'max-w-[400px]' : 'max-w-6xl'
        }`}
      >
        {isMobileMode ? (
          /* Phone Chassis Mockup in Material Style */
          <div className="w-full aspect-[9/19.5] max-h-[850px] relative bg-slate-950 rounded-[48px] border-[12px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ring-8 ring-slate-800/20">
            
            {/* Phone Front-camera/Notch Hole */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full z-50 flex items-center justify-center border border-slate-800/50 shadow-inner">
              <div className="w-2.5 h-2.5 bg-neutral-900/90 rounded-full relative ml-auto mr-4 flex items-center justify-center">
                <div className="w-1 h-1 bg-indigo-900/50 rounded-full" />
              </div>
            </div>

            {/* Android Ear Speaker slit */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-800/40 rounded-full z-50" />

            {/* Android Status Bar */}
            <div className="h-10 pt-4 px-6 flex items-center justify-between text-[11px] font-semibold text-neutral-200 select-none bg-neutral-900 shrink-0 z-40">
              <span className="font-mono tracking-tight">{currentTime}</span>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px]">89%</span>
                  <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                </div>
              </div>
            </div>

            {/* Actual Screen content inside phone */}
            <div className="flex-1 bg-neutral-50 text-neutral-900 overflow-hidden relative flex flex-col">
              {children}
            </div>

            {/* Android Gesture Pill Navigation Bar */}
            <div className="h-4 pb-1 bg-neutral-900 flex items-center justify-center shrink-0 z-40">
              <div className="w-28 h-1 bg-neutral-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Plain Widescreen layout, looks gorgeous but fits all details */
          <div className="w-full min-h-[550px] md:min-h-[750px] bg-neutral-50 text-neutral-900 rounded-3xl border border-slate-800/10 shadow-2xl overflow-hidden flex flex-col">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
