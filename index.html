/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shift, UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  hourlyRate: 35, // 35 zł (Polish Zloty) per hour as a default
  currency: 'zł',
  standardShiftDuration: 8,
  overtimeMultiplier: 1.5,
  weeklyGoalHours: 40,
};

// Generates realistic mock shifts for May 2026 and standard template entries
export function generateMockShifts(settings: UserSettings): Shift[] {
  const shifts: Shift[] = [];
  
  // June 2026 is the current month
  // May 2026 is the previous month (full of mock data)
  const currentYear = 2026;
  
  // Let's seed May 2026 (Month 4 in JS Date, 0-indexed)
  // For each day in May 2026:
  const daysInMay = 31;
  for (let day = 1; day <= daysInMay; day++) {
    const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
    const dateObj = new Date(currentYear, 4, day);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    
    // Check if weekday
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // 85% chance of working
      if (Math.random() < 0.9) {
        // Regular shifts
        const isFriday = dayOfWeek === 5;
        let regularHours = settings.standardShiftDuration;
        let overtimeHours = 0;
        let notes = 'Обычный рабочий день';
        
        // 40% chance of overtime, except Fridays mostly
        if (Math.random() < 0.4 && !isFriday) {
          const overtimeOptions = [1, 1.5, 2, 3];
          overtimeHours = overtimeOptions[Math.floor(Math.random() * overtimeOptions.length)];
          notes = `Основная смена + сверхурочно ${overtimeHours} ч.`;
        } else if (Math.random() < 0.1) {
          // occasional short day
          regularHours = 6;
          notes = 'Сокращенный рабочий день';
        }
        
        shifts.push({
          id: dateStr,
          date: dateStr,
          regularHours,
          overtimeHours,
          notes,
          hourlyRate: settings.hourlyRate,
          overtimeMultiplier: settings.overtimeMultiplier,
        });
      }
    } else {
      // Weekend: 10% chance of an overtime-only shift on Saturday
      if (dayOfWeek === 6 && Math.random() < 0.15) {
        const overtimeHours = 4;
        shifts.push({
          id: dateStr,
          date: dateStr,
          regularHours: 0,
          overtimeHours,
          notes: 'Субботний выход на сверхурочные',
          hourlyRate: settings.hourlyRate,
          overtimeMultiplier: settings.overtimeMultiplier,
        });
      }
    }
  }

  // Pre-seed a shift for today (June 1st, 2026) to make local setup exciting!
  // It's a Monday. Let's pre-load it as partial or finished standard day.
  shifts.push({
    id: '2026-06-01',
    date: '2026-06-01',
    regularHours: 8,
    overtimeHours: 2,
    notes: 'Первая смена июня, плановые сверхурочные',
    hourlyRate: settings.hourlyRate,
    overtimeMultiplier: settings.overtimeMultiplier,
  });

  return shifts.sort((a, b) => b.date.localeCompare(a.date));
}

// Convert "YYYY-MM-DD" to human readable Russian date e.g. "1 июня, Пн"
export function formatRussianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const dateObj = new Date(year, monthIdx, day);
  
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  const monthName = months[monthIdx];
  const weekdayName = weekdays[dateObj.getDay()];
  
  return `${day} ${monthName}, ${weekdayName}`;
}

export function formatMonthYear(year: number, monthZeroBased: number): string {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return `${months[monthZeroBased]} ${year}`;
}

// Group shifts by Russian calendar weeks (Monday - Sunday) for a given month or globally
export interface WeeklyStats {
  weekKey: string; // e.g. "Неделя 1 (01.05 - 07.05)"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  regularHours: number;
  overtimeHours: number;
  shiftsCount: number;
  regularEarnings: number;
  overtimeEarnings: number;
  totalEarnings: number;
  days: { [dateStr: string]: { regular: number; overtime: number } };
}

export function getWeeklyStats(shifts: Shift[], year: number, monthZeroBased: number, settings: UserSettings): WeeklyStats[] {
  // We want to calculate weekly statistics for specific month.
  // Russian calendar weeks start on Mondays.
  // Let's find all dates in that month, divide them into weeks, and aggregate hours.
  const tempShifts = [...shifts].filter(s => {
    const parts = s.date.split('-');
    return parseInt(parts[0], 10) === year && (parseInt(parts[1], 10) - 1) === monthZeroBased;
  });

  const weeksMap = new Map<number, Shift[]>(); // ISO week number -> shifts

  // Help calculate which week a date belongs to
  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const dayDateOf = (d: Date) => d.toISOString().split('T')[0];

  tempShifts.forEach(shift => {
    const parts = shift.date.split('-');
    const d = new Date(year, monthZeroBased, parseInt(parts[2], 10));
    const weekNum = getWeekNumber(d);
    
    if (!weeksMap.has(weekNum)) {
      weeksMap.set(weekNum, []);
    }
    weeksMap.get(weekNum)!.push(shift);
  });

  // Convert to formatted WeeklyStats array
  const weeklyStats: WeeklyStats[] = [];

  // Sort weeks by number
  const sortedWeekNums = [...weeksMap.keys()].sort((a, b) => a - b);

  sortedWeekNums.forEach((weekNum, index) => {
    const weekShifts = weeksMap.get(weekNum)!;
    let regularHours = 0;
    let overtimeHours = 0;
    let regularEarnings = 0;
    let overtimeEarnings = 0;
    
    // Find min and max dates in this week
    let minDate = '';
    let maxDate = '';
    const days: { [dateStr: string]: { regular: number; overtime: number } } = {};

    weekShifts.forEach(s => {
      regularHours += s.regularHours;
      overtimeHours += s.overtimeHours;
      regularEarnings += s.regularHours * s.hourlyRate;
      overtimeEarnings += s.overtimeHours * s.hourlyRate * s.overtimeMultiplier;
      
      if (!minDate || s.date < minDate) minDate = s.date;
      if (!maxDate || s.date > maxDate) maxDate = s.date;

      days[s.date] = { regular: s.regularHours, overtime: s.overtimeHours };
    });

    // Formatting date range for UI
    const formatShortDate = (dStr: string) => {
      if (!dStr) return '';
      const p = dStr.split('-');
      return `${p[2]}.${p[1]}`;
    };

    const weekLabel = `Неделя ${index + 1} (${formatShortDate(minDate)} - ${formatShortDate(maxDate)})`;

    weeklyStats.push({
      weekKey: weekLabel,
      startDate: minDate,
      endDate: maxDate,
      regularHours,
      overtimeHours,
      shiftsCount: weekShifts.length,
      regularEarnings,
      overtimeEarnings,
      totalEarnings: regularEarnings + overtimeEarnings,
      days
    });
  });

  return weeklyStats;
}
