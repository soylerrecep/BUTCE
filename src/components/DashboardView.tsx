import React, { useState } from 'react';
import { 
  CreditCard as CardIcon, 
  Landmark, 
  ReceiptText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  TrendingDown, 
  Calendar,
  Wallet,
  ArrowRight,
  PieChart as PieIcon,
  ChevronDown,
  CalendarClock
} from 'lucide-react';
import { CreditCard, Loan, Debt, TabType } from '../types';
import { formatCurrency, getDueDateLabel, getDaysRemaining, getMonthNameAndYear } from '../utils/formatters';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PaymentAdvisorWidget } from './PaymentAdvisorWidget';

interface DashboardViewProps {
  cards: CreditCard[];
  loans: Loan[];
  debts: Debt[];
  onNavigateTab: (tab: TabType) => void;
  onToggleCardPaid: (id: string) => void;
  onToggleLoanPaid: (id: string) => void;
  onToggleDebtPaid: (id: string) => void;
  onOpenAddModal: (type?: 'card' | 'loan' | 'debt') => void;
  monthlyIncome?: number;
  onOpenIncomeModal: () => void;
  onOpenAdvisor?: () => void;
  selectedMonthKey?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cards,
  loans,
  debts,
  onNavigateTab,
  onToggleCardPaid,
  onToggleLoanPaid,
  onToggleDebtPaid,
  onOpenAddModal,
  monthlyIncome,
  onOpenIncomeModal,
  onOpenAdvisor,
  selectedMonthKey
}) => {
  // Collapsible state for Minimum Payment Scenario widget
  const [isMinScenarioExpanded, setIsMinScenarioExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dash_min_scenario_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleMinScenario = () => {
    setIsMinScenarioExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dash_min_scenario_expanded', String(next));
      } catch {}
      return next;
    });
  };

  // Collapsible state for Debt Distribution Chart
  const [isChartExpanded, setIsChartExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dash_chart_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleChart = () => {
    setIsChartExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dash_chart_expanded', String(next));
      } catch {}
      return next;
    });
  };

  // Calculations
  const totalCardsAmount = cards.reduce((sum, c) => sum + (c.statementAmount || 0), 0);
  const totalCardsMinimum = cards.reduce((sum, c) => sum + (c.minimumPayment || 0), 0);

  const paidCardsAmount = cards.reduce((sum, c) => {
    if (c.isPartialPaidThisMonth && c.paidAmountThisMonth) {
      return sum + c.paidAmountThisMonth;
    }
    if (c.isPaidThisMonth) {
      return sum + (c.statementAmount || 0);
    }
    return sum;
  }, 0);

  const totalLoansAmount = loans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
  const paidLoansAmount = loans.filter(l => l.isPaidThisMonth).reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);

  const totalDebtsAmount = debts.reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);
  const paidDebtsAmount = debts.filter(d => d.isPaidThisMonth).reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);

  const grandTotalMonthly = totalCardsAmount + totalLoansAmount + totalDebtsAmount;
  const grandTotalMinimumMonthly = totalCardsMinimum + totalLoansAmount + totalDebtsAmount;
  const minimumSavings = totalCardsAmount - totalCardsMinimum;

  const grandTotalPaid = paidCardsAmount + paidLoansAmount + paidDebtsAmount;
  const grandTotalRemaining = grandTotalMonthly - grandTotalPaid;

  const paidPercentage = grandTotalMonthly > 0 ? Math.round((grandTotalPaid / grandTotalMonthly) * 100) : 0;

  // Pie chart data
  const chartData = [
    { name: 'Kart Ekstreleri', value: totalCardsAmount, color: '#10b981' },
    { name: 'Krediler', value: totalLoansAmount, color: '#3b82f6' },
    { name: 'Diğer Borçlar', value: totalDebtsAmount, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Combine all items into a unified list sorted by due date (excluding partially paid cards per user request)
  const allItems = [
    ...cards
      .filter(c => !c.isPartialPaidThisMonth)
      .map(c => {
        return {
          id: c.id,
          type: 'card' as const,
          title: `${c.bankName} - ${c.cardName}`,
          amount: c.statementAmount,
          subDetail: `Asgari: ${formatCurrency(c.minimumPayment)}`,
          dueDay: c.dueDay,
          isPaid: c.isPaidThisMonth && !c.isPartialPaidThisMonth,
          isPartial: c.isPartialPaidThisMonth,
          icon: CardIcon,
          color: 'text-emerald-500 bg-emerald-500/10'
        };
      }),
    ...loans.map(l => ({
      id: l.id,
      type: 'loan' as const,
      title: `${l.bankName} (${l.loanName})`,
      amount: l.monthlyInstallment,
      subDetail: `Kalan: ${l.remainingInstallments}/${l.totalInstallments} taksit`,
      dueDay: l.paymentDay,
      isPaid: l.isPaidThisMonth,
      icon: Landmark,
      color: 'text-blue-500 bg-blue-500/10'
    })),
    ...debts.map(d => ({
      id: d.id,
      type: 'debt' as const,
      title: d.title,
      amount: d.monthlyAmount,
      subDetail: d.creditor ? `Alacaklı: ${d.creditor}` : 'Borç Ödemesi',
      dueDay: d.dueDay,
      isPaid: d.isPaidThisMonth,
      icon: ReceiptText,
      color: 'text-amber-500 bg-amber-500/10'
    }))
  ].sort((a, b) => {
    // Overdue or unpaid items first, then by dueDay
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return a.dueDay - b.dueDay;
  });

  const unpaidItems = allItems.filter(item => !item.isPaid);
  const overdueItems = unpaidItems.filter(item => getDaysRemaining(item.dueDay).status === 'overdue');

  const handleToggle = (id: string, type: 'card' | 'loan' | 'debt') => {
    if (type === 'card') onToggleCardPaid(id);
    if (type === 'loan') onToggleLoanPaid(id);
    if (type === 'debt') onToggleDebtPaid(id);
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Gelecek Ay Planlaması Bannerı */}
      {selectedMonthKey && selectedMonthKey !== '2026-08' && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/15 rounded-3xl border border-amber-500/30 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block">
                {getMonthNameAndYear(selectedMonthKey)} Dönemi Görüntüleniyor
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Bu ay için planlanmış kart taksitleri ve ödemeler listelenmektedir.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('cards')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-[11px] whitespace-nowrap transition cursor-pointer"
          >
            Taksitleri Gör
          </button>
        </div>
      )}

      {/* Overview Main Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 rounded-3xl shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Bu Ayki Toplam Ödeme Yükümlülüğü
            </span>
            <div className="text-3xl font-black tracking-tight text-white mt-1">
              {formatCurrency(grandTotalMonthly)}
            </div>
          </div>
          <button
            onClick={onOpenIncomeModal}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 transition"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>{monthlyIncome ? `Gelir: ${formatCurrency(monthlyIncome)}` : '+ Gelir Ekle'}</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ödenen: {formatCurrency(grandTotalPaid)} (%{paidPercentage})
            </span>
            <span className="text-rose-400 font-semibold">
              Kalan: {formatCurrency(grandTotalRemaining)}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(paidPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Income stats if present */}
        {monthlyIncome && monthlyIncome > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Tam Ödemelerde Kalan Net Gelir:</span>
            <span className={`font-bold text-sm ${monthlyIncome - grandTotalMonthly >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(monthlyIncome - grandTotalMonthly)}
            </span>
          </div>
        )}
      </div>

      {/* Kart Asgari Ödeme Senaryosu (Minimum Payment Scenario) - Açılır / Kapanır */}
      {cards.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-800/80 dark:to-slate-800/60 p-4 rounded-3xl border border-amber-500/30 shadow-sm relative overflow-hidden transition-all duration-200">
          <div
            onClick={toggleMinScenario}
            className="flex items-center justify-between cursor-pointer select-none group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleMinScenario(); }}
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <CardIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Kart Asgari Ödeme Senaryosu
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isMinScenarioExpanded 
                    ? 'Kartların tam ekstresi yerine sadece asgarileri ödenirse' 
                    : `Asgari ödemelerle +${formatCurrency(minimumSavings)} cepte kalır (Genişletmek için dokunun)`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                +{formatCurrency(minimumSavings)} Nakit Kalır
              </span>
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMinScenarioExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>

          {isMinScenarioExpanded && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-amber-500/20 text-xs">
              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-amber-500/20">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                  Asgari Ödemeli Yükümlülük
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                  {formatCurrency(grandTotalMinimumMonthly)}
                </span>
                <span className="text-[10px] text-slate-400 line-through block">
                  Tam Ödeme: {formatCurrency(grandTotalMonthly)}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-amber-500/20">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                  {monthlyIncome && monthlyIncome > 0 ? 'Asgari Sonrası Net Gelir' : 'Kart Asgari Ödeme Toplamı'}
                </span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {monthlyIncome && monthlyIncome > 0
                    ? formatCurrency(monthlyIncome - grandTotalMinimumMonthly)
                    : formatCurrency(totalCardsMinimum)}
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-medium block">
                  {monthlyIncome && monthlyIncome > 0
                    ? `Tam ödemeye göre ${formatCurrency(minimumSavings)} daha fazla`
                    : `Ekstre toplamı ${formatCurrency(totalCardsAmount)}`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Akıllı Asgari & Taksit Tavsiyesi (Smart Advisor Widget) */}
      <PaymentAdvisorWidget
        cards={cards}
        loans={loans}
        debts={debts}
        onOpenAdvisor={onOpenAdvisor || (() => {})}
      />

      {/* 3 Main Category Summaries */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onNavigateTab('cards')}
          className="bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm text-left hover:border-emerald-500 transition active:scale-95"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <CardIcon className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md text-emerald-700 dark:text-emerald-300">
              {cards.length} Adet
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Kart Ekstreleri</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalCardsAmount)}
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('loans')}
          className="bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm text-left hover:border-blue-500 transition active:scale-95"
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
            <Landmark className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-md text-blue-700 dark:text-blue-300">
              {loans.length} Adet
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Kredi Taksitleri</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalLoansAmount)}
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('debts')}
          className="bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm text-left hover:border-amber-500 transition active:scale-95"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <ReceiptText className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-md text-amber-700 dark:text-amber-300">
              {debts.length} Adet
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Diğer Borçlar</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalDebtsAmount)}
          </div>
        </button>
      </div>

      {/* Quick Add Action Ribbon */}
      <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-2xl flex items-center justify-around text-xs font-semibold">
        <button
          onClick={() => onOpenAddModal('card')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition"
        >
          <Plus className="w-4 h-4" /> Kart Ekle
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button
          onClick={() => onOpenAddModal('loan')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition"
        >
          <Plus className="w-4 h-4" /> Kredi Ekle
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button
          onClick={() => onOpenAddModal('debt')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition"
        >
          <Plus className="w-4 h-4" /> Borç Ekle
        </button>
      </div>

      {/* Payment Breakdown Pie Chart if items exist - Açılır / Kapanır */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800/90 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/70 shadow-sm transition-all duration-200">
          <div
            onClick={toggleChart}
            className="flex justify-between items-center cursor-pointer select-none group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleChart(); }}
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <PieIcon className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Borç Dağılım Grafiği
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isChartExpanded
                    ? 'Aylık toplam borcun kategorilere göre oranı'
                    : 'Grafik ve kategori oranlarını görmek için dokunun'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-lg">
                Aylık Oranlar
              </span>
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isChartExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>

          {isChartExpanded && (
            <div className="h-44 w-full flex items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Tutar']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="w-1/2 space-y-2 text-xs">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      %{Math.round((item.value / grandTotalMonthly) * 100)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Payments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Yaklaşan & Bekleyen Ödemeler
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {unpaidItems.length} Bekleyen
          </span>
        </div>

        {allItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl text-center border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
              Henüz kayıtlı bir ekstre, kredi veya borç yok.
            </p>
            <button
              onClick={() => onOpenAddModal('card')}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow hover:bg-emerald-400"
            >
              + İlk Ödemeni Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {allItems.map((item) => {
              const Icon = item.icon;
              const dueInfo = getDueDateLabel(item.dueDay, item.isPaid);

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    item.isPaid
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className={`text-sm font-bold ${item.isPaid ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {item.subDetail}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dueInfo.badgeBg}`}>
                          {dueInfo.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>

                    <button
                      onClick={() => handleToggle(item.id, item.type)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        item.isPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {item.isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Ödendi</span>
                        </>
                      ) : (
                        <span>Öde</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
