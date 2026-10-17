import React, { useState } from 'react';
import { Landmark, Plus, CheckCircle2, Edit3, Trash2, Calendar, TrendingDown, Layers, Lightbulb, ChevronRight } from 'lucide-react';
import { Loan } from '../types';
import { formatCurrency, getDueDateLabel } from '../utils/formatters';

interface LoansViewProps {
  loans: Loan[];
  onTogglePaid: (id: string) => void;
  onOpenAddModal: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onOpenAdvisor?: (targetId?: string) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  onTogglePaid,
  onOpenAddModal,
  onEditLoan,
  onDeleteLoan,
  onOpenAdvisor
}) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const totalMonthlyInstallment = loans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
  const totalRemainingDebt = loans.reduce((sum, l) => sum + (l.monthlyInstallment * l.remainingInstallments || 0), 0);
  const totalOriginalDebt = loans.reduce((sum, l) => sum + (l.totalAmount || 0), 0);

  const filteredLoans = loans.filter(l => {
    if (filter === 'unpaid') return !l.isPaidThisMonth;
    if (filter === 'paid') return l.isPaidThisMonth;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Top Summary Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 rounded-3xl shadow-lg border border-blue-800/50">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold tracking-wide">Krediler Özeti</h2>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition shadow"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Kredi Ekle
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Aylık Toplam Taksit</span>
            <div className="text-xl font-black text-white">{formatCurrency(totalMonthlyInstallment)}</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Toplam Kalan Ana Borç</span>
            <div className="text-xl font-black text-blue-300">{formatCurrency(totalRemainingDebt)}</div>
          </div>
        </div>
      </div>

      {/* Asgariyle Kapatma Tavsiye Banner */}
      {onOpenAdvisor && (
        <div
          onClick={() => onOpenAdvisor()}
          className="p-3.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/10 dark:from-amber-950/40 dark:via-emerald-950/20 dark:to-blue-950/30 rounded-2xl border border-amber-500/30 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition shadow-sm group active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Kredi Taksitini Kart Asgarisiyle Kapatma Tavsiyeleri
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Hangi kartın asgarisini öderseniz kredi taksiti %100 karşılanır?
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <span>İncele</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
        >
          Tümü ({loans.length})
        </button>
        <button
          onClick={() => setFilter('unpaid')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${filter === 'unpaid' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}
        >
          Bekleyen ({loans.filter(l => !l.isPaidThisMonth).length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${filter === 'paid' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
        >
          Ödendi ({loans.filter(l => l.isPaidThisMonth).length})
        </button>
      </div>

      {/* Loans List */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl text-center border border-dashed border-slate-300 dark:border-slate-700">
          <Landmark className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Kayıtlı banka kredisi bulunamadı.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLoans.map((loan) => {
            const dueInfo = getDueDateLabel(loan.paymentDay, loan.isPaidThisMonth);
            const paidInstallments = loan.totalInstallments - loan.remainingInstallments;
            const progressPercent = loan.totalInstallments > 0 ? Math.round((paidInstallments / loan.totalInstallments) * 100) : 0;
            const remainingBalance = loan.monthlyInstallment * loan.remainingInstallments;

            return (
              <div
                key={loan.id}
                className="bg-white dark:bg-slate-800/95 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3 transition-all hover:shadow-md"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {loan.bankName} - {loan.loanName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Her ayın {loan.paymentDay}. günü
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLoan(loan);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-500 transition cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLoan(loan.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Amounts Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                      Aylık Taksit
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(loan.monthlyInstallment)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                      Kalan Borç Tutarı
                    </span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Taksit: <strong className="text-slate-900 dark:text-white">{paidInstallments} / {loan.totalInstallments} Bitirildi</strong>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Kalan: {loan.remainingInstallments} Taksit
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Footer status & Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-xl border font-bold ${dueInfo.badgeBg}`}>
                      {dueInfo.text}
                    </span>

                    {onOpenAdvisor && !loan.isPaidThisMonth && (
                      <button
                        onClick={() => onOpenAdvisor(loan.id)}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1 transition active:scale-95"
                        title="Bu taksiti kart asgarisiyle kapatma çözümleri"
                      >
                        <Lightbulb className="w-3 h-3" />
                        <span>Asgariyle Kapat</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onTogglePaid(loan.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      loan.isPaidThisMonth
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loan.isPaidThisMonth ? 'Bu Ayki Taksit Ödendi' : 'Taksiti Öde'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
