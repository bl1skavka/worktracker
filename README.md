/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shift {
  id: string; // Typically YYYY-MM-DD
  date: string; // YYYY-MM-DD
  regularHours: number;
  overtimeHours: number;
  notes: string;
  hourlyRate: number; // rate for regular hours
  overtimeMultiplier: number;
  isOvernight?: boolean;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserSettings {
  hourlyRate: number;
  currency: string;
  standardShiftDuration: number;
  overtimeMultiplier: number;
  weeklyGoalHours: number;
}

export type ActiveTab = 'diary' | 'statistics' | 'settings';
