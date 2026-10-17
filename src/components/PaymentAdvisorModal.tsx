import React, { useState, useMemo } from 'react';
import { 
  X, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2, 
  Landmark, 
  CreditCard as CardIcon, 
  ReceiptText, 
  Sparkles, 
  ChevronRight, 
  Wallet,
  TrendingDown,
  Info,
  Check,
  Percent,
  SlidersHorizontal,
  Target as TargetIcon
} from 'lucide-react';
import { CreditCard, Loan, Debt } from '../types';
import { formatCurrency, getDueDateLabel } from '../utils/formatters';
import { 
  generateRecommendations, 
  PaymentRecommendation, 
  simulateFreedCash, 
  getAvailableTargets,
  AdvisorTarget 
} from '../utils/paymentAdvisor';

interface PaymentAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  loans: Loan[];
  debts: Debt[];
  initialTargetId?: string;
}

export const PaymentAdvisorModal: React.FC<PaymentAdvisorModalProps> = ({
  isOpen,
  onClose,
  cards,
  loans,
  debts,
  initialTargetId
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'targetSolver' | 'simulator'>(
    initialTargetId ? 'targetSolver' : 'recommendations'
  );
  const [filterType, setFilterType] = useState<'all' | 'loans' | 'cards' | 'multi'>('all');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(initialTargetId || '');

  // Simulator state: set of card IDs to pay minimum on
  const [simulatedCardIds, setSimulatedCardIds] = useState<string[]>(() => {
    // Default to the first unpaid card with highest freed cash
    const unpaid = cards.filter(c => !c.isPaidThisMonth && c.statementAmount > c.minimumPayment);
    return unpaid.length > 0 ? [unpaid[0].id] : [];
  });

  // Simulator target basket (items chosen by user to pay with freed cash)
  const [simulatedBasketIds, setSimulatedBasketIds] = useState<string[]>([]);

  // Calculate all recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(cards, loans, debts);
  }, [cards, loans, debts]);

  // Filtered recommendations for Tab 1
  const filteredRecs = useMemo(() => {
    return recommendations.filter(r => {
      if (filterType === 'all') return true;
      if (filterType === 'loans') return r.targets.some(t => t.type === 'loan');
      if (filterType === 'cards') return r.targets.some(t => t.type === 'card');
      if (filterType === 'multi') return r.type === 'multi-card' || r.type === 'multi-target';
      return true;
    });
  }, [recommendations, filterType]);

  // All available targets for Tab 2
  const allTargets = useMemo(() => {
    return getAvailableTargets(cards, loans, debts);
  }, [cards, loans, debts]);

  // Selected target for Tab 2
  const currentTarget = useMemo(() => {
    if (!selectedTargetId && allTargets.length > 0) return allTargets[0];
    return allTargets.find(t => t.id === selectedTargetId) || allTargets[0];
  }, [selectedTargetId, allTargets]);

  // Matching recommendations for selected target
  const targetMatches = useMemo(() => {
    if (!currentTarget) return [];
    return recommendations.filter(r => r.targets.some(t => t.id === currentTarget.id));
  }, [recommendations, currentTarget]);

  // Simulator calculations for Tab 3
  const simResult = useMemo(() => {
    return simulateFreedCash(simulatedCardIds, cards, loans, debts);
  }, [simulatedCardIds, cards, loans, debts]);

  // Basket total in simulator
  const basketTotal = useMemo(() => {
    const all = [...simResult.payableTargets, ...simResult.unpayableTargets].map(p => p.target);
    return simulatedBasketIds.reduce((sum, id) => {
      const item = all.find(t => t.id === id);
      return sum + (item ? item.requiredAmount : 0);
    }, 0);
  }, [simulatedBasketIds, simResult]);

  if (!isOpen) return null;

  const handleToggleSimCard = (cardId: string) => {
    setSimulatedCardIds(prev => 
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const handleToggleBasketItem = (targetId: string) => {
    setSimulatedBasketIds(prev => 
      prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
    );
  };

  const handleApplyRecToSimulator = (rec: PaymentRecommendation) => {
    setSimulatedCardIds(rec.sourceCards.map(c => c.id));
    setSimulatedBasketIds(rec.targets.map(t => t.id));
    setActiveTab('simulator');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-blue-950/30 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
                <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Akıllı Asgari & Taksit Tavsiyesi
                  </h2>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {recommendations.length} Fırsat
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Hangi kartın asgarisini ödeyerek hangi kredi veya kartı tamamen kapatabilirsiniz?
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'recommendations'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tavsiyeler</span>
            </button>

            <button
              onClick={() => setActiveTab('targetSolver')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'targetSolver'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TargetIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Hedefe Göre</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
              <span>Simülatör</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* TAB 1: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Tümü ({recommendations.length})
                </button>
                <button
                  onClick={() => setFilterType('loans')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    filterType === 'loans'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Landmark className="w-3 h-3" />
                  Kredileri Kapatanlar
                </button>
                <button
                  onClick={() => setFilterType('cards')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    filterType === 'cards'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <CardIcon className="w-3 h-3" />
                  Kartları Sıfırlayanlar
                </button>
                <button
                  onClick={() => setFilterType('multi')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    filterType === 'multi'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Çifte & Çoklu Fırsatlar
                </button>
              </div>

              {filteredRecs.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Lightbulb className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Bu filtreye uygun tavsiye bulunamadı
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Kredi kartı ekstreleri ödendikçe veya borç tutarları asgari farkını aştıkça yeni tavsiyeler oluşacaktır.
                  </p>
                </div>
              ) : (
                filteredRecs.map(rec => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50 dark:hover:border-amber-500/40 transition shadow-sm space-y-3"
                  >
                    {/* Top title and badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                          rec.priority === 'high'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : rec.priority === 'medium'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {rec.type === 'multi-target' ? 'Çifte Ödeme Fırsatı' : rec.targets[0]?.type === 'loan' ? 'Kredi Kapatma' : 'Kart Dengeleme'}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {rec.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        +{formatCurrency(rec.extraCashLeft)} Artar
                      </span>
                    </div>

                    {/* Visual Comparison Flow */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {/* Left: Source Cards */}
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <CardIcon className="w-3 h-3" />
                          Yalnızca Asgari Ödenecek
                        </span>
                        {rec.sourceCards.map(sc => (
                          <div key={sc.id} className="text-xs">
                            <div className="font-extrabold text-slate-800 dark:text-slate-100">
                              {sc.bankName} - {sc.cardName}
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>Ekstre: {formatCurrency(sc.statementAmount)}</span>
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                Asgari: {formatCurrency(sc.minimumPayment)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Serbest Kalan Nakit:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(rec.totalFreedCash)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Target Items */}
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-emerald-500/30 dark:border-emerald-500/20 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Tamamen Kapanacak Hedef
                        </span>
                        {rec.targets.map(t => (
                          <div key={t.id} className="text-xs">
                            <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                              <span>{t.title}</span>
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                                %100 Ödenir
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>{t.subtitle || 'Bu Ayki Borç'}</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {formatCurrency(t.requiredAmount)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Cepte Kalan Nakit:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(rec.extraCashLeft)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tip and Action Button */}
                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span>{rec.financialTip}</span>
                      </p>
                      <button
                        onClick={() => handleApplyRecToSimulator(rec)}
                        className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 active:scale-95 transition flex items-center gap-1 whitespace-nowrap"
                      >
                        <span>Simülatörde Aç</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: TARGET SOLVER */}
          {activeTab === 'targetSolver' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-500/20 text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                  🎯 Hangi Borcu Tamamen Kapatmak İstiyorsunuz?
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Kapatmak istediğiniz kredi taksitini veya kartı aşağıdan seçin; sistem hangi kartlarınızın asgarisini ödeyerek bu parayı karşılayabileceğinizi anında göstersin.
                </p>
              </div>

              {/* Target Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kapatılacak Hedef Borcu Seçin:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allTargets.map(t => {
                    const isSelected = currentTarget?.id === t.id;
                    const matchesCount = recommendations.filter(r => r.targets.some(x => x.id === t.id)).length;

                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTargetId(t.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-500/10 dark:bg-blue-950/50 border-blue-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-blue-500/40'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            {t.type === 'loan' && <Landmark className="w-3.5 h-3.5 text-blue-500" />}
                            {t.type === 'card' && <CardIcon className="w-3.5 h-3.5 text-emerald-500" />}
                            {t.type === 'debt' && <ReceiptText className="w-3.5 h-3.5 text-amber-500" />}
                            <span>{t.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.subtitle || 'Bu Ayki Ödeme'}
                          </div>
                          <div className="text-xs font-black text-slate-900 dark:text-white pt-1">
                            {formatCurrency(t.requiredAmount)}
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg whitespace-nowrap ${
                          matchesCount > 0
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                          {matchesCount > 0 ? `${matchesCount} Yol` : 'Yol Yok'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Solution display for chosen target */}
              {currentTarget && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      "{currentTarget.title}" İçin Ödeme Çözümleri:
                    </h3>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gereken Tutar: {formatCurrency(currentTarget.requiredAmount)}
                    </span>
                  </div>

                  {targetMatches.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                      Bu borcun tutarı ({formatCurrency(currentTarget.requiredAmount)}), mevcut kartlarınızın tek tek veya çift olarak açığa çıkarabileceği asgari nakit farkından daha yüksek. Farklı kart kombinasyonları için <strong>Simülatör</strong> sekmesinde birden çok kartı birlikte seçebilirsiniz.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {targetMatches.map((match, idx) => (
                        <div
                          key={match.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span>
                                {match.sourceCards.map(c => c.cardName).join(' + ')} Asgarisiyle
                              </span>
                            </span>
                            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                              Cepte: +{formatCurrency(match.extraCashLeft)}
                            </span>
                          </div>

                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                            <div className="font-bold text-slate-700 dark:text-slate-300">Ödeme Adımları:</div>
                            {match.sourceCards.map(sc => (
                              <div key={sc.id} className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>
                                  <strong>{sc.bankName} ({sc.cardName}):</strong> Tam ekstre yerine asgari <strong>{formatCurrency(sc.minimumPayment)}</strong> yatırın (<strong>{formatCurrency(sc.freedCash)}</strong> nakit açığa çıkar).
                                </span>
                              </div>
                            ))}
                            <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 pt-0.5">
                              <Check className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>
                                Açığa çıkan nakitle <strong>{currentTarget.title} ({formatCurrency(currentTarget.requiredAmount)})</strong> borcunu tamamen kapatın.
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => handleApplyRecToSimulator(match)}
                              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] active:scale-95 transition flex items-center gap-1"
                            >
                              <span>Bu Planı Simüle Et</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERACTIVE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/20 text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                  🎛️ Özel Nakit Akışı & Asgari Simülatörü
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  İstediğiniz kartları asgariye çekin; toplam açığa çıkan serbest nakit ve bu nakitle tamamen kapatabileceğiniz borçların anlık listesini inceleyin.
                </p>
              </div>

              {/* Cards selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Asgarisini Ödemek İstediğiniz Kartları Seçin:
                </label>
                <div className="space-y-1.5">
                  {cards.map(card => {
                    const isSelected = simulatedCardIds.includes(card.id);
                    const freed = Math.max(0, card.statementAmount - card.minimumPayment);

                    return (
                      <div
                        key={card.id}
                        onClick={() => handleToggleSimCard(card.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 pointer-events-none"
                          />
                          <div>
                            <div className="text-xs font-black">
                              {card.bankName} - {card.cardName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Ekstre: {formatCurrency(card.statementAmount)} | Asgari: {formatCurrency(card.minimumPayment)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-black block ${
                            isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            +{formatCurrency(freed)} Nakit
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isSelected ? 'Asgari Ödenecek' : 'Tam Ekstre'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Summary Bar */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-3xl shadow-lg border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Seçili Kartların Asgarisi:</span>
                  <span className="font-bold text-amber-400">{formatCurrency(simResult.totalMin)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Normalde Gidecek Tam Ekstre:</span>
                  <span className="font-bold text-slate-300 line-through">{formatCurrency(simResult.totalStatement)}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase font-black text-emerald-400 tracking-wider block">
                      Açığa Çıkan Serbest Likidite
                    </span>
                    <span className="text-2xl font-black text-white">
                      +{formatCurrency(simResult.totalFreed)}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    <span className="block font-bold text-emerald-400">
                      {simResult.payableTargets.length} Adet Borç
                    </span>
                    <span>%100 Kapatılabilir</span>
                  </div>
                </div>
              </div>

              {/* Payable Targets List */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Bu Nakitle Kapatılabilecek Borçlar ({simResult.payableTargets.length})</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Kalan Bütçe Testi</span>
                </h3>

                {simResult.payableTargets.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-500">
                    Seçili kartlardan elde edilen serbest nakit ({formatCurrency(simResult.totalFreed)}) mevcut borçların hiçbirini tek başına karşılamıyor. Lütfen yukarıdan daha fazla kart seçin.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {simResult.payableTargets.map(({ target, extraCash }) => {
                      const isBasketSelected = simulatedBasketIds.includes(target.id);

                      return (
                        <div
                          key={target.id}
                          onClick={() => handleToggleBasketItem(target.id)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                            isBasketSelected
                              ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isBasketSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 pointer-events-none"
                            />
                            <div>
                              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                {target.type === 'loan' && <Landmark className="w-3.5 h-3.5 text-blue-500" />}
                                {target.type === 'card' && <CardIcon className="w-3.5 h-3.5 text-emerald-500" />}
                                {target.type === 'debt' && <ReceiptText className="w-3.5 h-3.5 text-amber-500" />}
                                <span>{target.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {target.subtitle || 'Taksit Tutarı'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 dark:text-white block">
                              {formatCurrency(target.requiredAmount)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Artan: +{formatCurrency(extraCash)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Basket summary if items are checked */}
                {simulatedBasketIds.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs space-y-1.5 mt-2">
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span>Seçilen {simulatedBasketIds.length} Borcun Toplamı:</span>
                      <span>{formatCurrency(basketTotal)}</span>
                    </div>
                    <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Kalan Net Serbest Nakit:</span>
                      <span className={simResult.totalFreed >= basketTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                        {simResult.totalFreed >= basketTotal 
                          ? `+${formatCurrency(simResult.totalFreed - basketTotal)} (Yeterli)` 
                          : `-${formatCurrency(basketTotal - simResult.totalFreed)} (Yetersiz)`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            * Asgari ödemelerde kalan bakiye için banka faizi işletilir.
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs active:scale-95 transition"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
