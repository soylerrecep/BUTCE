import React, { useState } from 'react';
import {
  HandCoins,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Calendar,
  Phone,
  Banknote,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Receivable } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ReceivablesViewProps {
  receivables: Receivable[];
  onOpenAddModal: () => void;
  onEditReceivable: (receivable: Receivable) => void;
  onDeleteReceivable: (id: string) => void;
  onOpenCollectionModal: (receivable: Receivable) => void;
  onDeleteCollection: (receivableId: string, collectionId: string) => void;
}

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({
  receivables,
  onOpenAddModal,
  onEditReceivable,
  onDeleteReceivable,
  onOpenCollectionModal,
  onDeleteCollection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Calculate totals
  const totalReceivablesAmount = receivables.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalCollectedAmount = receivables.reduce(
    (sum, r) => sum + r.collections.reduce((cSum, c) => cSum + c.amount, 0),
    0
  );
  const totalRemainingAmount = Math.max(0, totalReceivablesAmount - totalCollectedAmount);
  const overallPercentage =
    totalReceivablesAmount > 0
      ? Math.min(100, Math.round((totalCollectedAmount / totalReceivablesAmount) * 100))
      : 0;

  // Filter receivables
  const filteredReceivables = receivables.filter((r) => {
    const totalCollected = r.collections.reduce((sum, c) => sum + c.amount, 0);
    const remaining = Math.max(0, r.totalAmount - totalCollected);
    const isCompleted = remaining === 0 && r.totalAmount > 0;

    // Search query filter
    const matchesSearch =
      r.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.phone && r.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'pending') return !isCompleted;
    if (statusFilter === 'completed') return isCompleted;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="receivables-view-container" className="space-y-4 pb-20">
      {/* Overview Dashboard Card */}
      <div
        id="receivables-summary-card"
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4.5 rounded-3xl shadow-xl border border-slate-700/60 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Bağımsız Alacak Hesabı
              </span>
              <h2 className="text-base font-extrabold text-white leading-none">
                Alacaklar & Tahsilatlar
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
            %{overallPercentage} Tahsil Edildi
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>

        {/* Financials 3-column stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 backdrop-blur-sm p-2 rounded-2xl border border-white/5">
            <span className="text-[10px] text-slate-400 block font-semibold">Toplam Alacak</span>
            <span className="text-xs font-black text-white">
              {formatCurrency(totalReceivablesAmount)}
            </span>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-sm p-2 rounded-2xl border border-emerald-500/20">
            <span className="text-[10px] text-emerald-300 block font-semibold">Tahsil Edilen</span>
            <span className="text-xs font-black text-emerald-400">
              {formatCurrency(totalCollectedAmount)}
            </span>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-sm p-2 rounded-2xl border border-amber-500/20">
            <span className="text-[10px] text-amber-300 block font-semibold">Kalan Alacak</span>
            <span className="text-xs font-black text-amber-300">
              {formatCurrency(totalRemainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar: Search, Filters & Add Button */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="receivables-search-input"
              type="text"
              placeholder="Borçlu kişi veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* New Receivable Button */}
          <button
            id="receivables-add-btn"
            onClick={onOpenAddModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Alacak Ekle</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            id="receivables-filter-all-btn"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tümü ({receivables.length})
          </button>
          <button
            id="receivables-filter-pending-btn"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Bekleyenler ({receivables.filter((r) => r.totalAmount > r.collections.reduce((s, c) => s + c.amount, 0)).length})
          </button>
          <button
            id="receivables-filter-completed-btn"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Tamamlananlar ({receivables.filter((r) => r.totalAmount > 0 && r.totalAmount <= r.collections.reduce((s, c) => s + c.amount, 0)).length})
          </button>
        </div>
      </div>

      {/* Receivables List */}
      {filteredReceivables.length === 0 ? (
        <div
          id="receivables-empty-state"
          className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="w-14 h-14 mx-auto mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <HandCoins className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {searchQuery || statusFilter !== 'all' ? 'Aramaya uygun alacak bulunamadı' : 'Kayıtlı Alacak Yok'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Farklı bir arama terimi veya filtre seçmeyi deneyin.'
              : 'Borç verdiğiniz kişileri veya alacaklarınızı ekleyip aldıkça parça parça tahsilat kaydedebilirsiniz.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            İlk Alacağı Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReceivables.map((receivable) => {
            const totalCollected = receivable.collections.reduce((sum, c) => sum + c.amount, 0);
            const remaining = Math.max(0, receivable.totalAmount - totalCollected);
            const isCompleted = remaining === 0 && receivable.totalAmount > 0;
            const percentage =
              receivable.totalAmount > 0
                ? Math.min(100, Math.round((totalCollected / receivable.totalAmount) * 100))
                : 0;
            const isExpanded = expandedId === receivable.id;

            return (
              <div
                key={receivable.id}
                id={`receivable-card-${receivable.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Main Card Header & Summary */}
                <div className="p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {receivable.debtorName}
                        </h4>
                        {/* Status Badge */}
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Tamamlandı
                          </span>
                        ) : totalCollected > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                            <Clock className="w-3 h-3" />
                            Kısmi Tahsilat (%{percentage})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3" />
                            Bekliyor
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {receivable.title}
                      </p>
                    </div>

                    {/* Edit & Delete Action Icons */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onEditReceivable(receivable)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteReceivable(receivable.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial amounts grid */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Toplam</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(receivable.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Tahsil Edilen
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalCollected)}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
                        Kalan Borç
                      </span>
                      <span
                        className={`font-black text-xs ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isCompleted ? '0 ₺ (Bitti)' : formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                      <span>Tahsilat İlerlemesi</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {receivable.collections.length} işlem • %{percentage}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Due date, phone or note snippets */}
                  {(receivable.dueDate || receivable.phone || receivable.notes) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      {receivable.dueDate && (
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Vade: {new Date(receivable.dueDate).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                      {receivable.phone && (
                        <a
                          href={`tel:${receivable.phone}`}
                          className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {receivable.phone}
                        </a>
                      )}
                      {receivable.notes && (
                        <span className="flex items-center gap-1 truncate max-w-full text-slate-400">
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate">{receivable.notes}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons row */}
                  <div className="pt-1 flex items-center gap-2">
                    {/* + Tahsilat Ekle Button */}
                    <button
                      id={`receivable-add-collection-btn-${receivable.id}`}
                      onClick={() => onOpenCollectionModal(receivable)}
                      disabled={isCompleted}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                        isCompleted
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>{isCompleted ? 'Borç Tamamen Kapandı' : '+ Tahsilat Ekle'}</span>
                    </button>

                    {/* Toggle Collections History Button */}
                    <button
                      id={`receivable-history-toggle-btn-${receivable.id}`}
                      onClick={() => toggleExpand(receivable.id)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                    >
                      <span>Tahsilatlar ({receivable.collections.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Collection History Drawer */}
                {isExpanded && (
                  <div
                    id={`receivable-history-drawer-${receivable.id}`}
                    className="bg-slate-50/80 dark:bg-slate-950/60 p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs animate-fadeIn"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                        Tahsilat Hareketleri
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Toplam Alınan: {formatCurrency(totalCollected)}
                      </span>
                    </div>

                    {receivable.collections.length === 0 ? (
                      <div className="text-center py-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                        Henüz bu alacak için tahsilat yapılmadı.
                        <div className="mt-2">
                          <button
                            onClick={() => onOpenCollectionModal(receivable)}
                            className="text-emerald-600 dark:text-emerald-400 font-bold underline hover:text-emerald-500"
                          >
                            + İlk tahsilatı ekleyin
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {receivable.collections.map((collection, idx) => (
                          <div
                            key={collection.id || idx}
                            className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0 font-extrabold text-xs">
                                #{idx + 1}
                              </div>
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                    +{formatCurrency(collection.amount)}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {collection.date
                                      ? new Date(collection.date).toLocaleDateString('tr-TR')
                                      : ''}
                                  </span>
                                </div>
                                {collection.note && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {collection.note}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Delete collection button */}
                            <button
                              onClick={() => onDeleteCollection(receivable.id, collection.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                              title="Bu tahsilatı sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
