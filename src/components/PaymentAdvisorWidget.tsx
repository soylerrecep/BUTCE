import React, { useState, useMemo } from 'react';
import { Lightbulb, ArrowRight, Sparkles, Landmark, CreditCard as CardIcon, ChevronDown } from 'lucide-react';
import { CreditCard, Loan, Debt } from '../types';
import { generateRecommendations } from '../utils/paymentAdvisor';
import { formatCurrency } from '../utils/formatters';

interface PaymentAdvisorWidgetProps {
  cards: CreditCard[];
  loans: Loan[];
  debts: Debt[];
  onOpenAdvisor: () => void;
}

export const PaymentAdvisorWidget: React.FC<PaymentAdvisorWidgetProps> = ({
  cards,
  loans,
  debts,
  onOpenAdvisor
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dash_advisor_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleExpand = () => {
    setIsExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dash_advisor_expanded', String(next));
      } catch {}
      return next;
    });
  };

  const recommendations = useMemo(() => {
    return generateRecommendations(cards, loans, debts);
  }, [cards, loans, debts]);

  if (recommendations.length === 0) {
    return null;
  }

  // Top 2 prominent recommendations
  const topRecs = recommendations.slice(0, 2);
  const bestRec = topRecs[0];

  return (
    <div className="bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-blue-500/15 dark:from-amber-950/40 dark:via-emerald-950/25 dark:to-blue-950/30 p-4 rounded-3xl border border-amber-500/30 dark:border-amber-500/25 shadow-sm relative overflow-hidden transition-all duration-200 space-y-3">
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header - Açılır / Kapanır Toggleable */}
      <div
        onClick={toggleExpand}
        className="flex items-center justify-between cursor-pointer select-none group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(); }}
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Akıllı Asgari & Taksit Tavsiyesi
              </h3>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {recommendations.length} Fırsat
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              {isExpanded
                ? 'Bazı kartların asgarisini ödeyerek taksitleri tamamen kapatma fırsatları:'
                : bestRec
                  ? `En iyi fırsat: +${formatCurrency(bestRec.extraCashLeft)} cepte kalır (Genişletmek için dokunun)`
                  : 'Fırsatları görmek için dokunun'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {bestRec && (
            <span className="hidden sm:inline-block text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
              +{formatCurrency(bestRec.extraCashLeft)} Cepte
            </span>
          )}
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="space-y-3 pt-1 border-t border-amber-500/20">
          {/* Recommendation Cards */}
          <div className="space-y-2">
            {topRecs.map(rec => {
              const primaryTarget = rec.targets[0];
              const isLoan = primaryTarget.type === 'loan';

              return (
                <div
                  key={rec.id}
                  onClick={onOpenAdvisor}
                  className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 cursor-pointer transition shadow-sm space-y-1.5 group/card"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`p-1 rounded-lg ${isLoan ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {isLoan ? <Landmark className="w-3.5 h-3.5" /> : <CardIcon className="w-3.5 h-3.5" />}
                      </span>
                      <span className="truncate">{rec.title}</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                      +{formatCurrency(rec.extraCashLeft)} Cepte
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>
                      Asgari: <strong className="text-amber-600 dark:text-amber-400">{formatCurrency(rec.totalMinimumPayment)}</strong>
                      {' ➔ '}
                      Açığa çıkan: <strong className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(rec.totalFreedCash)}</strong>
                    </span>
                    <span className="text-slate-400 group-hover/card:text-amber-500 group-hover/card:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                      <span>İncele</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Button to open modal */}
          <button
            onClick={onOpenAdvisor}
            className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tüm Tavsiyeleri ve Simülasyonu Gör ({recommendations.length} Öneri)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
