import React, { useState, useEffect } from 'react';
import { X, ReceiptText, CalendarClock } from 'lucide-react';
import { Debt, DebtCategory } from '../types';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Omit<Debt, 'id' | 'createdAt'>, id?: string) => void;
  initialDebt?: Debt | null;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDebt
}) => {
  const [title, setTitle] = useState('');
  const [creditor, setCreditor] = useState('');
  const [category, setCategory] = useState<DebtCategory>('bill');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDayStr, setDueDayStr] = useState<string>('15');
  const [notes, setNotes] = useState('');

  // Taksit Durumu
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallmentsStr, setTotalInstallmentsStr] = useState('6');
  const [remainingInstallmentsStr, setRemainingInstallmentsStr] = useState('6');

  useEffect(() => {
    if (initialDebt) {
      setTitle(initialDebt.title);
      setCreditor(initialDebt.creditor || '');
      setCategory(initialDebt.category);
      setMonthlyAmount(initialDebt.monthlyAmount ? initialDebt.monthlyAmount.toString() : '');
      setTotalAmount(initialDebt.totalAmount ? initialDebt.totalAmount.toString() : '');
      setDueDayStr(initialDebt.dueDay ? initialDebt.dueDay.toString() : '15');
      setNotes(initialDebt.notes || '');

      setIsInstallment(!!initialDebt.isInstallment);
      setTotalInstallmentsStr(initialDebt.totalInstallments ? initialDebt.totalInstallments.toString() : '6');
      setRemainingInstallmentsStr(initialDebt.remainingInstallments ? initialDebt.remainingInstallments.toString() : '6');
    } else {
      setTitle('');
      setCreditor('');
      setCategory('bill');
      setMonthlyAmount('');
      setTotalAmount('');
      setDueDayStr('15');
      setNotes('');
      setIsInstallment(false);
      setTotalInstallmentsStr('6');
      setRemainingInstallmentsStr('6');
    }
  }, [initialDebt, isOpen]);

  if (!isOpen) return null;

  const handleTotalAmountChange = (val: string) => {
    setTotalAmount(val);
    if (isInstallment && val) {
      const tot = parseFloat(val);
      const inst = parseInt(totalInstallmentsStr, 10);
      if (tot > 0 && inst > 0) {
        setMonthlyAmount(Math.round(tot / inst).toString());
      }
    }
  };

  const handleTotalInstallmentsChange = (val: string) => {
    setTotalInstallmentsStr(val);
    const inst = parseInt(val, 10);
    if (isInstallment && inst > 0) {
      if (totalAmount) {
        const tot = parseFloat(totalAmount);
        setMonthlyAmount(Math.round(tot / inst).toString());
      } else if (monthlyAmount) {
        const m = parseFloat(monthlyAmount);
        setTotalAmount(Math.round(m * inst).toString());
      }
    }
  };

  const handleMonthlyAmountChange = (val: string) => {
    setMonthlyAmount(val);
    if (isInstallment && val) {
      const m = parseFloat(val);
      const inst = parseInt(totalInstallmentsStr, 10);
      if (m > 0 && inst > 0 && !totalAmount) {
        setTotalAmount(Math.round(m * inst).toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !monthlyAmount) return;

    const monthlyVal = parseFloat(monthlyAmount) || 0;
    const totalVal = totalAmount ? parseFloat(totalAmount) : (isInstallment ? monthlyVal * (parseInt(totalInstallmentsStr, 10) || 1) : monthlyVal);
    const dueDayNum = parseInt(dueDayStr, 10) || 15;
    const totalInstNum = parseInt(totalInstallmentsStr, 10) || 1;
    const remInstNum = parseInt(remainingInstallmentsStr, 10) || totalInstNum;

    onSave(
      {
        title,
        creditor,
        category,
        monthlyAmount: monthlyVal,
        totalAmount: totalVal,
        dueDate: `2026-08-${dueDayNum.toString().padStart(2, '0')}`,
        dueDay: Math.min(31, Math.max(1, dueDayNum)),
        isPaidThisMonth: initialDebt ? initialDebt.isPaidThisMonth : false,
        notes,
        isInstallment,
        totalInstallments: isInstallment ? totalInstNum : undefined,
        remainingInstallments: isInstallment ? remInstNum : undefined
      },
      initialDebt?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <ReceiptText className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialDebt ? 'Borç / Fatura Düzenle' : 'Yeni Borç veya Fatura Ekle'}
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
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Borç / Fatura Başlığı</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Elektrik Faturası, Ev Kirası, Ahmet Borç"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DebtCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="bill">Fatura (Elektrik/Su/İnternet)</option>
                <option value="rent">Ev Kirası</option>
                <option value="personal">Şahıs / Kişisel Borç</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alacaklı / Kurum</label>
              <input
                type="text"
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                placeholder="Örn: Enerjisa, Ev Sahibi"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Taksit Seçeneği Toggle */}
          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarClock className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Taksitli Ödeme</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Bu borç taksitler halinde mi ödeniyor?</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isInstallment}
                onChange={(e) => setIsInstallment(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {isInstallment && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Toplam Taksit Sayısı</label>
                  <input
                    type="number"
                    min={1}
                    required={isInstallment}
                    value={totalInstallmentsStr}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleTotalInstallmentsChange(e.target.value)}
                    placeholder="6"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kalan Taksit Sayısı</label>
                  <input
                    type="number"
                    min={1}
                    required={isInstallment}
                    value={remainingInstallmentsStr}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setRemainingInstallmentsStr(e.target.value)}
                    placeholder="6"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isInstallment ? 'Aylık Taksit Tutarı (₺)' : 'Bu Ayki Ödeme (₺)'}
              </label>
              <input
                type="number"
                required
                value={monthlyAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleMonthlyAmountChange(e.target.value)}
                placeholder="2450"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isInstallment ? 'Toplam Borç Tutarı (₺)' : 'Toplam Kalan Borç (₺)'}
              </label>
              <input
                type="number"
                value={totalAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                placeholder="Opsiyonel"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Son Ödeme Günü (Ayın kaçı?)</label>
            <input
              type="number"
              min={1}
              max={31}
              required
              value={dueDayStr}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setDueDayStr(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Not (Opsiyonel)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Otomatik ödeme talimatı yok"
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
              className="w-2/3 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg transition"
            >
              {initialDebt ? 'Kaydet' : 'Borcu Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
