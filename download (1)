/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Shift, UserSettings } from '../types';
import { getWeeklyStats, formatMonthYear, WeeklyStats } from '../utils/data';
import { 
  BarChart, 
  TrendingUp, 
  Clock, 
  Calendar,
  Layers, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface StatsTabProps {
  shifts: Shift[];
  settings: UserSettings;
}

type StatsScale = 'weeks' | 'months';

export default function StatsTab({ shifts, settings }: StatsTabProps) {
  const [scale, setScale] = useState<StatsScale>('weeks');
  
  // June 2026 as initial selection for month stats
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed: 5 is June
  
  // Handler for month controls in Stats tab
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Get weekly stats of selected month
  const weeklyStatsList = useMemo(() => {
    return getWeeklyStats(shifts, currentYear, currentMonth, settings);
  }, [shifts, currentYear, currentMonth, settings]);

  // Selected week details index
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number | null>(null);

  // Re-adjust selected week if list changes
  React.useEffect(() => {
    if (weeklyStatsList.length > 0) {
      setSelectedWeekIdx(0);
    } else {
      setSelectedWeekIdx(null);
    }
  }, [weeklyStatsList]);

  const activeWeekDetail = useMemo(() => {
    if (selectedWeekIdx !== null && weeklyStatsList[selectedWeekIdx]) {
      return weeklyStatsList[selectedWeekIdx];
    }
    return null;
  }, [selectedWeekIdx, weeklyStatsList]);

  // Month-by-month stats compilation (May vs June vs others)
  const monthlyAggregateList = useMemo(() => {
    // Collect all available months in shift records
    const monthsMap = new Map<string, { year: number; monthZero: number; shifts: Shift[] }>();
    
    // Always include at least May and June 2026
    const keyMay = '2026-04';
    const keyJune = '2026-05';
    
    monthsMap.set(keyMay, { year: 2026, monthZero: 4, shifts: [] });
    monthsMap.set(keyJune, { year: 2026, monthZero: 5, shifts: [] });

    shifts.forEach(s => {
      const parts = s.date.split('-');
      const y = parseInt(parts[0], 10);
      const mZ = parseInt(parts[1], 10) - 1;
      const key = `${y}-${mZ.toString().padStart(2, '0')}`;
      
      if (!monthsMap.has(key)) {
        monthsMap.set(key, { year: y, monthZero: mZ, shifts: [] });
      }
      monthsMap.get(key)!.shifts.push(s);
    });

    return [...monthsMap.entries()].map(([key, data]) => {
      let regHours = 0;
      let ovtHours = 0;
      let regPay = 0;
      let ovtPay = 0;

      data.shifts.forEach(s => {
        regHours += s.regularHours;
        ovtHours += s.overtimeHours;
        regPay += s.regularHours * s.hourlyRate;
        ovtPay += s.overtimeHours * s.hourlyRate * s.overtimeMultiplier;
      });

      return {
        key,
        year: data.year,
        monthZero: data.monthZero,
        label: formatMonthYear(data.year, data.monthZero),
        regularHours: regHours,
        overtimeHours: ovtHours,
        totalHours: regHours + ovtHours,
        shiftsCount: data.shifts.length,
        totalEarnings: regPay + ovtPay
      };
    }).sort((a, b) => a.key.localeCompare(b.key));
  }, [shifts, settings]);

  // General selected month level sums
  const monthSums = useMemo(() => {
    let regTotal = 0;
    let ovtTotal = 0;
    let totalPay = 0;
    let shiftsInMonth = 0;

    shifts.forEach(s => {
      const parts = s.date.split('-');
      const y = parseInt(parts[0], 10);
      const mZ = parseInt(parts[1], 10) - 1;
      
      if (y === currentYear && mZ === currentMonth) {
        regTotal += s.regularHours;
        ovtTotal += s.overtimeHours;
        totalPay += (s.regularHours * s.hourlyRate) + (s.overtimeHours * s.hourlyRate * s.overtimeMultiplier);
        if (s.regularHours > 0 || s.overtimeHours > 0) {
          shiftsInMonth++;
        }
      }
    });

    return {
      regular: regTotal,
      overtime: ovtTotal,
      combined: regTotal + ovtTotal,
      earnings: totalPay,
      shiftsCount: shiftsInMonth,
      averageShift: shiftsInMonth > 0 ? (regTotal + ovtTotal) / shiftsInMonth : 0
    };
  }, [shifts, currentYear, currentMonth, settings]);

  // Find max value in charts for relative heights
  const maxWeeklyHours = useMemo(() => {
    if (weeklyStatsList.length === 0) return 10;
    return Math.max(...weeklyStatsList.map(w => w.regularHours + w.overtimeHours), 10);
  }, [weeklyStatsList]);

  const maxMonthlyHours = useMemo(() => {
    if (monthlyAggregateList.length === 0) return 10;
    return Math.max(...monthlyAggregateList.map(m => m.totalHours), 10);
  }, [monthlyAggregateList]);

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 p-4" id="stats-tab-container">
      
      {/* Title */}
      <div className="mb-4 select-none">
        <h2 className="text-xl font-black text-neutral-800 tracking-tight flex items-center gap-1.5">
          <BarChart className="w-5 h-5 text-emerald-600" />
          <span>Аналитика работы</span>
        </h2>
        <p className="text-xs text-neutral-400">Сводные графики выработки и сверхурочных</p>
      </div>

      {/* Scale Switch - Material segmented filter controls */}
      <div className="grid grid-cols-2 bg-neutral-200/60 p-1.0 rounded-xl mb-5 shrink-0 select-none border border-neutral-300/10">
        <button
          id="btn-scale-weeks"
          onClick={() => setScale('weeks')}
          className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            scale === 'weeks' 
              ? 'bg-white text-neutral-800 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          По неделям ({formatMonthYear(currentYear, currentMonth)})
        </button>
        <button
          id="btn-scale-months"
          onClick={() => setScale('months')}
          className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            scale === 'months' 
              ? 'bg-white text-neutral-800 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          По месяцам (Все время)
        </button>
      </div>

      {/* CONDITIONAL CONTENT */}
      {scale === 'weeks' ? (
        /* WEEKS ACCORDING TO USER CONFIG */
        <div className="space-y-4">
          
          {/* Navigation for selecting month of weekly stats */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-neutral-200/50 p-3 shadow-sm select-none">
            <button
              onClick={prevMonth}
              className="w-8 py-1 flex items-center justify-center rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-neutral-700">
              {formatMonthYear(currentYear, currentMonth)}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 py-1 flex items-center justify-center rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics of selected month */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-neutral-200/50 shadow-sm select-none text-center">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Всего за месяц</span>
              <span className="text-sm font-bold font-mono text-neutral-800">{monthSums.combined} ч.</span>
              <div className="flex justify-center gap-1.5 text-[8px] font-mono mt-1 text-neutral-400">
                <span className="text-emerald-600" title="Обычное время">{monthSums.regular}ч</span>
                <span>/</span>
                <span className="text-blue-600" title="Сверхурочные">+{monthSums.overtime}ч</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-neutral-200/50 shadow-sm select-none text-center">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Средняя смена</span>
              <span className="text-sm font-bold font-mono text-neutral-800">
                {monthSums.averageShift.toFixed(1)} ч.
              </span>
              <div className="text-[8px] text-neutral-400 font-mono mt-1">
                Всего {monthSums.shiftsCount} смен
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-neutral-200/50 shadow-sm select-none text-center">
              <span className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Сверхурочные</span>
              <span className="text-sm font-bold font-mono text-blue-600">
                +{monthSums.overtime} ч.
              </span>
              <div className="text-[8px] text-neutral-400 font-mono mt-1">
                {monthSums.combined > 0 ? ((monthSums.overtime / monthSums.combined) * 100).toFixed(0) : 0}% от общего
              </div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-white p-4 rounded-3xl border border-neutral-200/60 shadow-sm">
            <div className="flex justify-between items-center mb-5 select-none">
              <div>
                <h4 className="text-xs font-extrabold text-neutral-800">Распределение по неделям</h4>
                <p className="text-[9px] text-neutral-400">Зеленый — обычные, Синий — сверхурочные</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[9px] text-neutral-500 font-medium">
                  <span className="w-2 h-2 rounded bg-emerald-500 block" /> Обычное
                </span>
                <span className="flex items-center gap-1 text-[9px] text-neutral-500 font-medium">
                  <span className="w-2 h-2 rounded bg-blue-500 block" /> Доп.
                </span>
              </div>
            </div>

            {weeklyStatsList.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-3 select-none">
                <Calendar className="w-10 h-10 text-neutral-300 mb-2" />
                <p className="text-xs font-bold text-neutral-500">Нет записей за этот месяц</p>
                <p className="text-[10px] text-neutral-400 mt-1">Разметьте часы в календаре для вывода графиков</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Chart Bars (Pure HTML Flex Stacked Bars) */}
                <div className="h-48 flex items-end justify-between px-2 pt-4 border-b border-neutral-100">
                  {weeklyStatsList.map((week, idx) => {
                    const total = week.regularHours + week.overtimeHours;
                    const rHeight = (week.regularHours / maxWeeklyHours) * 100;
                    const oHeight = (week.overtimeHours / maxWeeklyHours) * 100;
                    const isSelected = selectedWeekIdx === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedWeekIdx(idx)}
                        className="group flex-1 flex flex-col items-center max-w-[50px] outline-none cursor-pointer focus:outline-none"
                      >
                        {/* Dynamic Floating Total label on Hover/Select */}
                        <div className={`text-[9px] font-black font-mono transition-opacity mb-1 ${
                          isSelected ? 'opacity-100 text-neutral-800' : 'opacity-0 group-hover:opacity-100 text-neutral-500'
                        }`}>
                          {total}ч
                        </div>

                        {/* Stacked Pillar block */}
                        <div className={`w-6 flex flex-col rounded-t-md overflow-hidden transition-all duration-300 relative ${
                          isSelected ? 'ring-2 ring-neutral-400 ring-offset-2' : 'hover:scale-105'
                        }`}
                        style={{ height: `${(total / maxWeeklyHours) * 130 + 10}px` }}
                        >
                          {/* Overtime (Blue) top part */}
                          {week.overtimeHours > 0 && (
                            <div 
                              className="bg-blue-500 w-full flex items-center justify-center text-[8px] font-bold text-white shadow-inner"
                              style={{ height: `${(week.overtimeHours / total) * 100}%` }}
                              title={`Сверхурочные: ${week.overtimeHours} ч`}
                            >
                              <span className="scale-75 select-none font-mono">+{week.overtimeHours}</span>
                            </div>
                          )}

                          {/* Regular (Green) bottom part */}
                          {week.regularHours > 0 && (
                            <div 
                              className="bg-emerald-500 w-full flex-1 flex items-center justify-center text-[8px] font-bold text-white shadow-inner"
                              title={`Обычные: ${week.regularHours} ч`}
                            >
                              <span className="scale-75 select-none font-mono">{week.regularHours}</span>
                            </div>
                          )}
                        </div>

                        {/* Week Label Tag */}
                        <span className={`text-[9px] font-bold mt-2 select-none ${
                          isSelected ? 'text-neutral-800 font-extrabold' : 'text-neutral-400'
                        }`}>
                          W{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Week breakdown detail card */}
                {activeWeekDetail && (
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/50 space-y-2">
                    <div className="flex justify-between items-center select-none">
                      <span className="text-xs font-extrabold text-neutral-800">{activeWeekDetail.weekKey}</span>
                      <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2.5 py-0.5 rounded-full font-bold">
                        {activeWeekDetail.shiftsCount} смен
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs select-none">
                      <div className="p-2.5 bg-white rounded-xl border border-neutral-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full shrink-0" />
                        <div>
                          <span className="text-[9px] text-neutral-400 block leading-tight">Обычное время</span>
                          <span className="font-bold font-mono text-neutral-800">{activeWeekDetail.regularHours} ч.</span>
                          <span className="text-[9px] text-neutral-400 block mt-0.5 leading-none">
                            {(activeWeekDetail.regularEarnings).toLocaleString('ru-RU')} {settings.currency}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-neutral-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full shrink-0" />
                        <div>
                          <span className="text-[9px] text-neutral-400 block leading-tight">Сверхурочные</span>
                          <span className="font-bold font-mono text-blue-600">+{activeWeekDetail.overtimeHours} ч.</span>
                          <span className="text-[9px] text-blue-400 block mt-0.5 leading-none">
                            {(activeWeekDetail.overtimeEarnings).toLocaleString('ru-RU')} {settings.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calculated wage sum for the week if set */}
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-neutral-100 mt-2 select-none">
                      <div className="flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-neutral-700">Начислено</span>
                      </div>
                      <span className="text-sm font-extrabold font-mono text-neutral-800">
                        {activeWeekDetail.totalEarnings.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      ) : (
        /* MONTH-BY-MONTH LONG TERM HISTORIC LIST */
        <div className="space-y-4">
          
          {/* Quick Metrics of year/globally */}
          <div className="bg-white p-4 rounded-3xl border border-neutral-200/60 shadow-sm select-none mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-black block">Рекорд по переработке</span>
                <span className="text-sm font-bold text-neutral-800 font-sans">
                  {monthlyAggregateList.length > 0
                    ? `Максимум: +${Math.max(...monthlyAggregateList.map(m => m.overtimeHours))} ч. в месяц`
                    : 'Нет данных'}
                </span>
              </div>
            </div>
          </div>

          {/* Month Bar Chart */}
          <div className="bg-white p-4 rounded-3xl border border-neutral-200/60 shadow-sm">
            <h4 className="text-xs font-extrabold text-neutral-800 mb-5 select-none">Сравнительная месячная выработка</h4>
            
            <div className="space-y-4">
              {monthlyAggregateList.map((month, idx) => {
                const total = month.regularHours + month.overtimeHours;
                const rWidth = total > 0 ? (month.regularHours / maxMonthlyHours) * 100 : 0;
                const oWidth = total > 0 ? (month.overtimeHours / maxMonthlyHours) * 100 : 0;

                return (
                  <div key={idx} className="space-y-1.5 p-1">
                    {/* Header labels */}
                    <div className="flex justify-between text-xs select-none">
                      <span className="font-black text-neutral-700">{month.label}</span>
                      <div className="font-mono text-neutral-500 flex items-baseline gap-1">
                        <span className="text-neutral-800 font-bold">{total} ч</span>
                        {month.overtimeHours > 0 && (
                          <span className="text-blue-600 text-[10px] font-bold">(+{month.overtimeHours} сверхурочных)</span>
                        )}
                      </div>
                    </div>

                    {/* Progress stacked bar visualization */}
                    <div className="w-full bg-neutral-100 rounded-full h-5 overflow-hidden flex shadow-inner relative">
                      {/* Normal (Green) */}
                      {month.regularHours > 0 && (
                        <div 
                          className="bg-emerald-500 h-full flex items-center justify-end pr-2 text-[9px] text-white font-bold"
                          style={{ width: `${rWidth}%` }}
                          title={`Обычные часы: ${month.regularHours} ч.`}
                        >
                          {rWidth > 15 && <span className="font-mono select-none">{month.regularHours}ч.</span>}
                        </div>
                      )}
                      
                      {/* Overtime (Blue) */}
                      {month.overtimeHours > 0 && (
                        <div 
                          className="bg-blue-500 h-full flex items-center justify-start pl-2 text-[9px] text-white font-bold"
                          style={{ width: `${oWidth}%` }}
                          title={`Сверхурочные часы: ${month.overtimeHours} ч`}
                        >
                          {oWidth > 15 && <span className="font-mono select-none">+{month.overtimeHours}ч.</span>}
                        </div>
                      )}
                    </div>
                    
                    {/* Summary row */}
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono select-none pt-0.5">
                      <span>Смен: {month.shiftsCount}</span>
                      <span className="text-neutral-600 font-bold">
                        Начислено: {month.totalEarnings.toLocaleString('ru-RU')} {settings.currency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
