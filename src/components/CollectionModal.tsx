import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calendar, FileText, Banknote, DollarSign } from 'lucide-react';
import { Receivable } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  receivable: Receivable | null;
  onSaveCollection: (receivableId: string, collection: { amount: number; date: string; note?: string }) => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  receivable,
  onSaveCollection
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(todayStr);
      setNote('');
      setError('');
    }
  }, [isOpen, todayStr]);

  if (!isOpen || !receivable) return null;

  const totalCollected = receivable.collections.reduce((sum, c) => sum + c.amount, 0);
  const remainingAmount = Math.max(0, receivable.totalAmount - totalCollected);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount.replace(/,/g, '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Lütfen geçerli bir tahsilat tutarı girin.');
      return;
    }

    if (parsedAmount > remainingAmount) {
      const confirmExceed = window.confirm(
        `Girilen tutar (${formatCurrency(parsedAmount)}) kalan borçtan (${formatCurrency(remainingAmount)}) fazla. Yine de devam edilsin mi?`
      );
      if (!confirmExceed) return;
    }

    onSaveCollection(receivable.id, {
      amount: parsedAmount,
      date: date || todayStr,
      note: note.trim() || undefined
    });

    onClose();
  };

  const handleSetQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  return (
    <div
      id="collection-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="collection-modal-container"
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Tahsilat Ekle
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {receivable.debtorName} • {receivable.title}
              </p>
            </div>
          </div>
          <button
            id="collection-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance summary card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Toplam Alacak</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatCurrency(receivable.totalAmount)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Alınan Tutar</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCollected)}
            </span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-bold">Kalan Borç</span>
            <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-300 font-medium mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Amount input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Tahsil Edilen Tutar (₺) <span className="text-rose-500">*</span>
              </label>
              {remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handleSetQuickAmount(remainingAmount)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Kalanın Tamamı ({formatCurrency(remainingAmount)})
                </button>
              )}
            </div>
            <input
              id="collection-amount-input"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              autoFocus
            />

            {/* Quick Presets */}
            {remainingAmount > 0 && (
              <div className="flex gap-1.5 mt-2">
                {[
                  { label: '%25', val: Math.round(remainingAmount * 0.25) },
                  { label: '%50', val: Math.round(remainingAmount * 0.5) },
                  { label: '%75', val: Math.round(remainingAmount * 0.75) },
                  { label: 'Tamamı', val: remainingAmount }
                ]
                  .filter(p => p.val > 0)
                  .map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSetQuickAmount(preset.val)}
                      className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold transition"
                    >
                      {preset.label} ({formatCurrency(preset.val)})
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Date input */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tahsilat Tarihi
            </label>
            <input
              id="collection-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Note / Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Açıklama / Not (Opsiyonel)
            </label>
            <input
              id="collection-note-input"
              type="text"
              placeholder="Örn: Elden nakit alındı, Havale yapıldı, 1. taksit..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              id="collection-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition"
            >
              Vazgeç
            </button>
            <button
              id="collection-submit-btn"
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tahsilatı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
