import React from 'react';
import { Wallet, Download, Plus, Moon, Sun, ShieldAlert, Calendar, ChevronDown, ChevronLeft, ChevronRight, Smartphone, Lightbulb } from 'lucide-react';
import { TabType } from '../types';
import { getMonthNameAndYear } from '../utils/formatters';

interface HeaderProps {
  activeTab: TabType;
  overdueCount: number;
  dueSoonCount: number;
  totalMonthlyDebt: number;
  totalPaidAmount: number;
  selectedMonthKey: string;
  onOpenMonthPicker: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenAddModal: () => void;
  onOpenBackup: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
  onOpenAdvisor?: () => void;
  advisorCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  overdueCount,
  selectedMonthKey,
  onOpenMonthPicker,
  onPrevMonth,
  onNextMonth,
  onOpenAddModal,
  onOpenBackup,
  darkMode,
  onToggleDarkMode,
  onOpenInstallModal,
  isInstalled,
  onOpenAdvisor,
  advisorCount = 0
}) => {
  const currentMonthName = getMonthNameAndYear(selectedMonthKey);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Ana Menü';
      case 'cards':
        return 'Kredi Kartları';
      case 'loans':
        return 'Krediler';
      case 'debts':
        return 'Borçlar';
      case 'receivables':
        return 'Alacaklar';
      default:
        return 'Finans Takip';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg border-b border-slate-800">
      {/* Top Banner */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-md text-slate-950 font-black">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              {getTabTitle()}
            </h1>
            
            {/* Clickable Month Selector Button */}
            <div className="flex items-center space-x-1 mt-0.5">
              <button
                onClick={onPrevMonth}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Önceki Ay"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenMonthPicker}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition active:scale-95 group cursor-pointer"
                title="Aylara Bakmak İçin Tıklayın"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-extrabold capitalize leading-none">
                  {currentMonthName}
                </span>
                <ChevronDown className="w-3 h-3 text-emerald-400/80" />
              </button>

              <button
                onClick={onNextMonth}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Sonraki Ay"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          {!isInstalled && onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 active:scale-95 transition relative group"
              title="Telefona Yükle (PWA)"
            >
              <Smartphone className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </button>
          )}

          {onOpenAdvisor && (
            <button
              onClick={onOpenAdvisor}
              className="p-2 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-slate-800 active:scale-95 transition relative group"
              title="Akıllı Asgari & Taksit Tavsiyesi"
            >
              <Lightbulb className="w-5 h-5 animate-pulse" />
              {advisorCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {advisorCount > 9 ? '9+' : advisorCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
            title="Tema Değiştir"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onOpenBackup}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
            title="Yedekle / Yükle"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenAddModal}
            className="ml-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-md transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Ekle</span>
          </button>
        </div>
      </div>

      {/* Warning Alert Bar if any item is overdue */}
      {overdueCount > 0 && (
        <div className="bg-rose-950/90 border-t border-b border-rose-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-rose-200 animate-pulse">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">
              Dikkat: <strong className="text-rose-300 font-bold">{overdueCount} ödemenin</strong> son ödeme günü geçti!
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
