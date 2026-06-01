/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Shift, UserSettings } from '../types';
import { formatRussianDate, formatMonthYear } from '../utils/data';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Coins, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Calendar as CalendarIcon,
  Briefcase,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarTabProps {
  shifts: Shift[];
  onSaveShift: (shift: Shift) => void;
  onDeleteShift: (dateStr: string) => void;
  settings: UserSettings;
}

export default function CalendarTab({ shifts, onSaveShift, onDeleteShift, settings }: CalendarTabProps) {
  // We starts with June 2026 (current time is June 1st, 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed: 5 is June
  
  // Format today as YYYY-MM-DD
  const todayStr = '2026-06-01'; 
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Find shift for selected day
  const selectedShift = useMemo(() => {
    return shifts.find(s => s.date === selectedDate);
  }, [shifts, selectedDate]);

  // Draft state for selected day shift editor
  const [draftRegular, setDraftRegular] = useState<number>(8);
  const [draftOvertime, setDraftOvertime] = useState<number>(0);
  const [draftNotes, setDraftNotes] = useState<string>('');
  const [draftIsOvernight, setDraftIsOvernight] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync draft whenever selectedDate or selectedShift changes
  React.useEffect(() => {
    if (selectedShift) {
      setDraftRegular(selectedShift.regularHours);
      setDraftOvertime(selectedShift.overtimeHours);
      setDraftNotes(selectedShift.notes);
      setDraftIsOvernight(selectedShift.isOvernight || false);
    } else {
      // Default template values
      setDraftRegular(0);
      setDraftOvertime(0);
      setDraftNotes('');
      setDraftIsOvernight(false);
    }
    setSaveSuccess(false);
  }, [selectedDate, selectedShift]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const numDays = lastDay.getDate();
    
    // JS Day of week: 0 is Sunday, 1 is Monday ... 6 is Saturday
    const jsDay = firstDay.getDay();
    // Ru Day of week: 0 is Monday, 6 is Sunday
    const blanksCount = jsDay === 0 ? 6 : jsDay - 1;
    
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    
    // Previous month blanks
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = blanksCount - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const mIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const yIdx = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dateStr: `${yIdx}-${(mIdx + 1).toString().padStart(2, '0')}-${dNum.toString().padStart(2, '0')}`,
        dayNum: dNum,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= numDays; d++) {
      days.push({
        dateStr: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Next month fillers (to make full 6 rows if necessary or pad grid)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingBlanks = totalCells - days.length;
    for (let d = 1; d <= remainingBlanks; d++) {
      const mIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const yIdx = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        dateStr: `${yIdx}-${(mIdx + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Handle month navigation
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

  // Quick entries
  const handleQuickAdd = (reg: number, ov: number, text: string) => {
    setDraftRegular(reg);
    setDraftOvertime(ov);
    setDraftNotes(text);
    setDraftIsOvernight(false);
  };

  const handleSave = () => {
    const shift: Shift = {
      id: selectedDate,
      date: selectedDate,
      regularHours: draftRegular,
      overtimeHours: draftOvertime,
      notes: draftNotes.trim() || (draftRegular > 0 || draftOvertime > 0 ? 'Запись времени' : ''),
      hourlyRate: settings.hourlyRate,
      overtimeMultiplier: settings.overtimeMultiplier,
      isOvernight: draftIsOvernight,
    };
    
    onSaveShift(shift);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleDelete = () => {
    onDeleteShift(selectedDate);
    setDraftRegular(0);
    setDraftOvertime(0);
    setDraftNotes('');
    setDraftIsOvernight(false);
    setSaveSuccess(false);
  };

  // Cumulative monthly stats for display at header of screen
  const monthStats = useMemo(() => {
    const monthShifts = shifts.filter(s => {
      const parts = s.date.split('-');
      return parseInt(parts[0], 10) === currentYear && (parseInt(parts[1], 10) - 1) === currentMonth;
    });

    let totalReg = 0;
    let totalOvt = 0;
    monthShifts.forEach(s => {
      totalReg += s.regularHours;
      totalOvt += s.overtimeHours;
    });

    const regEarnings = totalReg * settings.hourlyRate;
    const ovtEarnings = totalOvt * settings.hourlyRate * settings.overtimeMultiplier;

    return {
      regularHours: totalReg,
      overtimeHours: totalOvt,
      shiftsCount: monthShifts.length,
      estimatedEarnings: regEarnings + ovtEarnings,
    };
  }, [shifts, currentYear, currentMonth, settings]);

  // Math earnings for the interactive sliders
  const currentDraftEarnings = useMemo(() => {
    const regPay = draftRegular * settings.hourlyRate;
    const ovtPay = draftOvertime * (settings.hourlyRate * settings.overtimeMultiplier);
    return {
      regular: regPay,
      overtime: ovtPay,
      total: regPay + ovtPay
    };
  }, [draftRegular, draftOvertime, settings]);

  return (
    <div className="flex-1 flex flex-col bg-neutral-50" id="calendar-view-container">
      
      {/* Monthly Summary Quick Widget - Material Design 3 style bar */}
      <div className="px-5 py-4 bg-emerald-700 text-white rounded-b-3xl shadow-md shrink-0 flex flex-col gap-2 transition-all">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold font-sans mb-0.5">Баланс за месяц</h2>
            <div className="text-2xl font-bold flex items-baseline gap-1 font-mono tracking-tight text-white">
              {monthStats.estimatedEarnings.toLocaleString('ru-RU')}
              <span className="text-base font-normal text-emerald-100">{settings.currency}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium bg-emerald-800/60 backdrop-blur px-2.5 py-1 rounded-full text-emerald-100">
              Смен: {monthStats.shiftsCount}
            </span>
          </div>
        </div>
        
        {/* Progress bars / Hours Summary */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-600/50 mt-1 select-none">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 bg-emerald-300 rounded-full shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-100 block">Обычное время</span>
              <span className="text-xs font-bold font-mono text-white">{monthStats.regularHours} ч.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 bg-blue-300 rounded-full shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-100 block">Сверхурочные</span>
              <span className="text-xs font-bold font-mono text-white text-blue-100">+{monthStats.overtimeHours} ч.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Header with Controls */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between shrink-0">
        <h3 className="text-md font-extrabold text-neutral-800 font-sans tracking-tight">
          {formatMonthYear(currentYear, currentMonth)}
        </h3>
        
        <div className="flex items-center gap-1.5">
          <button 
            id="prev-month-btn"
            onClick={prevMonth}
            className="w-8 py-1.5 flex items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-sm hover:surface-active cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            id="today-month-btn"
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(5); // June
              setSelectedDate('2026-06-01');
            }}
            className="px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:text-neutral-900 shadow-sm cursor-pointer transition-all"
          >
            Июнь 2026
          </button>

          <button 
            id="next-month-btn"
            onClick={nextMonth}
            className="w-8 py-1.5 flex items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-sm hover:surface-active cursor-pointer transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Layout */}
      <div className="px-4 shrink-0">
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-3 shadow-sm">
          {/* Weekday Titles */}
          <div className="grid grid-cols-7 text-center mb-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-sans select-none">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div className="text-amber-500">Сб</div>
            <div className="text-red-500">Вс</div>
          </div>
          
          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const hasShift = shifts.find(s => s.date === day.dateStr);
              const isSelected = selectedDate === day.dateStr;
              const isToday = day.dateStr === todayStr;

              // Color of day number text
              let dayTextColor = day.isCurrentMonth ? 'text-neutral-800' : 'text-neutral-300';
              // Check if weekend to recolor text if active month
              const dayObj = new Date(day.dateStr);
              const dayOfWeek = dayObj.getDay();
              if (day.isCurrentMonth) {
                if (dayOfWeek === 0) dayTextColor = 'text-red-500 font-medium'; // Sunday
                else if (dayOfWeek === 6) dayTextColor = 'text-amber-500 font-medium'; // Saturday
              }

              return (
                <button
                  id={`day-cell-${day.dateStr}`}
                  key={`${day.dateStr}-${idx}`}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`aspect-square flex flex-col justify-between p-1 rounded-xl transition-all relative border outline-none cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/10' 
                      : isToday
                      ? 'border-neutral-400 bg-neutral-100/50'
                      : 'border-transparent hover:bg-neutral-50'
                  }`}
                >
                  {/* Day Number and small Today/Overnight indicators */}
                  <div className="flex justify-between items-center w-full select-none">
                    <div className="flex items-center gap-1">
                      <span className={`text-[11px] font-bold ${dayTextColor}`}>
                        {day.dayNum}
                      </span>
                      {hasShift?.isOvernight && (
                        <span className="text-[10px]" title="Смена переходит на следующий день (вечер → утро)">🌙</span>
                      )}
                    </div>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" title="Сегодня" />
                    )}
                  </div>

                  {/* Hourly Indicators inside calendar cell */}
                  {hasShift && (hasShift.regularHours > 0 || hasShift.overtimeHours > 0) ? (
                    <div className="flex flex-col gap-0.5 w-full mt-auto">
                      {/* Normal Hours Bar/Dot Indicator in Green */}
                      {hasShift.regularHours > 0 && (
                        <div 
                          className="h-1.5 rounded-sm bg-emerald-500 text-[8px] font-black text-white flex items-center justify-center shrink-0" 
                          title={`Обычные: ${hasShift.regularHours}ч.`}
                        >
                          <span className="scale-75 origin-center">{hasShift.regularHours}</span>
                        </div>
                      )}
                      {/* Overtime Hours Bar/Dot Indicator in Blue */}
                      {hasShift.overtimeHours > 0 && (
                        <div 
                          className="h-1.5 rounded-sm bg-blue-500 text-[8px] font-black text-white flex items-center justify-center shrink-0"
                          title={`Сверхурочные: ${hasShift.overtimeHours}ч.`}
                        >
                          <span className="scale-75 origin-center">+{hasShift.overtimeHours}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-3.5" /> // spacing helper
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor Panel for selected day */}
      <div className="px-4 py-3 pb-8 shrink-0 flex-1 flex flex-col">
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-4 shadow-sm h-full flex flex-col">
          
          {/* Editor Header */}
          <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4 select-none">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">Выбранный день</span>
              <h4 className="text-sm font-bold text-neutral-800">
                {formatRussianDate(selectedDate)}
              </h4>
            </div>
            {selectedShift ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Записано</span>
                </div>
                {selectedShift.isOvernight && (
                  <div className="flex items-center gap-1 text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                    <span>🌙 Вечер → Утро</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-neutral-400 italic px-2 py-1">
                Смена пустая
              </div>
            )}
          </div>

          {/* Quick Setup shortcuts */}
          <div className="mb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2 val-header select-none">Быстрый выбор</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-quick-standard"
                onClick={() => handleQuickAdd(8, 0, 'Обычная рабочая смена')}
                className="py-2 px-1 text-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all border border-emerald-100 cursor-pointer"
              >
                Обычная 8 ч.
              </button>
              <button
                id="btn-quick-ot-2"
                onClick={() => handleQuickAdd(8, 2, 'Рабочая смена + сверхурочно 2ч')}
                className="py-2 px-1 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all border border-blue-100 cursor-pointer"
              >
                Смена + 2 ч.
              </button>
              <button
                id="btn-quick-weekend"
                onClick={() => handleQuickAdd(0, 4, 'Субботняя сверхурочная смена')}
                className="py-2 px-1 text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all border border-indigo-100 cursor-pointer"
              >
                Сверхурочно 4 ч.
              </button>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {/* 1. Regular Hours Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5 select-none">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Обычное время (зеленое)</span>
                </label>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {draftRegular} ч.
                </span>
              </div>
              <input 
                id="regular-hours-slider"
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={draftRegular}
                onChange={(e) => setDraftRegular(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-neutral-200 rounded-lg cursor-pointer appearance-none outline-none"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono mt-1">
                <span>0 ч.</span>
                <span>4 ч.</span>
                <span className="font-bold text-emerald-600">8 ч. (Норма)</span>
                <span>12 ч.</span>
              </div>
            </div>

            {/* 2. Overtime Hours Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5 select-none">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  <span>Сверхурочно (синее)</span>
                </label>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  +{draftOvertime} ч.
                </span>
              </div>
              <input 
                id="overtime-hours-slider"
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={draftOvertime}
                onChange={(e) => setDraftOvertime(parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-neutral-200 rounded-lg cursor-pointer appearance-none outline-none"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono mt-1">
                <span>0 ч.</span>
                <span>2 ч.</span>
                <span>4 ч.</span>
                <span>8 ч.</span>
                <span>12 ч.</span>
              </div>
            </div>

            {/* 3. Notes Input */}
            <div>
              <label className="text-xs font-bold text-neutral-600 flex items-center gap-1 mb-1.5 select-none">
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Заметка к смене</span>
              </label>
              <input 
                id="shift-notes-input"
                type="text"
                placeholder="Например: Смена на складе"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs text-neutral-800 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* 4. Overnight Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/60 bg-neutral-50 hover:bg-neutral-150/40 transition-all select-none">
              <div className="flex items-start gap-2.5 max-w-[80%]">
                <span className="text-md mt-0.5" role="img" aria-label="moon">🌙</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-800 leading-tight">Вечерняя / ночная смена</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 leading-tight">Работа начинается вечером одного дня и заканчивается утром следующего</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  id="overnight-shift-toggle"
                  type="checkbox"
                  checked={draftIsOvernight}
                  onChange={(e) => setDraftIsOvernight(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            
            {/* Earnings calculation indicator for that specific draft */}
            {(draftRegular > 0 || draftOvertime > 0) && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/50 flex flex-col gap-1 text-[11px] text-neutral-600 font-sans">
                <div className="flex justify-between font-mono">
                  <span>Обычное время:</span>
                  <span>{draftRegular} ч. × {settings.hourlyRate} {settings.currency} = {(draftRegular * settings.hourlyRate).toLocaleString('ru-RU')} {settings.currency}</span>
                </div>
                {draftOvertime > 0 && (
                  <div className="flex justify-between font-mono text-blue-600">
                    <span>Сверхурочно ({settings.overtimeMultiplier}x):</span>
                    <span>{draftOvertime} ч. × {(settings.hourlyRate * settings.overtimeMultiplier)} {settings.currency} = {currentDraftEarnings.overtime.toLocaleString('ru-RU')} {settings.currency}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-dashed border-neutral-200 pt-1 mt-1 text-xs text-neutral-800 font-mono">
                  <span>Итого за день:</span>
                  <span>{currentDraftEarnings.total.toLocaleString('ru-RU')} {settings.currency}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-100 shrink-0">
            {selectedShift && (
              <button
                id="delete-shift-btn"
                onClick={handleDelete}
                className="px-3 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all shrink-0"
                title="Очистить и удалить запись"
              >
                <span>Удалить</span>
              </button>
            )}
            
            <button
              id="save-shift-btn"
              onClick={handleSave}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all ${
                saveSuccess 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/10' 
                  : 'bg-neutral-800 hover:bg-neutral-900 text-white shadow-neutral-800/10'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 ml-0.5 mt-0.5" />
                  <span>Сохранено!</span>
                </>
              ) : (
                <>
                  <span>Записать время</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
