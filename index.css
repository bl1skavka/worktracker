/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSettings } from '../types';
import { 
  Settings, 
  Coins, 
  Clock, 
  Percent, 
  Trash2, 
  Database,
  Download,
  Upload,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SettingsTabProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClearData: () => void;
  onLoadDemoData: () => void;
  onImportData: (shiftsJson: string) => Promise<boolean> | boolean;
  onExportData: () => string;
}

export default function SettingsTab({ 
  settings, 
  onSaveSettings, 
  onClearData, 
  onLoadDemoData,
  onImportData, 
  onExportData 
}: SettingsTabProps) {
  
  const [rate, setRate] = useState<number>(settings.hourlyRate);
  const [currency, setCurrency] = useState<string>(settings.currency);
  const [duration, setDuration] = useState<number>(settings.standardShiftDuration);
  const [multiplier, setMultiplier] = useState<number>(settings.overtimeMultiplier);
  
  const [importText, setImportText] = useState<string>('');
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [showConfirmDemo, setShowConfirmDemo] = useState<boolean>(false);
  
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [exportCopied, setExportCopied] = useState<boolean>(false);

  // Quick Currency options
  const currencies = ['zł', '₽', '$', '€', '₸', 'Br'];

  const handleSaveAll = () => {
    onSaveSettings({
      hourlyRate: rate,
      currency,
      standardShiftDuration: duration,
      overtimeMultiplier: multiplier,
      weeklyGoalHours: 40,
    });
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
    }, 2000);
  };

  const handleExport = () => {
    const jsonStr = onExportData();
    navigator.clipboard.writeText(jsonStr);
    setExportCopied(true);
    setTimeout(() => {
      setExportCopied(false);
    }, 3000);
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    const success = await onImportData(importText);
    setImportSuccess(success);
    if (success) {
      setImportText('');
    }
    setTimeout(() => {
      setImportSuccess(null);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-50 p-4" id="settings-tab-viewport">
      
      {/* Title */}
      <div className="mb-5 select-none">
        <h2 className="text-xl font-black text-neutral-800 tracking-tight flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>Настройки</span>
        </h2>
        <p className="text-xs text-neutral-400">Параметры расчетов, экспорта и управления данными</p>
      </div>

      <div className="space-y-4 pb-8">
        
        {/* Core Calculation Parameters */}
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider mb-2 border-b border-neutral-100 pb-2 select-none">
            Тарифы и нормативы
          </h3>

          {/* 1. Pay rate per hour */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 select-none">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>Часовая ставка ({currency}/час)</span>
            </label>
            <div className="flex gap-2">
              <input 
                id="settings-rate-num"
                type="number"
                value={rate}
                onChange={(e) => setRate(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 px-3 py-2 text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              {/* Currency pills */}
              <div className="flex gap-1">
                {currencies.map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      currency === c 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                        : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Standard Shift Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center select-none">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Длина обычной смены</span>
              </label>
              <span className="text-xs font-bold font-mono text-emerald-600">{duration} ч.</span>
            </div>
            <input 
              id="settings-duration-slider"
              type="range"
              min="4"
              max="12"
              step="1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
              <span>4 ч.</span>
              <span>8 ч. (Стандарт)</span>
              <span>12 ч.</span>
            </div>
          </div>

          {/* 3. Overtime multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center select-none">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-blue-500" />
                <span>Коэффициент сверхурочных</span>
              </label>
              <span className="text-xs font-bold font-mono text-blue-600">{multiplier}x</span>
            </div>
            <input 
              id="settings-multiplier-slider"
              type="range"
              min="1"
              max="3.0"
              step="0.1"
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
              <span>1.0x (Без надбавки)</span>
              <span>1.5x (Стандарт)</span>
              <span>2.0x (Двойной)</span>
              <span>3.0x</span>
            </div>
          </div>

          {/* Save Button */}
          <button
            id="settings-save-btn"
            onClick={handleSaveAll}
            className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
              settingsSaved 
                ? 'bg-emerald-600 text-white' 
                : 'bg-neutral-800 hover:bg-neutral-900 text-white'
            }`}
          >
            {settingsSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Настройки сохранены!</span>
              </>
            ) : (
              <span>Применить параметры</span>
            )}
          </button>

        </div>

        {/* Templates and Sample Data Management */}
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-4 shadow-sm space-y-3.5">
          <h3 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-2 select-none flex items-center gap-1.5">
            <Database className="w-4 h-4 text-indigo-500" />
            <span>Демонстрационные данные</span>
          </h3>
          
          <p className="text-[11px] text-neutral-500 leading-normal select-none">
            Для полноценного ознакомления с возможностями аналитики и графиков (заполненные недели и месяцы), вы можете временно загрузить готовый комплект рабочих смен за Май и Июнь 2026.
          </p>

          {!showConfirmDemo ? (
            <button
              id="btn-trigger-demo-load"
              onClick={() => setShowConfirmDemo(true)}
              className="w-full py-2.5 px-3 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Загрузить учебные смены
            </button>
          ) : (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 text-xs flex flex-col gap-2 select-none">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0 text-indigo-600" />
                Подтверждаете действие?
              </span>
              <span>Это заменит имеющиеся записи на тестовое демо. Вы всегда можете очистить их позже.</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmDemo(false)}
                  className="flex-1 py-1 px-2.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-white text-[11px] font-bold rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  id="btn-confirm-demo-load"
                  onClick={() => {
                    onLoadDemoData();
                    setShowConfirmDemo(false);
                  }}
                  className="flex-1 py-1 px-2.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Загрузить данные
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export / Import Database Area */}
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-2 select-none flex items-center gap-1.5">
            <Download className="w-4 h-4 text-teal-500" />
            <span>Резервная копия (JSON)</span>
          </h3>

          <div className="space-y-3">
            {/* Export action */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-neutral-700 block">Экспорт всех данных</span>
                <span className="text-[10px] text-neutral-400 block">Копировать записи смен в буфер обмена</span>
              </div>
              <button
                id="btn-export-json"
                onClick={handleExport}
                className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{exportCopied ? 'Скопировано!' : 'Экспортировать'}</span>
              </button>
            </div>

            {/* Import action */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-100">
              <div>
                <span className="text-xs font-bold text-neutral-700 block">Импорт данных</span>
                <span className="text-[10px] text-neutral-400 block">Вставьте экспортированный ранее JSON в поле ниже:</span>
              </div>
              <textarea
                id="textarea-import-json"
                placeholder='[{"date":"2026-06-01", "regularHours":8, "overtimeHours":2, ...}]'
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-16 p-2 text-[10px] font-mono text-neutral-750 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <button
                id="btn-import-json"
                onClick={handleImport}
                disabled={!importText.trim()}
                className={`w-full py-2 px-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  !importText.trim()
                    ? 'border-neutral-100 text-neutral-400 bg-neutral-50 cursor-not-allowed'
                    : 'border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Импортировать записи</span>
              </button>
              
              {importSuccess === true && (
                <div className="text-[10px] text-emerald-600 font-bold select-none text-center">
                  Данные смен успешно заменены и перезаписаны!
                </div>
              )}
              {importSuccess === false && (
                <div className="text-[10px] text-red-600 font-bold select-none text-center">
                  Неверный формат JSON. Пожалуйста, проверьте текст резервной копии.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50/50 rounded-3xl border border-red-100 p-4 space-y-3.5">
          <h3 className="text-xs font-extrabold text-red-700 uppercase tracking-wider select-none flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" />
            <span>Опасная зона</span>
          </h3>
          
          <p className="text-[11px] text-red-600 leading-normal select-none">
            Безвозвратное удаление всех смен и очистка базы данных приложения на этом устройстве.
          </p>

          {!showConfirmClear ? (
            <button
              id="settings-trigger-clear-btn"
              onClick={() => setShowConfirmClear(true)}
              className="w-full py-2.5 px-3 border border-red-200 text-red-700 hover:bg-red-100/60 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Очистить базу данных
            </button>
          ) : (
            <div className="p-3 bg-red-100 border border-red-200 text-red-900 text-xs rounded-xl flex flex-col gap-2 select-none">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                Вы абсолютно уверены?
              </span>
              <span>Это удалит абсолютно всю историю смен на устройстве. Действие необратимо.</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 py-1 px-2.5 bg-white border border-red-200 text-red-700 text-[11px] font-bold rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  id="settings-confirm-clear-btn"
                  onClick={() => {
                    onClearData();
                    setShowConfirmClear(false);
                  }}
                  className="flex-1 py-1 px-2.5 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-700 cursor-pointer"
                >
                  Удалить всё
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Application details card */}
        <div className="p-4 bg-neutral-100 rounded-3xl border border-neutral-200/50 flex flex-col gap-1 text-[10px] text-neutral-400 leading-normal select-none">
          <div className="flex items-start gap-1">
            <Info className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-neutral-500 block">Рабочий Календарь v1.0.0</span>
              <span>Приложение полностью автономно, хранит информацию в Вашем браузере (Local Storage) и не передает ее третьим лицам. Личные данные под Вашим полным контролем.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
