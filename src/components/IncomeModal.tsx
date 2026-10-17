import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome?: number;
  onSaveIncome: (income: number) => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  monthlyIncome = 0,
  onSaveIncome
}) => {
  const [val, setVal] = useState(monthlyIncome ? monthlyIncome.toString() : '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveIncome(parseFloat(val) || 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Aylık Net Gelir Belirle
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aylık Toplam Net Geliriniz (₺)</label>
            <input
              type="number"
              required
              value={val}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Maaş + Ek Gelirler (Örn: 65000)"
              className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Bu tutar, ödemeleriniz düştükten sonra kalan net bakiyenizi hesaplamak için kullanılır.
            </p>
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
            >
              İptal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-lg"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
