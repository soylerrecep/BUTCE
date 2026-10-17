import React from 'react';
import { LayoutDashboard, CreditCard as CardIcon, Landmark, ReceiptText, HandCoins } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  cardsCount: number;
  loansCount: number;
  debtsCount: number;
  receivablesCount?: number;
  unpaidTotalCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cardsCount,
  loansCount,
  debtsCount,
  receivablesCount = 0,
  unpaidTotalCount
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Ana Menü',
      icon: LayoutDashboard,
      badge: unpaidTotalCount > 0 ? unpaidTotalCount : null,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'cards' as TabType,
      label: 'Kartlar',
      icon: CardIcon,
      badge: cardsCount > 0 ? cardsCount : null,
      badgeColor: 'bg-emerald-600 dark:bg-emerald-500'
    },
    {
      id: 'loans' as TabType,
      label: 'Krediler',
      icon: Landmark,
      badge: loansCount > 0 ? loansCount : null,
      badgeColor: 'bg-blue-600 dark:bg-blue-500'
    },
    {
      id: 'debts' as TabType,
      label: 'Borçlar',
      icon: ReceiptText,
      badge: debtsCount > 0 ? debtsCount : null,
      badgeColor: 'bg-amber-600 dark:bg-amber-500'
    },
    {
      id: 'receivables' as TabType,
      label: 'Alacaklar',
      icon: HandCoins,
      badge: receivablesCount > 0 ? receivablesCount : null,
      badgeColor: 'bg-teal-600 dark:bg-teal-500'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400 select-none pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-115 text-emerald-400 stroke-[2.5]' : 'stroke-[1.75]'
                  }`}
                />
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[10px] font-extrabold text-white px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-none ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-full px-0.5 ${isActive ? 'font-semibold text-emerald-400' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
