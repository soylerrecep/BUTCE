import React, { useState } from 'react';
import { CreditCard as CardIcon, Plus, CheckCircle2, Edit3, Trash2, ShieldAlert, Sparkles, Filter, Percent, ArrowRight, Lightbulb, ChevronRight, CalendarClock } from 'lucide-react';
import { CreditCard } from '../types';
import { formatCurrency, getDueDateLabel, getCardColorStyle } from '../utils/formatters';

interface CardsViewProps {
  cards: CreditCard[];
  onTogglePaid: (id: string) => void;
  onOpenAddModal: () => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onOpenPartialPaymentModal: (card: CreditCard) => void;
  onOpenAdvisor?: (targetId?: string) => void;
  onOpenFuturePlans?: (card: CreditCard) => void;
  currentSelectedMonthKey?: string;
}

export const CardsView: React.FC<CardsViewProps> = ({
  cards,
  onTogglePaid,
  onOpenAddModal,
  onEditCard,
  onDeleteCard,
  onOpenPartialPaymentModal,
  onOpenAdvisor,
  onOpenFuturePlans,
  currentSelectedMonthKey
}) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const totalStatement = cards.reduce((sum, c) => sum + (c.statementAmount || 0), 0);
  const totalLimit = cards.reduce((sum, c) => sum + (c.limit || 0), 0);
  const totalMinPayment = cards.reduce((sum, c) => sum + (c.minimumPayment || 0), 0);

  const totalPaidThisMonth = cards.reduce((sum, c) => {
    if (c.isPartialPaidThisMonth && c.paidAmountThisMonth) {
      return sum + c.paidAmountThisMonth;
    }
    if (c.isPaidThisMonth) {
      return sum + (c.statementAmount || 0);
    }
    return sum;
  }, 0);

  const totalRemainingThisMonth = Math.max(0, totalStatement - totalPaidThisMonth);

  // Calculate "En Müsait Kart" based on payability / lowest remaining balance (excluding 0% minimum payment cards and paid cards)
  const eligibleManageableCards = cards
    .map(c => {
      const paidAmt = c.isPartialPaidThisMonth ? (c.paidAmountThisMonth || 0) : (c.isPaidThisMonth ? c.statementAmount : 0);
      const remStatement = Math.max(0, c.statementAmount - paidAmt);
      const remMin = Math.max(0, c.minimumPayment - paidAmt);
      return { card: c, remStatement, remMin };
    })
    .filter(item => {
      if (item.card.isPaidThisMonth && !item.card.isPartialPaidThisMonth) return false;
      if (item.remStatement <= 0) return false;
      if (!item.card.minimumPayment || item.card.minimumPayment <= 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.remStatement !== b.remStatement) return a.remStatement - b.remStatement;
      return a.remMin - b.remMin;
    });

  const mostManageable = eligibleManageableCards.length > 0 ? eligibleManageableCards[0] : null;

  const filteredCards = cards.filter(c => {
    if (filter === 'unpaid') return !c.isPaidThisMonth || c.isPartialPaidThisMonth;
    if (filter === 'paid') return c.isPaidThisMonth && !c.isPartialPaidThisMonth;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Top Cards Header Summary */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 rounded-3xl shadow-lg border border-emerald-800/50">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <CardIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-wide">Kredi Kartları Özeti</h2>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Kart Ekle
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Toplam Ekstre Borcu</span>
            <div className="text-xl font-black text-white">{formatCurrency(totalStatement)}</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Toplam Asgari Tutarlar</span>
            <div className="text-xl font-black text-amber-400">{formatCurrency(totalMinPayment)}</div>
          </div>
        </div>

        {totalLimit > 0 && (
          <div className="mt-3 text-xs text-slate-300 flex justify-between items-center border-t border-slate-800 pt-2">
            <span>Toplam Limit Kullanımı:</span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(totalStatement)} / {formatCurrency(totalLimit)} (%{Math.round((totalStatement / totalLimit) * 100)})
            </span>
          </div>
        )}
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
                Asgari Ödeme ile Kredi & Kart Kapatma Tavsiyeleri
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Bu kartların asgarisini ödeyerek neleri tamamen kapatabilirsiniz?
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <span>İncele</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* En Müsait Kart Bilgisi */}
      {mostManageable && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-800/80 p-3.5 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    En Müsait Kart
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                    Ödeme Kolaylığı
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {mostManageable.card.bankName} - {mostManageable.card.cardName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                  Kalan Kapanış
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block leading-tight">
                  {formatCurrency(mostManageable.remStatement)}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                  Asgari: {formatCurrency(mostManageable.remMin)}
                </span>
              </div>
              <button
                onClick={() => onTogglePaid(mostManageable.card.id)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1 cursor-pointer"
                title="Ödendi İşaretle"
              >
                Öde <ArrowRight className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Tümü ({cards.length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${filter === 'unpaid' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}
          >
            Ödenmedi ({cards.filter(c => !c.isPaidThisMonth).length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${filter === 'paid' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
          >
            Ödendi ({cards.filter(c => c.isPaidThisMonth).length})
          </button>
        </div>
      </div>

      {/* Cards List */}
      {filteredCards.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl text-center border border-dashed border-slate-300 dark:border-slate-700">
          <CardIcon className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Filtreye uygun kayıtlı kredi kartı bulunamadı.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCards.map((card) => {
            const colorClass = getCardColorStyle(card.cardColor);
            const dueInfo = getDueDateLabel(card.dueDay, card.isPaidThisMonth);
            const limitUsagePercent = card.limit > 0 ? Math.min(Math.round((card.statementAmount / card.limit) * 100), 100) : 0;

            return (
              <div
                key={card.id}
                className={`bg-gradient-to-br ${colorClass} p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-200 border border-white/10 hover:shadow-xl`}
              >
                {/* Decorative background shapes */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

                {/* Card Header: Bank Name & Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                      {card.bankName}
                    </h3>
                    <span className="text-xs text-white/70 font-medium">
                      {card.cardName} • •••• {card.last4Digits || '0000'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs px-2.5 py-1 rounded-xl border backdrop-blur-md font-bold ${dueInfo.badgeBg}`}>
                      {dueInfo.text}
                    </span>
                    {onOpenFuturePlans && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFuturePlans(card);
                        }}
                        className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 transition active:scale-95 cursor-pointer relative"
                        title="Gelecek Aylar Taksit & Ekstre Planı"
                      >
                        <CalendarClock className="w-4 h-4" />
                        {card.monthlyPlans && Object.keys(card.monthlyPlans).length > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full ring-1 ring-slate-900" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCard(card);
                      }}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCard(card.id);
                      }}
                      className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition active:scale-95 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Chip & Amounts */}
                <div className="grid grid-cols-2 gap-4 my-3 bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-[11px] text-white/70 uppercase tracking-wider block font-semibold">
                      Ekstre Borcu
                    </span>
                    <span className="text-xl font-black text-white">
                      {formatCurrency(card.statementAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-white/70 uppercase tracking-wider block font-semibold">
                      Asgari Ödeme
                    </span>
                    <span className="text-lg font-extrabold text-amber-300">
                      {formatCurrency(card.minimumPayment)}
                    </span>
                  </div>
                </div>

                {/* Partial Payment Highlight Box */}
                {card.isPartialPaidThisMonth && card.paidAmountThisMonth !== undefined && (
                  <div className="mb-3 bg-amber-500/20 backdrop-blur-md p-2.5 rounded-2xl border border-amber-400/30 flex justify-between items-center text-xs text-white">
                    <div>
                      <span className="text-[10px] text-amber-200 block uppercase font-bold">Bu Ay Ödenen</span>
                      <span className="font-extrabold text-amber-300">{formatCurrency(card.paidAmountThisMonth)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-200 block uppercase font-bold">Gelecek Aya Devreden</span>
                      <span className="font-black text-white">{formatCurrency(Math.max(0, card.statementAmount - card.paidAmountThisMonth))}</span>
                    </div>
                  </div>
                )}

                {/* Dates & Limit Info */}
                <div className="flex justify-between items-center text-xs text-white/80 font-medium mb-3">
                  <div>
                    Son Ödeme Günü: <strong className="text-white">Her ayın {card.dueDay}. günü</strong>
                  </div>
                </div>

                {/* Limit Progress Bar */}
                {card.limit > 0 && (
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] text-white/70">
                      <span>Limit Kullanımı (%{limitUsagePercent})</span>
                      <span>Toplam Limit: {formatCurrency(card.limit)}</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          limitUsagePercent > 80 ? 'bg-rose-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${limitUsagePercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Gelecek Aylar Taksit & Ekstre Planı Butonu */}
                {onOpenFuturePlans && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFuturePlans(card);
                    }}
                    className="w-full mb-3.5 py-2 px-3 rounded-2xl bg-black/25 hover:bg-black/35 text-white text-xs font-bold flex items-center justify-between border border-white/10 transition active:scale-98 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                      <span>Gelecek Aylar Taksit & Ekstre Planı</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-200">
                      <span className="bg-white/10 px-2 py-0.5 rounded-lg">
                        {card.monthlyPlans && Object.keys(card.monthlyPlans).length > 0
                          ? `${Object.keys(card.monthlyPlans).length} Gelecek Ay Planlı`
                          : 'Taksit Gir'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                )}

                {/* Bottom Card Action: Kısmi Öde & Tam Öde */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
                  <span className="text-xs text-white/70 italic truncate">
                    {card.notes ? `"${card.notes}"` : 'Ekstre Ödemesi'}
                  </span>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* Kısmi Öde Button */}
                    <button
                      type="button"
                      onClick={() => onOpenPartialPaymentModal(card)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 backdrop-blur-md active:scale-95 ${
                        card.isPartialPaidThisMonth
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>{card.isPartialPaidThisMonth ? 'Kısmi Ödendi' : 'Kısmi Öde'}</span>
                    </button>

                    {/* Tam Öde Button */}
                    <button
                      type="button"
                      onClick={() => onTogglePaid(card.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 shadow-md active:scale-95 ${
                        card.isPaidThisMonth && !card.isPartialPaidThisMonth
                          ? 'bg-emerald-400 text-slate-950 font-black'
                          : 'bg-white text-slate-900 hover:bg-slate-100 font-bold'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${card.isPaidThisMonth && !card.isPartialPaidThisMonth ? 'text-slate-950' : 'text-slate-500'}`} />
                      <span>{card.isPaidThisMonth && !card.isPartialPaidThisMonth ? 'Tam Ödendi' : 'Tam Öde'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
