import React, { useState } from 'react';
import { ReceiptText, Plus, CheckCircle2, Edit3, Trash2, User, Home, Zap, Tag, CalendarClock } from 'lucide-react';
import { Debt, DebtCategory } from '../types';
import { formatCurrency, getDueDateLabel } from '../utils/formatters';

interface DebtsViewProps {
  debts: Debt[];
  onTogglePaid: (id: string) => void;
  onOpenAddModal: () => void;
  onEditDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  onTogglePaid,
  onOpenAddModal,
  onEditDebt,
  onDeleteDebt
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const totalMonthlyDebts = debts.reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);
  const totalPaidDebts = debts.filter(d => d.isPaidThisMonth).reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);

  const getCategoryIcon = (cat: DebtCategory) => {
    switch (cat) {
      case 'rent':
        return <Home className="w-4 h-4 text-emerald-500" />;
      case 'bill':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'personal':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'other':
      default:
        return <Tag className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryLabel = (cat: DebtCategory) => {
    switch (cat) {
      case 'rent': return 'Kira';
      case 'bill': return 'Fatura';
      case 'personal': return 'Şahıs / Kişisel';
      case 'other': default: return 'Diğer Borç';
    }
  };

  const filteredDebts = debts.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (statusFilter === 'unpaid' && d.isPaidThisMonth) return false;
    if (statusFilter === 'paid' && !d.isPaidThisMonth) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white p-4 rounded-3xl shadow-lg border border-amber-800/50">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold tracking-wide">Borçlar & Faturalar Özeti</h2>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition shadow"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Borç Ekle
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Aylık Ödeme Tutarı</span>
            <div className="text-xl font-black text-white">{formatCurrency(totalMonthlyDebts)}</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Ödenen Miktar</span>
            <div className="text-xl font-black text-emerald-400">{formatCurrency(totalPaidDebts)}</div>
          </div>
        </div>
      </div>

      {/* Category & Status Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              categoryFilter === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Tüm Kategoriler
          </button>
          <button
            onClick={() => setCategoryFilter('bill')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              categoryFilter === 'bill'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Faturalar
          </button>
          <button
            onClick={() => setCategoryFilter('rent')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              categoryFilter === 'rent'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Kira
          </button>
          <button
            onClick={() => setCategoryFilter('personal')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              categoryFilter === 'personal'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Kişisel
          </button>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs w-fit">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition ${statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Tümü ({debts.length})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1 rounded-lg font-bold transition ${statusFilter === 'unpaid' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}
          >
            Bekleyen
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 rounded-lg font-bold transition ${statusFilter === 'paid' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
          >
            Ödendi
          </button>
        </div>
      </div>

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl text-center border border-dashed border-slate-300 dark:border-slate-700">
          <ReceiptText className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Seçilen kritere uygun borç veya fatura bulunamadı.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((debt) => {
            const dueInfo = getDueDateLabel(debt.dueDay, debt.isPaidThisMonth);

            return (
              <div
                key={debt.id}
                className="bg-white dark:bg-slate-800/95 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-2xl">
                      {getCategoryIcon(debt.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {debt.title}
                        </h3>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 font-medium">
                          {getCategoryLabel(debt.category)}
                        </span>
                        {debt.isInstallment && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1">
                            <CalendarClock className="w-3 h-3 text-amber-500" />
                            <span>
                              {debt.totalInstallments && debt.remainingInstallments
                                ? `${debt.totalInstallments - debt.remainingInstallments + 1} / ${debt.totalInstallments} Taksit`
                                : 'Taksitli'}
                            </span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {debt.creditor ? `Alacaklı/Kurum: ${debt.creditor}` : 'Borç Ödemesi'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDebt(debt);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDebt(debt.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount details */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                      {debt.isInstallment ? 'Bu Ayki Taksit' : 'Bu Ayki Ödeme'}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(debt.monthlyAmount)}
                    </span>
                  </div>

                  {debt.isInstallment && debt.remainingInstallments !== undefined ? (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                        Kalan Taksit / Borç
                      </span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        {debt.remainingInstallments} Taksit ({formatCurrency(debt.totalAmount)})
                      </span>
                    </div>
                  ) : (
                    debt.totalAmount > debt.monthlyAmount && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                          Toplam Borç
                        </span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          {formatCurrency(debt.totalAmount)}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Footer status & button */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs px-2.5 py-1 rounded-xl border font-bold ${dueInfo.badgeBg}`}>
                    {dueInfo.text}
                  </span>

                  <button
                    onClick={() => onTogglePaid(debt.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      debt.isPaidThisMonth
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-amber-600 text-slate-950 font-bold hover:bg-amber-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{debt.isPaidThisMonth ? 'Ödendi' : 'Ödendi İşaretle'}</span>
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
