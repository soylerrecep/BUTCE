import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface MonthPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonthKey: string; // e.g. "2026-08"
  onSelectMonth: (monthKey: string) => void;
  scheduledMonths?: string[];
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  isOpen,
  onClose,
  selectedMonthKey,
  onSelectMonth,
  scheduledMonths = []
}) => {
  const [selectedYearStr, selectedMonthStr] = (selectedMonthKey || '2026-08').split('-');
  const [viewYear, setViewYear] = useState<number>(parseInt(selectedYearStr, 10) || 2026);

  useEffect(() => {
    if (isOpen) {
      const [yStr] = (selectedMonthKey || '2026-08').split('-');
      setViewYear(parseInt(yStr, 10) || 2026);
    }
  }, [isOpen, selectedMonthKey]);

  if (!isOpen) return null;

  const selectedMonthNum = parseInt(selectedMonthStr, 10); // 1-12

  // Current real date info
  const today = new Date();
  const realYear = today.getFullYear();
  const realMonthNum = today.getMonth() + 1; // 1-12

  const handleSelect = (monthIndex1Based: number) => {
    const formattedMonth = monthIndex1Based.toString().padStart(2, '0');
    const newMonthKey = `${viewYear}-${formattedMonth}`;
    onSelectMonth(newMonthKey);
    onClose();
  };

  const handlePrevYear = () => setViewYear(prev => prev - 1);
  const handleNextYear = () => setViewYear(prev => prev + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Dönem / Ay Seçin
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Ödemelerini görüntülemek istediğiniz ayı seçin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Year Selector */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevYear}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
              {viewYear}
            </span>
            <button
              onClick={handleNextYear}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 12 Month Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {MONTH_NAMES.map((name, index) => {
              const monthNum = index + 1;
              const isSelected = viewYear === parseInt(selectedYearStr, 10) && monthNum === selectedMonthNum;
              const isRealCurrent = viewYear === realYear && monthNum === realMonthNum;
              const monthKeyForBtn = `${viewYear}-${monthNum.toString().padStart(2, '0')}`;
              const hasScheduledData = scheduledMonths.includes(monthKeyForBtn);

              return (
                <button
                  key={name}
                  onClick={() => handleSelect(monthNum)}
                  className={`relative p-3 rounded-2xl border text-center font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                      : isRealCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400/50 hover:border-emerald-500'
                      : hasScheduledData
                      ? 'bg-amber-500/10 dark:bg-amber-950/20 text-slate-900 dark:text-white border-amber-500/40 hover:border-amber-500'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="block">{name}</span>
                  {isSelected ? (
                    <span className="text-[10px] font-extrabold bg-slate-950/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check className="w-3 h-3 stroke-[3]" /> Seçili
                    </span>
                  ) : hasScheduledData ? (
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-md">
                      🗓️ Plan Var
                    </span>
                  ) : isRealCurrent ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Mevcut Ay
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Action Pills */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
              Hızlı Erişim:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const m = realMonthNum.toString().padStart(2, '0');
                  onSelectMonth(`${realYear}-${m}`);
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-slate-700"
              >
                Mevcut Ay ({MONTH_NAMES[realMonthNum - 1]})
              </button>

              <button
                onClick={() => {
                  let nextM = realMonthNum + 1;
                  let nextY = realYear;
                  if (nextM > 12) {
                    nextM = 1;
                    nextY += 1;
                  }
                  const m = nextM.toString().padStart(2, '0');
                  onSelectMonth(`${nextY}-${m}`);
                  onClose();
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-slate-700"
              >
                Gelecek Ay ({MONTH_NAMES[(realMonthNum % 12)]})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
