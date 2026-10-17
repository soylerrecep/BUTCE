import React, { useState, useEffect } from 'react';
import { X, HandCoins, User, Calendar, FileText, Phone } from 'lucide-react';
import { Receivable } from '../types';

interface ReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (receivableData: Omit<Receivable, 'id' | 'createdAt' | 'collections'>, id?: string) => void;
  initialReceivable?: Receivable | null;
}

export const ReceivableModal: React.FC<ReceivableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReceivable
}) => {
  const [debtorName, setDebtorName] = useState('');
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialReceivable) {
      setDebtorName(initialReceivable.debtorName);
      setTitle(initialReceivable.title);
      setTotalAmount(initialReceivable.totalAmount.toString());
      setDueDate(initialReceivable.dueDate || '');
      setPhone(initialReceivable.phone || '');
      setNotes(initialReceivable.notes || '');
    } else {
      setDebtorName('');
      setTitle('');
      setTotalAmount('');
      setDueDate('');
      setPhone('');
      setNotes('');
    }
    setError('');
  }, [initialReceivable, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!debtorName.trim()) {
      setError('Lütfen borçlu kişi veya kurum adını girin.');
      return;
    }

    if (!title.trim()) {
      setError('Lütfen alacak konusunu veya açıklamasını girin.');
      return;
    }

    const parsedAmount = parseFloat(totalAmount.replace(/,/g, '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Lütfen geçerli bir toplam alacak tutarı girin.');
      return;
    }

    onSave(
      {
        debtorName: debtorName.trim(),
        title: title.trim(),
        totalAmount: parsedAmount,
        dueDate: dueDate || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined
      },
      initialReceivable ? initialReceivable.id : undefined
    );

    onClose();
  };

  return (
    <div
      id="receivable-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="receivable-modal-container"
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {initialReceivable ? 'Alacağı Düzenle' : 'Yeni Alacak Ekle'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kişisel veya kurumsal alacak kaydı
              </p>
            </div>
          </div>
          <button
            id="receivable-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-300 font-medium mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Debtor Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              Borçlu Kişi / Kurum <span className="text-rose-500">*</span>
            </label>
            <input
              id="receivable-debtor-input"
              type="text"
              placeholder="Örn: Ahmet Yılmaz, Komşu Mehmet..."
              value={debtorName}
              onChange={(e) => setDebtorName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Title / Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              Alacak Konusu / Başlık <span className="text-rose-500">*</span>
            </label>
            <input
              id="receivable-title-input"
              type="text"
              placeholder="Örn: Elden Verilen Borç, Telefon Satış Bedeli..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Total Amount */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <HandCoins className="w-3.5 h-3.5 text-emerald-500" />
              Toplam Alacak Tutarı (₺) <span className="text-rose-500">*</span>
            </label>
            <input
              id="receivable-amount-input"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Due Date & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Vade / Beklenen Tarih
              </label>
              <input
                id="receivable-duedate-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Telefon Numarası
              </label>
              <input
                id="receivable-phone-input"
                type="tel"
                placeholder="05xx xxx xx xx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Özel Notlar (Opsiyonel)
            </label>
            <textarea
              id="receivable-notes-input"
              rows={2}
              placeholder="Örn: 2 taksitte vereceğini söyledi, IBAN ile gönderecek..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              id="receivable-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition"
            >
              İptal
            </button>
            <button
              id="receivable-submit-btn"
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition"
            >
              {initialReceivable ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
