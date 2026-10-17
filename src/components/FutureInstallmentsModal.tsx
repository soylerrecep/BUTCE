import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CalendarPlus, 
  CalendarClock,
  Check, 
  Trash2, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  CreditCard as CardIcon,
  Clock,
  ExternalLink
} from 'lucide-react';
import { CreditCard, CardMonthlyPlan } from '../types';
import { formatCurrency, getMonthNameAndYear } from '../utils/formatters';

interface FutureInstallmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
  currentSelectedMonthKey: string;
  onSavePlans: (cardId: string, plans: Record<string, CardMonthlyPlan>) => void;
  onNavigateToMonth?: (monthKey: string) => void;
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const FutureInstallmentsModal: React.FC<FutureInstallmentsModalProps> = ({
  isOpen,
  onClose,
  card,
  currentSelectedMonthKey,
  onSavePlans,
  onNavigateToMonth
}) => {
  if (!isOpen || !card) return null;

  const [activeTab, setActiveTab] = useState<'months' | 'distributor'>('months');

  // Local state for plans: monthKey -> { statementAmount, minimumPayment, note }
  const [plans, setPlans] = useState<Record<string, CardMonthlyPlan>>(() => {
    return card.monthlyPlans ? { ...card.monthlyPlans } : {};
  });

  // Generator form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [totalOrMonthlyMode, setTotalOrMonthlyMode] = useState<'total' | 'monthly'>('monthly');
  const [amountInput, setAmountInput] = useState('');
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [startMonth, setStartMonth] = useState<string>(() => {
    // Default to next month or current
    return currentSelectedMonthKey || '2026-08';
  });
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Generate list of 12 upcoming months from base/selected
  const upcomingMonths = React.useMemo(() => {
    const list: { key: string; label: string; year: number; monthNum: number }[] = [];
    const [startYearStr, startMonthStr] = (currentSelectedMonthKey || '2026-08').split('-');
    let curYear = parseInt(startYearStr, 10) || 2026;
    let curMonth = parseInt(startMonthStr, 10) || 8;

    for (let i = 0; i < 12; i++) {
      const monthKey = `${curYear}-${curMonth.toString().padStart(2, '0')}`;
      list.push({
        key: monthKey,
        label: `${MONTH_NAMES[curMonth - 1]} ${curYear}`,
        year: curYear,
        monthNum: curMonth
      });

      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }
    return list;
  }, [currentSelectedMonthKey]);

  // Handle direct row edits
  const handleAmountChange = (mKey: string, valStr: string) => {
    const val = parseFloat(valStr);
    setPlans(prev => {
      const existing = prev[mKey] || { statementAmount: 0 };
      if (isNaN(val) || val <= 0) {
        const next = { ...prev };
        delete next[mKey];
        return next;
      }
      return {
        ...prev,
        [mKey]: {
          ...existing,
          statementAmount: val,
          minimumPayment: Math.round(val * 0.2)
        }
      };
    });
  };

  const handleNoteChange = (mKey: string, noteStr: string) => {
    setPlans(prev => {
      const existing = prev[mKey] || { statementAmount: 0 };
      return {
        ...prev,
        [mKey]: {
          ...existing,
          note: noteStr
        }
      };
    });
  };

  const handleRemoveMonthPlan = (mKey: string) => {
    setPlans(prev => {
      const next = { ...prev };
      delete next[mKey];
      return next;
    });
  };

  // Handle Distribute Installments
  const handleApplyDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountInput);
    if (!parsedAmount || parsedAmount <= 0) return;

    let monthlyVal = parsedAmount;
    if (totalOrMonthlyMode === 'total') {
      monthlyVal = Math.round(parsedAmount / installmentCount);
    }

    const [startYearStr, startMonthStr] = startMonth.split('-');
    let y = parseInt(startYearStr, 10);
    let m = parseInt(startMonthStr, 10);

    const updated = { ...plans };

    for (let i = 0; i < installmentCount; i++) {
      const mKey = `${y}-${m.toString().padStart(2, '0')}`;
      const existing = updated[mKey];
      const existingAmt = existing?.statementAmount || 0;
      const combinedAmt = existingAmt + monthlyVal;

      const noteSuffix = installmentCount > 1 ? ` (${i + 1}/${installmentCount} Taksit)` : '';
      const combinedNote = existing?.note 
        ? `${existing.note} + ${expenseTitle || 'Taksit'}${noteSuffix}`
        : `${expenseTitle || 'Taksit'}${noteSuffix}`;

      updated[mKey] = {
        statementAmount: combinedAmt,
        minimumPayment: Math.round(combinedAmt * 0.2),
        note: combinedNote
      };

      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    setPlans(updated);
    setSaveSuccessNotice(`${installmentCount} aylık taksit başarıyla listeye eklendi!`);
    setTimeout(() => {
      setSaveSuccessNotice(null);
      setActiveTab('months');
    }, 1200);
  };

  const handleSaveAll = () => {
    onSavePlans(card.id, plans);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Gelecek Aylar Taksit & Ekstre Planı
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  {Object.keys(plans).length} Ay Kayıtlı
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {card.bankName} - {card.cardName} (•••• {card.last4Digits || '0000'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 p-1.5 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('months')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'months'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Aylık Taksit Listesi</span>
          </button>

          <button
            onClick={() => setActiveTab('distributor')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'distributor'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Taksit Bölücü & Ekle</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {activeTab === 'months' ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                💡 <strong>Nasıl Çalışır?</strong> Örneğin <strong>Aralık 2026</strong> veya gelecek aylara taksit girdiğinizde, tutar o ayın hafızasında kalır. Aralık ayı geldiğinde veya o ayı seçtiğinizde bu taksit tutarı otomatik karşınıza çıkar.
              </div>

              <div className="space-y-2.5">
                {upcomingMonths.map((m) => {
                  const plan = plans[m.key];
                  const hasCustomPlan = !!plan && plan.statementAmount > 0;
                  const isCurrent = m.key === currentSelectedMonthKey;

                  return (
                    <div
                      key={m.key}
                      className={`p-3 rounded-2xl border transition-all ${
                        hasCustomPlan
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                          : isCurrent
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {m.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400">
                              Şu Anki Ay
                            </span>
                          )}
                          {hasCustomPlan && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5">
                              <Check className="w-3 h-3 stroke-[3]" /> Planlandı
                            </span>
                          )}
                        </div>

                        {onNavigateToMonth && (
                          <button
                            type="button"
                            onClick={() => {
                              handleSaveAll();
                              onNavigateToMonth(m.key);
                            }}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                            title="Bu ayı seç ve görüntüle"
                          >
                            <span>Bu Aya Git</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                            Taksit / Ekstre Tutarı (₺)
                          </label>
                          <input
                            type="number"
                            placeholder="Örn: 3500"
                            value={plan?.statementAmount !== undefined ? plan.statementAmount : ''}
                            onChange={(e) => handleAmountChange(m.key, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                            Açıklama / Taksit Notu
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="Örn: Telefon Taksiti 3/6"
                              value={plan?.note || ''}
                              onChange={(e) => handleNoteChange(m.key, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            {hasCustomPlan && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMonthPlan(m.key)}
                                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                                title="Bu ayın planını sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {hasCustomPlan && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            Tahmini Asgari (%20): <strong className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(plan.minimumPayment || Math.round(plan.statementAmount * 0.2))}</strong>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatCurrency(plan.statementAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Installment Splitter Tab */
            <form onSubmit={handleApplyDistribution} className="space-y-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300">
                ✨ <strong>Otomatik Taksit Bölücü:</strong> Yeni yaptığınız taksitli bir harcamayı (örn. 6 taksit) tek seferde belirlediğiniz başlangıç ayından itibaren otomatik olarak gelecek aylara dağıtabilirsiniz.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Harcama / Taksit Başlığı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Telefon Taksiti, Beyaz Eşya, Sigorta"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giriş Türü
                  </label>
                  <select
                    value={totalOrMonthlyMode}
                    onChange={(e) => setTotalOrMonthlyMode(e.target.value as 'total' | 'monthly')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none"
                  >
                    <option value="monthly">Aylık Taksit Tutarı</option>
                    <option value="total">Toplam Alışveriş Tutarı</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {totalOrMonthlyMode === 'total' ? 'Toplam Tutar (₺)' : 'Aylık Taksit (₺)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Örn: 3500"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Taksit Sayısı
                  </label>
                  <select
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none"
                  >
                    {[2, 3, 4, 5, 6, 8, 9, 10, 12, 18, 24].map((n) => (
                      <option key={n} value={n}>{n} Taksit ({n} Ay)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    İlk Taksit / Başlangıç Ayı
                  </label>
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium outline-none"
                  >
                    {upcomingMonths.map((m) => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview calculation */}
              {amountInput && parseFloat(amountInput) > 0 && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Aylık Taksit:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalOrMonthlyMode === 'total' ? Math.round(parseFloat(amountInput) / installmentCount) : parseFloat(amountInput))}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                    <span>Toplam Ödeme:</span>
                    <span>
                      {formatCurrency(totalOrMonthlyMode === 'total' ? parseFloat(amountInput) : parseFloat(amountInput) * installmentCount)} ({installmentCount} Ay Boyunca)
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Taksitleri Gelecek Aylara Dağıt & Ekle</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Tüm Planları Kaydet ({Object.keys(plans).length} Ay)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
