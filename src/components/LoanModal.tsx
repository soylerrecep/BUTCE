import React, { useState, useEffect } from 'react';
import { X, Landmark } from 'lucide-react';
import { Loan } from '../types';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Omit<Loan, 'id' | 'createdAt'>, id?: string) => void;
  initialLoan?: Loan | null;
}

const BANK_SUGGESTIONS = [
  'Akbank',
  'Ziraat Bankası',
  'Garanti BBVA',
  'Yapı Kredi',
  'İş Bankası',
  'Halkbank',
  'Vakıfbank',
  'QNB Finansbank',
  'DenizBank'
];

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLoan
}) => {
  const [bankName, setBankName] = useState('');
  const [loanName, setLoanName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [totalInstallmentsStr, setTotalInstallmentsStr] = useState('24');
  const [remainingInstallmentsStr, setRemainingInstallmentsStr] = useState('18');
  const [paymentDayStr, setPaymentDayStr] = useState('15');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialLoan) {
      setBankName(initialLoan.bankName);
      setLoanName(initialLoan.loanName);
      setTotalAmount(initialLoan.totalAmount.toString());
      setMonthlyInstallment(initialLoan.monthlyInstallment.toString());
      setTotalInstallmentsStr(initialLoan.totalInstallments.toString());
      setRemainingInstallmentsStr(initialLoan.remainingInstallments.toString());
      setPaymentDayStr(initialLoan.paymentDay.toString());
      setNotes(initialLoan.notes || '');
    } else {
      setBankName('Akbank');
      setLoanName('İhtiyaç Kredisi');
      setTotalAmount('100000');
      setMonthlyInstallment('5500');
      setTotalInstallmentsStr('24');
      setRemainingInstallmentsStr('18');
      setPaymentDayStr('15');
      setNotes('');
    }
  }, [initialLoan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !loanName || !monthlyInstallment) return;

    onSave(
      {
        bankName,
        loanName,
        totalAmount: parseFloat(totalAmount) || 0,
        monthlyInstallment: parseFloat(monthlyInstallment) || 0,
        totalInstallments: parseInt(totalInstallmentsStr, 10) || 1,
        remainingInstallments: parseInt(remainingInstallmentsStr, 10) || 1,
        paymentDay: parseInt(paymentDayStr, 10) || 1,
        isPaidThisMonth: initialLoan ? initialLoan.isPaidThisMonth : false,
        notes
      },
      initialLoan?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialLoan ? 'Kredi Düzenle' : 'Yeni Banka Kredisi Ekle'}
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
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Banka Adı</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Örn: Akbank"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {BANK_SUGGESTIONS.slice(0, 5).map(bank => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => setBankName(bank)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-950"
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kredi Türü / İsmi</label>
            <input
              type="text"
              required
              value={loanName}
              onChange={(e) => setLoanName(e.target.value)}
              placeholder="Örn: İhtiyaç Kredisi, Konut Kredisi"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aylık Taksit (₺)</label>
              <input
                type="number"
                required
                value={monthlyInstallment}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setMonthlyInstallment(e.target.value)}
                placeholder="7850"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Toplam Kredi Tutarı (₺)</label>
              <input
                type="number"
                value={totalAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="150000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kalan Taksit</label>
              <input
                type="number"
                min={1}
                required
                value={remainingInstallmentsStr}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setRemainingInstallmentsStr(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Toplam Taksit</label>
              <input
                type="number"
                min={1}
                required
                value={totalInstallmentsStr}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setTotalInstallmentsStr(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ödeme Günü</label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={paymentDayStr}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setPaymentDayStr(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Not (Opsiyonel)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: Ev yenileme kredisi"
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
              className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg transition"
            >
              {initialLoan ? 'Kaydet' : 'Krediyi Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
