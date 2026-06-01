/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import AndroidFrame from './components/AndroidFrame';
import CalendarTab from './components/CalendarTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import { Shift, UserSettings, ActiveTab } from './types';
import { DEFAULT_SETTINGS, generateMockShifts } from './utils/data';
import { Calendar as CalendarIcon, BarChart3, Settings as SettingsIcon } from 'lucide-react';

// Firebase core components
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';

const STORAGE_SHIFTS_KEY = 'work_hours_tracker_shifts_v1';
const STORAGE_SETTINGS_KEY = 'work_hours_tracker_settings_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('diary');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Shifts state
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem(STORAGE_SHIFTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading shifts', e);
      }
    }
    // First-time fallback: generate May & June 2026 realistic shifts for guest view
    const seeded = generateMockShifts(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(seeded));
    return seeded;
  });

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync state between client/local storage and Firebase Firestore
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Offline fallback: reload from local localStorage
      const savedShifts = localStorage.getItem(STORAGE_SHIFTS_KEY);
      if (savedShifts) {
        try {
          const parsed = JSON.parse(savedShifts);
          if (Array.isArray(parsed)) {
            setShifts(parsed);
          }
        } catch (e) {
          console.error('Error parsing local shifts', e);
        }
      } else {
        // Pre-fill fallback if user signed out and storage is empty
        const seeded = generateMockShifts(settings);
        setShifts(seeded);
        localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(seeded));
      }

      const savedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Error parsing local settings', e);
        }
      }
      return;
    }

    // ONLINE MODE: Registered synchronized real-time Firestore listeners
    const userRef = doc(db, 'users', user.uid);
    
    // 1. Sync User Personal Settings
    const unsubscribeSettings = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const serverSettings: UserSettings = {
          hourlyRate: data.hourlyRate,
          currency: data.currency,
          standardShiftDuration: data.standardShiftDuration,
          overtimeMultiplier: data.overtimeMultiplier,
          weeklyGoalHours: data.weeklyGoalHours
        };
        setSettings(serverSettings);
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(serverSettings));
      } else {
        // Document does not exist on remote server yet. Record initial offline configurations
        setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          hourlyRate: settings.hourlyRate,
          currency: settings.currency,
          standardShiftDuration: settings.standardShiftDuration,
          overtimeMultiplier: settings.overtimeMultiplier,
          weeklyGoalHours: settings.weeklyGoalHours,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    // 2. Sync Shift Entries
    const shiftsRef = collection(db, 'users', user.uid, 'shifts');
    const unsubscribeShifts = onSnapshot(shiftsRef, (snapshot) => {
      const remoteShifts: Shift[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        remoteShifts.push({
          id: data.id,
          date: data.date,
          regularHours: data.regularHours,
          overtimeHours: data.overtimeHours,
          notes: data.notes || '',
          hourlyRate: data.hourlyRate,
          overtimeMultiplier: data.overtimeMultiplier,
          isOvernight: data.isOvernight || false,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });

      const sorted = remoteShifts.sort((a, b) => b.date.localeCompare(a.date));
      
      // Auto-migrate local data if user just signed up and firestore shifts collection is empty
      const storedLocalShifts = localStorage.getItem(STORAGE_SHIFTS_KEY);
      let localShiftsParsed: Shift[] = [];
      if (storedLocalShifts) {
        try {
          localShiftsParsed = JSON.parse(storedLocalShifts);
        } catch (e) {}
      }

      if (sorted.length === 0 && localShiftsParsed.length > 0) {
        // Upload each local shift to cloud database
        localShiftsParsed.forEach(async (shift) => {
          try {
            await setDoc(doc(db, 'users', user.uid, 'shifts', shift.id), {
              id: shift.id,
              date: shift.date,
              regularHours: shift.regularHours,
              overtimeHours: shift.overtimeHours,
              notes: shift.notes || '',
              hourlyRate: shift.hourlyRate,
              overtimeMultiplier: shift.overtimeMultiplier,
              isOvernight: shift.isOvernight || false,
              userId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (err) {
            console.error("Failed to migrate shift to Firestore:", err);
          }
        });
      } else {
        setShifts(sorted);
        localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(sorted));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/shifts`);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeShifts();
    };
  }, [user, authLoading]);

  // Handle shift saves/updates
  const handleSaveShift = async (newShift: Shift) => {
    // 1. Optimistic / offline update for fast UI feel
    setShifts(prev => {
      const filtered = prev.filter(s => s.date !== newShift.date);
      let updated = [];
      if (newShift.regularHours > 0 || newShift.overtimeHours > 0) {
        updated = [...filtered, newShift];
      } else {
        updated = filtered;
      }
      const sorted = updated.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(sorted));
      return sorted;
    });

    // 2. Synchronize to Firestore online
    if (user) {
      const shiftRef = doc(db, 'users', user.uid, 'shifts', newShift.date);
      if (newShift.regularHours === 0 && newShift.overtimeHours === 0) {
        try {
          await deleteDoc(shiftRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/shifts/${newShift.date}`);
        }
      } else {
        const existsInLocal = shifts.some(s => s.date === newShift.date);
        if (existsInLocal) {
          try {
            await updateDoc(shiftRef, {
              regularHours: newShift.regularHours,
              overtimeHours: newShift.overtimeHours,
              notes: newShift.notes || '',
              hourlyRate: newShift.hourlyRate || settings.hourlyRate,
              overtimeMultiplier: newShift.overtimeMultiplier || settings.overtimeMultiplier,
              isOvernight: newShift.isOvernight || false,
              updatedAt: serverTimestamp()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/shifts/${newShift.date}`);
          }
        } else {
          try {
            await setDoc(shiftRef, {
              id: newShift.date,
              date: newShift.date,
              regularHours: newShift.regularHours,
              overtimeHours: newShift.overtimeHours,
              notes: newShift.notes || '',
              hourlyRate: newShift.hourlyRate || settings.hourlyRate,
              overtimeMultiplier: newShift.overtimeMultiplier || settings.overtimeMultiplier,
              isOvernight: newShift.isOvernight || false,
              userId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/shifts/${newShift.date}`);
          }
        }
      }
    }
  };

  // Handle deleting individual shift logs
  const handleDeleteShift = async (dateStr: string) => {
    setShifts(prev => {
      const filtered = prev.filter(s => s.date !== dateStr);
      localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(filtered));
      return filtered;
    });

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'shifts', dateStr));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/shifts/${dateStr}`);
      }
    }
  };

  // Handle configuration changes
  const handleSaveSettings = async (updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updatedSettings));
    
    // Recalculate local models as fallback caching
    setShifts(prev => {
      const updated = prev.map(s => ({
        ...s,
        hourlyRate: updatedSettings.hourlyRate,
        overtimeMultiplier: updatedSettings.overtimeMultiplier
      }));
      localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(updated));
      return updated;
    });

    // Write settings and update shift rates on Firestore online
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          hourlyRate: updatedSettings.hourlyRate,
          currency: updatedSettings.currency,
          standardShiftDuration: updatedSettings.standardShiftDuration,
          overtimeMultiplier: updatedSettings.overtimeMultiplier,
          weeklyGoalHours: updatedSettings.weeklyGoalHours,
          updatedAt: serverTimestamp()
        });

        // Parallel non-blocking write updates for live Firestore collection
        shifts.forEach(async (shift) => {
          try {
            await updateDoc(doc(db, 'users', user.uid, 'shifts', shift.id), {
              hourlyRate: updatedSettings.hourlyRate,
              overtimeMultiplier: updatedSettings.overtimeMultiplier,
              updatedAt: serverTimestamp()
            });
          } catch (e) {
            console.error("Background Firestore rates update failed", e);
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  // Google Login Flows
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Google login failed:", e);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Google logout failed:", e);
    }
  };

  const handleClearData = async () => {
    setShifts([]);
    localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify([]));

    if (user) {
      // Clean collection on server as well
      try {
        shifts.forEach(async (s) => {
          await deleteDoc(doc(db, 'users', user.uid, 'shifts', s.id));
        });
      } catch (e) {
        console.error("Failed to clear firestore shifts", e);
      }
    }
  };

  const handleLoadDemoData = async () => {
    const demo = generateMockShifts(settings);
    setShifts(demo);
    localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(demo));

    if (user) {
      // Synchronize in batch
      demo.forEach(async (shift) => {
        try {
          await setDoc(doc(db, 'users', user.uid, 'shifts', shift.id), {
            id: shift.id,
            date: shift.date,
            regularHours: shift.regularHours,
            overtimeHours: shift.overtimeHours,
            notes: shift.notes || '',
            hourlyRate: shift.hourlyRate,
            overtimeMultiplier: shift.overtimeMultiplier,
            userId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (e) {}
      });
    }
  };

  const handleImportData = async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        const isValid = parsed.every(item => 
          typeof item === 'object' && 
          'date' in item && 
          'regularHours' in item && 
          'overtimeHours' in item
        );
        if (isValid) {
          setShifts(parsed);
          localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(parsed));

          if (user) {
            // Write each to firestore
            parsed.forEach(async (shift) => {
              try {
                await setDoc(doc(db, 'users', user.uid, 'shifts', shift.id || shift.date), {
                  id: shift.id || shift.date,
                  date: shift.date,
                  regularHours: shift.regularHours,
                  overtimeHours: shift.overtimeHours,
                  notes: shift.notes || '',
                  hourlyRate: shift.hourlyRate || settings.hourlyRate,
                  overtimeMultiplier: shift.overtimeMultiplier || settings.overtimeMultiplier,
                  isOvernight: shift.isOvernight || false,
                  userId: user.uid,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                });
              } catch (e) {}
            });
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleExportData = (): string => {
    return JSON.stringify(shifts, null, 2);
  };

  const tabHeaders: { [key in ActiveTab]: string } = {
    diary: '🗓️ Рабочий дневник',
    statistics: '📊 Статистика',
    settings: '⚙️ Настройки программы'
  };

  return (
    <AndroidFrame>
      <div className="flex-1 flex flex-col h-full bg-neutral-50 overflow-hidden" id="app-root-inner-layout">
        
        {/* Main scrollable body encompassing header, sync status and tab contents */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0" id="scrollable-content-area">
          {/* App Top Toolbar */}
          <header className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-5 py-2 select-none shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden">
                <img src="/app_logo.png" alt="Логотип" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight leading-tight">
                  Рабочий Календарь
                </h1>
                <span className="text-[9px] text-neutral-400 font-medium block leading-none">
                  {tabHeaders[activeTab]}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-emerald-400 font-extrabold font-mono uppercase bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900/40">
              Android Web
            </div>
          </header>

          {/* Cloud Sync Status Banner */}
          <div className="bg-neutral-800 border-b border-neutral-700/80 px-4 py-2 flex items-center justify-between text-xs select-none shrink-0 z-10" id="sync-banner">
            {authLoading ? (
              <div className="flex items-center gap-2 text-neutral-400 py-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[11px]">Загрузка облачного профиля...</span>
              </div>
            ) : user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  {user.photoURL ? (
                    <img src={user.photoURL} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full border border-emerald-500/20" alt="" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                      {user.email ? user.email[0] : 'U'}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[11px] text-neutral-200 truncate max-w-[170px] sm:max-w-xs font-semibold">{user.email}</span>
                    <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 leading-none mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Синхронизация включена
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-800 text-neutral-200 transition-colors px-2.5 py-1 rounded-lg text-[10px] font-bold border border-neutral-600 cursor-pointer shadow-sm active:scale-95 duration-100"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 text-neutral-300 font-medium leading-tight">
                  <span className="text-[15px]">☁️</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white font-semibold">Синхронизация отключена</span>
                    <span className="text-[9px] text-neutral-400 leading-none mt-0.5">Редактируйте на разных устройствах без потерь</span>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  className="bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 transition-all font-semibold rounded-lg px-3 py-1 flex items-center gap-1.5 text-[10px] shadow-sm cursor-pointer border border-neutral-300 transform active:scale-95 duration-100"
                >
                  {/* Standard Google logo design */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Вход
                </button>
              </div>
            )}
          </div>

          {/* Tab content area */}
          <main className="flex-1 flex flex-col relative">
            {activeTab === 'diary' && (
              <CalendarTab 
                shifts={shifts}
                onSaveShift={handleSaveShift}
                onDeleteShift={handleDeleteShift}
                settings={settings}
              />
            )}

            {activeTab === 'statistics' && (
              <StatsTab 
                shifts={shifts}
                settings={settings}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onClearData={handleClearData}
                onLoadDemoData={handleLoadDemoData}
                onImportData={handleImportData}
                onExportData={handleExportData}
              />
            )}
          </main>
        </div>

        {/* Bottom Navigation Dock */}
        <nav className="h-16 bg-white border-t border-neutral-200 flex items-center justify-around px-2 pb-1.5 shrink-0 z-25 relative shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.05)] select-none">
          {/* Tab 1: Diary */}
          <button
            id="tab-btn-diary"
            onClick={() => setActiveTab('diary')}
            className="flex-1 flex flex-col items-center justify-center py-1.5 outline-none cursor-pointer group"
          >
            <div className={`px-5 py-1 rounded-full transition-all flex items-center justify-center ${
              activeTab === 'diary' 
                ? 'bg-emerald-100 text-emerald-800 scale-105' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}>
              <CalendarIcon className="w-5 h-5 transition-transform" />
            </div>
            <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
              activeTab === 'diary' ? 'text-emerald-800 font-extrabold' : 'text-neutral-500'
            }`}>
              Дневник
            </span>
          </button>

          {/* Tab 2: Statistics */}
          <button
            id="tab-btn-statistics"
            onClick={() => setActiveTab('statistics')}
            className="flex-1 flex flex-col items-center justify-center py-1.5 outline-none cursor-pointer group"
          >
            <div className={`px-5 py-1 rounded-full transition-all flex items-center justify-center ${
              activeTab === 'statistics' 
                ? 'bg-emerald-100 text-emerald-800 scale-105' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}>
              <BarChart3 className="w-5 h-5 transition-transform" />
            </div>
            <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
              activeTab === 'statistics' ? 'text-emerald-800 font-extrabold' : 'text-neutral-500'
            }`}>
              Статистика
            </span>
          </button>

          {/* Tab 3: Settings */}
          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className="flex-1 flex flex-col items-center justify-center py-1.5 outline-none cursor-pointer group"
          >
            <div className={`px-5 py-1 rounded-full transition-all flex items-center justify-center ${
              activeTab === 'settings' 
                ? 'bg-emerald-100 text-emerald-800 scale-105' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}>
              <SettingsIcon className="w-5 h-5 transition-transform" />
            </div>
            <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
              activeTab === 'settings' ? 'text-emerald-800 font-extrabold' : 'text-neutral-500'
            }`}>
              Настройки
            </span>
          </button>
        </nav>

      </div>
    </AndroidFrame>
  );
}
