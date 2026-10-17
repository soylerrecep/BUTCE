import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, Check, Calendar, Percent, CalendarClock } from 'lucide-react';
import { CreditCard, CardTheme } from '../types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CreditCard, 'id' | 'createdAt'>, id?: string, targetMonthKey?: string) => void;
  initialCard?: CreditCard | null;
  currentSelectedMonthKey?: string;
  onOpenFuturePlans?: (card: CreditCard) => void;
}

const BANK_SUGGESTIONS = [
  'Garanti BBVA',
  'Yapı Kredi',
  'İş Bankası',
  'Akbank',
  'Ziraat Bankası',
  'Halkbank',
  'Vakıfbank',
  'QNB Finansbank',
  'Enpara.com',
  'DenizBank',
  'TEB',
  'Kuveyttürk'
];

const THEME_OPTIONS: { id: CardTheme; name: string; bg: string }[] = [
  { id: 'emerald', name: 'Yeşil', bg: 'bg-emerald-600' },
  { id: 'purple', name: 'Mor', bg: 'bg-purple-600' },
  { id: 'blue', name: 'Mavi', bg: 'bg-blue-600' },
  { id: 'rose', name: 'Pembe/Kırmızı', bg: 'bg-rose-600' },
  { id: 'amber', name: 'Turuncu/Altın', bg: 'bg-amber-600' },
  { id: 'indigo', name: 'Lacivert', bg: 'bg-indigo-700' },
  { id: 'dark', name: 'Siyah', bg: 'bg-slate-900' }
];

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCard,
  currentSelectedMonthKey,
  onOpenFuturePlans
}) => {
  const [targetMonthKey, setTargetMonthKey] = useState<string>(() => {
    return currentSelectedMonthKey || '2026-08';
  });

  const [bankName, setBankName] = useState('');
  const [cardName, setCardName] = useState('');
  const [last4Digits, setLast4Digits] = useState('');
  const [cardColor, setCardColor] = useState<CardTheme>('emerald');
  const [limit, setLimit] = useState<string>('');
  const [dueDay, setDueDay] = useState<number>(25);
  const [dueDateStr, setDueDateStr] = useState<string>('');
  const [statementAmount, setStatementAmount] = useState<string>('');
  const [minimumPayment, setMinimumPayment] = useState<string>('');
  const [minPayPercent, setMinPayPercent] = useState<number | 'custom'>(20);
  const [notes, setNotes] = useState('');

  // Always generate upcoming month options unconditionally (Rules of Hooks)
  const upcomingMonthOptions = React.useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const [startYearStr, startMonthStr] = (currentSelectedMonthKey || '2026-08').split('-');
    let curYear = parseInt(startYearStr, 10) || 2026;
    let curMonth = parseInt(startMonthStr, 10) || 8;

    for (let i = 0; i < 12; i++) {
      const monthKey = `${curYear}-${curMonth.toString().padStart(2, '0')}`;
      list.push({
        key: monthKey,
        label: `${MONTH_NAMES[curMonth - 1]} ${curYear}`
      });

      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }
    return list;
  }, [currentSelectedMonthKey]);

  useEffect(() => {
    if (isOpen) {
      setTargetMonthKey(currentSelectedMonthKey || '2026-08');
    }
  }, [isOpen, currentSelectedMonthKey]);

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');

    if (initialCard) {
      setBankName(initialCard.bankName);
      setCardName(initialCard.cardName);
      setLast4Digits(initialCard.last4Digits);
      setCardColor(initialCard.cardColor);
      setLimit(initialCard.limit.toString());
      setDueDay(initialCard.dueDay);

      const dd = String(initialCard.dueDay).padStart(2, '0');
      setDueDateStr(`${yyyy}-${mm}-${dd}`);

      setStatementAmount(initialCard.statementAmount.toString());
      setMinimumPayment(initialCard.minimumPayment.toString());
      setNotes(initialCard.notes || '');

      // Detect percentage
      const stAmt = initialCard.statementAmount;
      const minPay = initialCard.minimumPayment;
      if (stAmt > 0) {
        const ratio = Math.round((minPay / stAmt) * 100);
        if (ratio === 20 || ratio === 40 || minPay === 0) {
          setMinPayPercent(minPay === 0 ? 0 : ratio);
        } else {
          setMinPayPercent('custom');
        }
      } else {
        setMinPayPercent(20);
      }
    } else {
      setBankName('Garanti BBVA');
      setCardName('Bonus Card');
      setLast4Digits('1234');
      setCardColor('emerald');
      setLimit('50000');
      setDueDay(20);
      setDueDateStr(`${yyyy}-${mm}-20`);
      setStatementAmount('10000');
      setMinimumPayment('2000');
      setMinPayPercent(20);
      setNotes('');
    }
  }, [initialCard, isOpen]);

  if (!isOpen) return null;

  const handleStatementAmountChange = (valStr: string) => {
    setStatementAmount(valStr);
    const val = parseFloat(valStr) || 0;
    if (minPayPercent !== 'custom') {
      if (minPayPercent === 0) {
        setMinimumPayment('0');
      } else {
        setMinimumPayment(Math.round((val * minPayPercent) / 100).toString());
      }
    }
  };

  const handleSelectPercent = (pct: number) => {
    setMinPayPercent(pct);
    const val = parseFloat(statementAmount) || 0;
    if (pct === 0) {
      setMinimumPayment('0');
    } else {
      setMinimumPayment(Math.round((val * pct) / 100).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !cardName) return;

    const parsedStatement = parseFloat(statementAmount) || 0;
    const parsedMin = minimumPayment !== '' ? parseFloat(minimumPayment) : Math.round(parsedStatement * 0.2);

    onSave(
      {
        bankName,
        cardName,
        last4Digits: last4Digits || '0000',
        cardColor,
        limit: parseFloat(limit) || 0,
        statementDay: initialCard?.statementDay || dueDay || 1,
        dueDay: Number(dueDay),
        statementAmount: parsedStatement,
        minimumPayment: parsedMin,
        isPaidThisMonth: initialCard ? initialCard.isPaidThisMonth : false,
        notes,
        monthlyPlans: initialCard?.monthlyPlans
      },
      initialCard?.id,
      targetMonthKey
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <CardIcon className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialCard ? 'Kredi Kartı Düzenle' : 'Yeni Kredi Kartı Ekle'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Month / Period Selection */}
          <div className="bg-amber-500/10 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Hangi Ayın Ekstresi / Taksiti?</span>
              </label>
              {initialCard && onOpenFuturePlans && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFuturePlans(initialCard);
                  }}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Gelecek Ayları Planla</span>
                </button>
              )}
            </div>

            <select
              value={targetMonthKey}
              onChange={(e) => setTargetMonthKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none text-xs"
            >
              {upcomingMonthOptions.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label} {m.key === currentSelectedMonthKey ? '(Aktif Görüntülenen Ay)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium">
              💡 Örneğin <strong>Aralık</strong> seçip taksit girdiğinizde bu tutar Aralık ayının bütçesinde saklanır.
            </p>
          </div>

          {/* Bank selection / input */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Banka Adı</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Örn: Garanti BBVA"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {BANK_SUGGESTIONS.slice(0, 5).map(bank => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => setBankName(bank)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition"
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kart İsmi</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Örn: Bonus Platinum"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Son 4 Hane</label>
              <input
                type="text"
                maxLength={4}
                value={last4Digits}
                onChange={(e) => setLast4Digits(e.target.value)}
                placeholder="4821"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Color theme selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kart Teması</label>
            <div className="flex space-x-2">
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCardColor(opt.id)}
                  className={`w-7 h-7 rounded-full ${opt.bg} flex items-center justify-center transition ${
                    cardColor === opt.id ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {cardColor === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Limit and Ekstre Borcu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kart Limiti (₺)</label>
              <input
                type="number"
                value={limit}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Güncel Ekstre Borcu (₺)</label>
              <input
                type="number"
                required
                value={statementAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleStatementAmountChange(e.target.value)}
                placeholder="15000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Asgari Ödeme Oranı ve Hesabı */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <Percent className="w-3.5 h-3.5 text-emerald-500" />
                <span>Asgari Ödeme Oranı</span>
              </label>
              <div className="flex space-x-1">
                {[20, 40, 0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSelectPercent(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      minPayPercent === pct
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    %{pct}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                type="number"
                value={minimumPayment}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  setMinimumPayment(e.target.value);
                  setMinPayPercent('custom');
                }}
                placeholder="Örn: 2000"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {minPayPercent !== 'custom' && (
                <span className="absolute right-3 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  %{minPayPercent} Otomatik
                </span>
              )}
            </div>
          </div>

          {/* Son Ödeme Tarihi Seçimi */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Son Ödeme Tarihi (Takvimden Seçin)</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                Her ayın {dueDay}. günü
              </span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3.5 text-emerald-500 pointer-events-none" />
              <input
                type="date"
                required
                value={dueDateStr}
                onChange={(e) => {
                  const val = e.target.value;
                  setDueDateStr(val);
                  if (val) {
                    const parts = val.split('-');
                    if (parts.length === 3) {
                      const dayNum = parseInt(parts[2], 10);
                      if (!isNaN(dayNum)) {
                        setDueDay(dayNum);
                      }
                    }
                  }
                }}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Not (Opsiyonel)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Otomatik ödeme talimatı var"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg transition active:scale-95"
            >
              {initialCard ? 'Kaydet' : 'Kartı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
