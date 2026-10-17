import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, CheckCircle2, AlertCircle, Percent, ArrowRight } from 'lucide-react';
import { CreditCard } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PartialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
  onSavePartialPayment: (cardId: string, paidAmount: number) => void;
}

export const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({
  isOpen,
  onClose,
  card,
  onSavePartialPayment
}) => {
  const [amountStr, setAmountStr] = useState<string>('');

  useEffect(() => {
    if (card) {
      // If card was already partially paid, load paidAmount, else default to minimum payment or statementAmount
      if (card.paidAmountThisMonth && card.paidAmountThisMonth > 0) {
        setAmountStr(card.paidAmountThisMonth.toString());
      } else {
        // Default to half or minimum payment
        const defaultAmt = card.minimumPayment > 0 ? card.minimumPayment : card.statementAmount / 2;
        setAmountStr(defaultAmt.toString());
      }
    }
  }, [card, isOpen]);

  if (!isOpen || !card) return null;

  const statementAmt = card.statementAmount || 0;
  const currentPaid = parseFloat(amountStr) || 0;
  const remainingAmt = Math.max(0, statementAmt - currentPaid);

  const handleQuickSelect = (amt: number) => {
    setAmountStr(amt.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePartialPayment(card.id, Math.min(statementAmt, currentPaid));
    onClose();
  };

  const isFullPayment = currentPaid >= statementAmt;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kredi Kartı Kısmi / Tam Ödeme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {card.bankName} - {card.cardName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Summary Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Toplam Ekstre Borcu</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(statementAmt)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Asgari Ödeme Tutarı</span>
            <span className="text-lg font-extrabold text-amber-500">
              {formatCurrency(card.minimumPayment)}
            </span>
          </div>
        </div>

        {/* Quick Choice Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Hızlı Tutar Seçimi
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickSelect(card.minimumPayment)}
              className={`p-2.5 rounded-xl border font-bold text-center transition ${
                currentPaid === card.minimumPayment && !isFullPayment
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500'
              }`}
            >
              <div className="text-[10px] opacity-80">Asgari Tutar</div>
              <div className="text-xs font-black mt-0.5">{formatCurrency(card.minimumPayment)}</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect(Math.round(statementAmt / 2))}
              className={`p-2.5 rounded-xl border font-bold text-center transition ${
                currentPaid === Math.round(statementAmt / 2) && !isFullPayment
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500'
              }`}
            >
              <div className="text-[10px] opacity-80">%50 Yarısı</div>
              <div className="text-xs font-black mt-0.5">{formatCurrency(Math.round(statementAmt / 2))}</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect(statementAmt)}
              className={`p-2.5 rounded-xl border font-bold text-center transition ${
                isFullPayment
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              <div className="text-[10px] opacity-80">Tam Ödeme</div>
              <div className="text-xs font-black mt-0.5">{formatCurrency(statementAmt)}</div>
            </button>
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ödenecek Miktar (₺)
            </label>
            <input
              type="number"
              min={0}
              max={statementAmt}
              step="any"
              required
              value={amountStr}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="Örn: 5000"
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Breakdown Preview */}
          <div className={`p-4 rounded-2xl border ${isFullPayment ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'} space-y-2 text-xs`}>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Bu Ay Ödenecek Miktar:</span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {formatCurrency(currentPaid)}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Gelecek Aya Aktarılacak Kalan Borç:</span>
              <span className={`font-black text-sm ${isFullPayment ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {formatCurrency(remainingAmt)}
              </span>
            </div>

            {!isFullPayment && remainingAmt > 0 && (
              <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 pt-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Kalan {formatCurrency(remainingAmt)}</strong> borç, &quot;Yeni Ayı Başlat&quot; işlemi yapıldığında otomatik olarak gelecek aya kart ekstre borcu olarak aktarılacaktır.
                </span>
              </div>
            )}

            {isFullPayment && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 pt-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Ekstrenin tamamı ödeniyor. Gelecek aya borç devretmeyecektir.</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className={`w-2/3 py-3 rounded-2xl font-black text-xs shadow-lg transition active:scale-95 ${
                isFullPayment
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isFullPayment ? 'Tam Ödemeyi Kaydet' : 'Kısmi Ödemeyi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
