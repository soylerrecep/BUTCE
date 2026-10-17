import React, { useState, useEffect, useMemo } from 'react';
import { TabType, CreditCard, Loan, Debt, Receivable } from './types';
import { INITIAL_CARDS, INITIAL_LOANS, INITIAL_DEBTS, INITIAL_RECEIVABLES } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { CardsView } from './components/CardsView';
import { LoansView } from './components/LoansView';
import { DebtsView } from './components/DebtsView';
import { ReceivablesView } from './components/ReceivablesView';

import { CardModal } from './components/CardModal';
import { LoanModal } from './components/LoanModal';
import { DebtModal } from './components/DebtModal';
import { ReceivableModal } from './components/ReceivableModal';
import { CollectionModal } from './components/CollectionModal';
import { IncomeModal } from './components/IncomeModal';
import { BackupModal } from './components/BackupModal';
import { ConfirmModal } from './components/ConfirmModal';
import { PartialPaymentModal } from './components/PartialPaymentModal';
import { MonthPickerModal } from './components/MonthPickerModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PaymentAdvisorModal } from './components/PaymentAdvisorModal';
import { FutureInstallmentsModal } from './components/FutureInstallmentsModal';
import { CardMonthlyPlan } from './types';
import { usePWAInstall } from './hooks/usePWAInstall';
import { getDaysRemaining, getPrevMonthKey, getNextMonthKey, getMonthDiff, getMonthsBetween } from './utils/formatters';
import { generateRecommendations } from './utils/paymentAdvisor';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finans_darkmode');
    return saved ? JSON.parse(saved) : true;
  });

  // Selected Month (e.g. "2026-08")
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => {
    const saved = localStorage.getItem('finans_selected_month');
    return saved || '2026-08';
  });

  // Monthly Payments map: monthKey -> itemId -> { isPaid, isPartial, paidAmount }
  const [monthlyPayments, setMonthlyPayments] = useState<
    Record<string, Record<string, { isPaid: boolean; isPartial?: boolean; paidAmount?: number }>>
  >(() => {
    const saved = localStorage.getItem('finans_monthly_payments');
    return saved ? JSON.parse(saved) : {};
  });

  // Base Data State
  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('finans_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('finans_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('finans_debts');
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [receivables, setReceivables] = useState<Receivable[]>(() => {
    const saved = localStorage.getItem('finans_receivables');
    return saved ? JSON.parse(saved) : INITIAL_RECEIVABLES;
  });

  const [monthlyIncome, setMonthlyIncome] = useState<number | undefined>(() => {
    const saved = localStorage.getItem('finans_income');
    return saved ? JSON.parse(saved) : 65000;
  });

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionReceivable, setCollectionReceivable] = useState<Receivable | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [advisorTargetId, setAdvisorTargetId] = useState<string | undefined>(undefined);
  const [partialPaymentCard, setPartialPaymentCard] = useState<CreditCard | null>(null);
  const [isFuturePlansModalOpen, setIsFuturePlansModalOpen] = useState(false);
  const [futurePlansCard, setFuturePlansCard] = useState<CreditCard | null>(null);

  const { isInstalled } = usePWAInstall();

  // Custom Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Sync dark mode html class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finans_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist Data to LocalStorage
  useEffect(() => {
    localStorage.setItem('finans_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('finans_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('finans_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('finans_receivables', JSON.stringify(receivables));
  }, [receivables]);

  useEffect(() => {
    if (monthlyIncome !== undefined) {
      localStorage.setItem('finans_income', JSON.stringify(monthlyIncome));
    }
  }, [monthlyIncome]);

  useEffect(() => {
    localStorage.setItem('finans_selected_month', selectedMonthKey);
  }, [selectedMonthKey]);

  useEffect(() => {
    localStorage.setItem('finans_monthly_payments', JSON.stringify(monthlyPayments));
  }, [monthlyPayments]);

  // Derived Display Items for currently selected month with dynamic month-over-month carryover
  const computeDisplayData = () => {
    const BASE_MONTH = '2026-08';
    
    // If selectedMonthKey is before BASE_MONTH, return base items directly
    if (getMonthDiff(BASE_MONTH, selectedMonthKey) < 0) {
      return {
        displayCards: cards.map(c => ({
          ...c,
          isPaidThisMonth: monthlyPayments[selectedMonthKey]?.[c.id]?.isPaid ?? false,
          isPartialPaidThisMonth: monthlyPayments[selectedMonthKey]?.[c.id]?.isPartial ?? false,
          paidAmountThisMonth: monthlyPayments[selectedMonthKey]?.[c.id]?.paidAmount ?? 0
        })),
        displayLoans: loans.map(l => ({
          ...l,
          isPaidThisMonth: monthlyPayments[selectedMonthKey]?.[l.id]?.isPaid ?? false
        })),
        displayDebts: debts.map(d => ({
          ...d,
          isPaidThisMonth: monthlyPayments[selectedMonthKey]?.[d.id]?.isPaid ?? false
        }))
      };
    }

    const monthList = getMonthsBetween(BASE_MONTH, selectedMonthKey);

    // Initialize running map with BASE_MONTH starting values
    const cardStates = new Map<string, {
      statementAmount: number;
      minimumPayment: number;
      minPayRatio: number;
      carriedOverAmount?: number;
      plannedAmountOnly?: number;
    }>();

    cards.forEach(c => {
      const overrideStmt = monthlyPayments[BASE_MONTH]?.[c.id]?.statementAmount ?? c.monthlyPlans?.[BASE_MONTH]?.statementAmount;
      const overrideMin = monthlyPayments[BASE_MONTH]?.[c.id]?.minimumPayment ?? c.monthlyPlans?.[BASE_MONTH]?.minimumPayment;
      const initialStmt = overrideStmt !== undefined ? overrideStmt : c.statementAmount;
      const initialMin = overrideMin !== undefined ? overrideMin : (overrideStmt !== undefined ? Math.round(overrideStmt * 0.2) : c.minimumPayment);
      const minRatio = initialStmt > 0 ? (initialMin / initialStmt) : 0.2;

      cardStates.set(c.id, {
        statementAmount: initialStmt,
        minimumPayment: initialMin,
        minPayRatio: minRatio,
        carriedOverAmount: undefined,
        plannedAmountOnly: overrideStmt
      });
    });

    const loanStates = new Map<string, {
      remainingInstallments: number;
      totalAmount: number;
    }>();

    loans.forEach(l => {
      loanStates.set(l.id, {
        remainingInstallments: l.remainingInstallments,
        totalAmount: l.totalAmount
      });
    });

    const debtStates = new Map<string, {
      remainingInstallments?: number;
      totalAmount: number;
    }>();

    debts.forEach(d => {
      debtStates.set(d.id, {
        remainingInstallments: d.remainingInstallments,
        totalAmount: d.totalAmount
      });
    });

    // Step through months from BASE_MONTH up to selectedMonthKey
    for (let i = 0; i < monthList.length; i++) {
      const mKey = monthList[i];

      // If not the first month, apply carryover from previous month first
      if (i > 0) {
        const prevKey = monthList[i - 1];

        // 1) Credit Cards Carryover & Planned Addition
        cards.forEach(c => {
          const prevState = cardStates.get(c.id)!;
          const prevStatus = monthlyPayments[prevKey]?.[c.id];
          const isPaid = prevStatus !== undefined ? prevStatus.isPaid : (prevKey === BASE_MONTH ? !!c.isPaidThisMonth : false);
          const isPartial = prevStatus !== undefined ? !!prevStatus.isPartial : (prevKey === BASE_MONTH ? !!c.isPartialPaidThisMonth : false);
          const paidAmount = prevStatus !== undefined ? (prevStatus.paidAmount || 0) : (prevKey === BASE_MONTH ? (c.paidAmountThisMonth || 0) : 0);

          let carriedOverFromPrev = 0;
          if (isPaid && !isPartial) {
            // Tam ödendi -> devir yok
            carriedOverFromPrev = 0;
          } else if (isPartial) {
            // Kısmi ödeme yapıldı -> kalan tutar gelecek aya devredilir
            carriedOverFromPrev = Math.max(0, prevState.statementAmount - paidAmount);
          } else {
            // Ödenmedi
            carriedOverFromPrev = prevState.statementAmount;
          }

          // Gelecek ay (mKey) için girilmiş planlı taksit / ekstre kontrolü
          const plannedStmt = monthlyPayments[mKey]?.[c.id]?.statementAmount ?? c.monthlyPlans?.[mKey]?.statementAmount;
          const plannedMin = monthlyPayments[mKey]?.[c.id]?.minimumPayment ?? c.monthlyPlans?.[mKey]?.minimumPayment;

          let finalStmt = 0;
          let finalMin = 0;
          let carriedOverAmount: number | undefined = undefined;
          let plannedAmountOnly: number | undefined = undefined;

          if (plannedStmt !== undefined) {
            plannedAmountOnly = plannedStmt;
            // Kısmi ödeme yapıldıysa ve kalan tutar devrediyorsa, planlı ödemenin üzerine ekle
            if (isPartial && carriedOverFromPrev > 0) {
              carriedOverAmount = carriedOverFromPrev;
              finalStmt = plannedStmt + carriedOverFromPrev;

              const minRatio = plannedStmt > 0 
                ? ((plannedMin !== undefined ? plannedMin : Math.round(plannedStmt * prevState.minPayRatio)) / plannedStmt) 
                : prevState.minPayRatio;
              const plannedMinPart = plannedMin !== undefined ? plannedMin : Math.round(plannedStmt * minRatio);
              const carriedMinPart = Math.round(carriedOverFromPrev * prevState.minPayRatio);
              finalMin = plannedMinPart + carriedMinPart;
            } else {
              // Kısmi ödeme kalanı yoksa veya tam ödendiyse doğrudan planlanan tutarı kullan
              finalStmt = plannedStmt;
              finalMin = plannedMin !== undefined ? plannedMin : Math.round(plannedStmt * prevState.minPayRatio);
            }
          } else {
            // Gelecek ay için özel planlı tutar girilmemişse
            if (isPartial && carriedOverFromPrev > 0) {
              carriedOverAmount = carriedOverFromPrev;
              finalStmt = carriedOverFromPrev;
              finalMin = Math.round(carriedOverFromPrev * prevState.minPayRatio);
            } else if (isPaid && !isPartial) {
              finalStmt = 0;
              finalMin = 0;
            } else {
              finalStmt = carriedOverFromPrev;
              finalMin = Math.round(carriedOverFromPrev * prevState.minPayRatio);
            }
          }

          cardStates.set(c.id, {
            statementAmount: finalStmt,
            minimumPayment: finalMin,
            minPayRatio: finalStmt > 0 ? (finalMin / finalStmt) : prevState.minPayRatio,
            carriedOverAmount,
            plannedAmountOnly
          });
        });

        // 2) Loans Carryover
        loans.forEach(l => {
          const prevKey = monthList[i - 1];
          const state = loanStates.get(l.id)!;
          const status = monthlyPayments[prevKey]?.[l.id];
          const isPaid = status !== undefined ? status.isPaid : (prevKey === BASE_MONTH ? l.isPaidThisMonth : false);

          if (isPaid) {
            const nextRem = Math.max(0, state.remainingInstallments - 1);
            const nextTotal = Math.max(0, state.totalAmount - l.monthlyInstallment);
            loanStates.set(l.id, {
              remainingInstallments: nextRem,
              totalAmount: nextTotal
            });
          }
        });

        // 3) Debts Carryover
        debts.forEach(d => {
          const prevKey = monthList[i - 1];
          const state = debtStates.get(d.id)!;
          const status = monthlyPayments[prevKey]?.[d.id];
          const isPaid = status !== undefined ? status.isPaid : (prevKey === BASE_MONTH ? d.isPaidThisMonth : false);

          if (d.isInstallment && state.remainingInstallments !== undefined) {
            if (isPaid) {
              const nextRem = Math.max(0, state.remainingInstallments - 1);
              const nextTotal = Math.max(0, state.totalAmount - d.monthlyAmount);
              debtStates.set(d.id, {
                remainingInstallments: nextRem,
                totalAmount: nextTotal
              });
            }
          }
        });
      }

      const isTarget = (mKey === selectedMonthKey);

      if (isTarget) {
        // Build final display arrays for the target month
        const displayCardsRes: CreditCard[] = cards.map(c => {
          const state = cardStates.get(c.id) || { 
            statementAmount: c.statementAmount, 
            minimumPayment: c.minimumPayment, 
            minPayRatio: 0.2,
            carriedOverAmount: undefined,
            plannedAmountOnly: undefined
          };
          const status = monthlyPayments[mKey]?.[c.id];
          const isPaid = status ? status.isPaid : (mKey === BASE_MONTH ? c.isPaidThisMonth : false);
          const isPartial = status ? !!status.isPartial : (mKey === BASE_MONTH ? !!c.isPartialPaidThisMonth : false);
          const paidAmount = status ? (status.paidAmount || 0) : (mKey === BASE_MONTH ? (c.paidAmountThisMonth || 0) : 0);
          const planNote = status?.note || c.monthlyPlans?.[mKey]?.note;

          return {
            ...c,
            statementAmount: state.statementAmount,
            minimumPayment: state.minimumPayment,
            isPaidThisMonth: isPaid,
            isPartialPaidThisMonth: isPartial,
            paidAmountThisMonth: paidAmount,
            carriedOverAmount: state.carriedOverAmount,
            plannedAmountOnly: state.plannedAmountOnly,
            notes: planNote ? (c.notes ? `${c.notes} • ${planNote}` : planNote) : c.notes
          };
        });

        const displayLoansRes: Loan[] = loans.map(l => {
          const state = loanStates.get(l.id) || { remainingInstallments: l.remainingInstallments, totalAmount: l.totalAmount };
          const status = monthlyPayments[mKey]?.[l.id];
          const isPaid = status ? status.isPaid : (mKey === BASE_MONTH ? l.isPaidThisMonth : false);

          return {
            ...l,
            remainingInstallments: state.remainingInstallments,
            totalAmount: state.totalAmount,
            isPaidThisMonth: isPaid
          };
        });

        const displayDebtsRes: Debt[] = debts.map(d => {
          const state = debtStates.get(d.id) || { remainingInstallments: d.remainingInstallments, totalAmount: d.totalAmount };
          const status = monthlyPayments[mKey]?.[d.id];
          const isPaid = status ? status.isPaid : (mKey === BASE_MONTH ? d.isPaidThisMonth : false);

          return {
            ...d,
            remainingInstallments: state.remainingInstallments,
            totalAmount: state.totalAmount,
            isPaidThisMonth: isPaid
          };
        });

        return {
          displayCards: displayCardsRes,
          displayLoans: displayLoansRes,
          displayDebts: displayDebtsRes
        };
      }
    }

    return {
      displayCards: cards,
      displayLoans: loans,
      displayDebts: debts
    };
  };

  const { displayCards, displayLoans, displayDebts } = computeDisplayData();

  // List of all monthKeys that have scheduled plans/installments
  const scheduledMonths = useMemo(() => {
    const setOfMonths = new Set<string>();
    cards.forEach(c => {
      if (c.monthlyPlans) {
        Object.keys(c.monthlyPlans).forEach(k => setOfMonths.add(k));
      }
    });
    Object.entries(monthlyPayments).forEach(([mKey, cardMap]) => {
      Object.values(cardMap).forEach(status => {
        if (status.statementAmount !== undefined && status.statementAmount > 0) {
          setOfMonths.add(mKey);
        }
      });
    });
    return Array.from(setOfMonths);
  }, [cards, monthlyPayments]);

  // Smart Advisor recommendations for the current month
  const advisorRecommendations = useMemo(() => {
    return generateRecommendations(displayCards, displayLoans, displayDebts);
  }, [displayCards, displayLoans, displayDebts]);

  const handleOpenAdvisor = (targetId?: string) => {
    setAdvisorTargetId(targetId);
    setIsAdvisorModalOpen(true);
  };

  // Handlers for Toggles
  const handleToggleCardPaid = (id: string) => {
    const card = displayCards.find(c => c.id === id);
    if (!card) return;
    const willBePaid = !(card.isPaidThisMonth || card.isPartialPaidThisMonth);

    setMonthlyPayments(prev => ({
      ...prev,
      [selectedMonthKey]: {
        ...prev[selectedMonthKey],
        [id]: {
          ...(prev[selectedMonthKey]?.[id] || {}),
          isPaid: willBePaid,
          isPartial: false,
          paidAmount: willBePaid ? card.statementAmount : 0
        }
      }
    }));

    if (selectedMonthKey === '2026-08') {
      setCards(prev =>
        prev.map(c => (c.id === id ? { ...c, isPaidThisMonth: willBePaid, isPartialPaidThisMonth: false, paidAmountThisMonth: willBePaid ? c.statementAmount : 0 } : c))
      );
    }
  };

  const handleSavePartialPayment = (cardId: string, paidAmount: number) => {
    const card = displayCards.find(c => c.id === cardId);
    if (!card) return;
    const isFull = paidAmount >= card.statementAmount;

    setMonthlyPayments(prev => ({
      ...prev,
      [selectedMonthKey]: {
        ...prev[selectedMonthKey],
        [cardId]: {
          ...(prev[selectedMonthKey]?.[cardId] || {}),
          isPaid: paidAmount > 0,
          isPartial: paidAmount > 0 && !isFull,
          paidAmount: paidAmount
        }
      }
    }));

    if (selectedMonthKey === '2026-08') {
      setCards(prev =>
        prev.map(c => (c.id === cardId ? { ...c, isPaidThisMonth: paidAmount > 0, isPartialPaidThisMonth: paidAmount > 0 && !isFull, paidAmountThisMonth: paidAmount } : c))
      );
    }
  };

  const handleToggleLoanPaid = (id: string) => {
    const loan = displayLoans.find(l => l.id === id);
    if (!loan) return;
    const willBePaid = !loan.isPaidThisMonth;

    setMonthlyPayments(prev => ({
      ...prev,
      [selectedMonthKey]: {
        ...prev[selectedMonthKey],
        [id]: {
          isPaid: willBePaid
        }
      }
    }));

    if (selectedMonthKey === '2026-08') {
      setLoans(prev =>
        prev.map(l => (l.id === id ? { ...l, isPaidThisMonth: willBePaid } : l))
      );
    }
  };

  const handleToggleDebtPaid = (id: string) => {
    const debt = displayDebts.find(d => d.id === id);
    if (!debt) return;
    const willBePaid = !debt.isPaidThisMonth;

    setMonthlyPayments(prev => ({
      ...prev,
      [selectedMonthKey]: {
        ...prev[selectedMonthKey],
        [id]: {
          isPaid: willBePaid
        }
      }
    }));

    if (selectedMonthKey === '2026-08') {
      setDebts(prev =>
        prev.map(d => (d.id === id ? { ...d, isPaidThisMonth: willBePaid } : d))
      );
    }
  };

  // Handlers for Add / Edit
  const handleSaveCard = (
    cardData: Omit<CreditCard, 'id' | 'createdAt'>,
    id?: string,
    targetMonthKey?: string
  ) => {
    const effectiveMonthKey = targetMonthKey || selectedMonthKey;

    if (id) {
      setCards(prev => prev.map(c => {
        if (c.id !== id) return c;
        if (effectiveMonthKey === '2026-08') {
          return {
            ...c,
            ...cardData,
            monthlyPlans: {
              ...(c.monthlyPlans || {}),
              [effectiveMonthKey]: {
                statementAmount: cardData.statementAmount,
                minimumPayment: cardData.minimumPayment,
                note: cardData.notes
              }
            }
          };
        }
        return {
          ...c,
          bankName: cardData.bankName,
          cardName: cardData.cardName,
          last4Digits: cardData.last4Digits,
          cardColor: cardData.cardColor,
          limit: cardData.limit,
          statementDay: cardData.statementDay,
          dueDay: cardData.dueDay,
          notes: cardData.notes || c.notes,
          monthlyPlans: {
            ...(c.monthlyPlans || {}),
            [effectiveMonthKey]: {
              statementAmount: cardData.statementAmount,
              minimumPayment: cardData.minimumPayment,
              note: cardData.notes
            }
          }
        };
      }));

      setMonthlyPayments(prev => ({
        ...prev,
        [effectiveMonthKey]: {
          ...prev[effectiveMonthKey],
          [id]: {
            ...(prev[effectiveMonthKey]?.[id] || { isPaid: false }),
            statementAmount: cardData.statementAmount,
            minimumPayment: cardData.minimumPayment,
            note: cardData.notes
          }
        }
      }));
    } else {
      const newId = `card-${Date.now()}`;
      const isBaseMonth = effectiveMonthKey === '2026-08';
      const newCard: CreditCard = {
        ...cardData,
        id: newId,
        createdAt: new Date().toISOString(),
        startMonthKey: effectiveMonthKey,
        monthlyPlans: !isBaseMonth ? {
          [effectiveMonthKey]: {
            statementAmount: cardData.statementAmount,
            minimumPayment: cardData.minimumPayment,
            note: cardData.notes
          }
        } : undefined
      };
      setCards(prev => [...prev, newCard]);
      setMonthlyPayments(prev => ({
        ...prev,
        [effectiveMonthKey]: {
          ...prev[effectiveMonthKey],
          [newId]: {
            isPaid: false,
            statementAmount: cardData.statementAmount,
            minimumPayment: cardData.minimumPayment,
            note: cardData.notes
          }
        }
      }));
    }
  };

  const handleSaveCardPlans = (cardId: string, updatedPlans: Record<string, CardMonthlyPlan>) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      return {
        ...c,
        monthlyPlans: updatedPlans
      };
    }));

    setMonthlyPayments(prev => {
      const next = { ...prev };
      Object.entries(updatedPlans).forEach(([mKey, plan]) => {
        next[mKey] = {
          ...next[mKey],
          [cardId]: {
            ...(next[mKey]?.[cardId] || { isPaid: false }),
            statementAmount: plan.statementAmount,
            minimumPayment: plan.minimumPayment || Math.round(plan.statementAmount * 0.2),
            note: plan.note
          }
        };
      });
      return next;
    });
  };

  const handleSaveLoan = (loanData: Omit<Loan, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setLoans(prev => prev.map(l => (l.id === id ? { ...l, ...loanData } : l)));
    } else {
      const newLoan: Loan = {
        ...loanData,
        id: `loan-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setLoans(prev => [...prev, newLoan]);
    }
  };

  const handleSaveDebt = (debtData: Omit<Debt, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setDebts(prev => prev.map(d => (d.id === id ? { ...d, ...debtData } : d)));
    } else {
      const newDebt: Debt = {
        ...debtData,
        id: `debt-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setDebts(prev => [...prev, newDebt]);
    }
  };

  const handleSaveReceivable = (
    receivableData: Omit<Receivable, 'id' | 'createdAt' | 'collections'>,
    id?: string
  ) => {
    if (id) {
      setReceivables(prev =>
        prev.map(r => (r.id === id ? { ...r, ...receivableData } : r))
      );
    } else {
      const newReceivable: Receivable = {
        ...receivableData,
        id: `rec-${Date.now()}`,
        collections: [],
        createdAt: new Date().toISOString()
      };
      setReceivables(prev => [...prev, newReceivable]);
    }
  };

  const handleAddCollection = (
    receivableId: string,
    collection: { amount: number; date: string; note?: string }
  ) => {
    setReceivables(prev =>
      prev.map(r => {
        if (r.id !== receivableId) return r;
        const newCollection = {
          id: `col-${Date.now()}`,
          amount: collection.amount,
          date: collection.date,
          note: collection.note,
          createdAt: new Date().toISOString()
        };
        return {
          ...r,
          collections: [...r.collections, newCollection]
        };
      })
    );
  };

  const handleDeleteCollection = (receivableId: string, collectionId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Tahsilatı Sil',
      message: 'Bu tahsilat kaydını silmek istediğinize emin misiniz? Silindiğinde kalan alacak tutarı tekrar artacaktır.',
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: () => {
        setReceivables(prev =>
          prev.map(r => {
            if (r.id !== receivableId) return r;
            return {
              ...r,
              collections: r.collections.filter(c => c.id !== collectionId)
            };
          })
        );
      }
    });
  };

  // Handlers for Delete
  const handleDeleteCard = (id: string) => {
    const card = cards.find(c => c.id === id);
    const name = card ? `${card.bankName} (${card.cardName})` : 'Bu kartı';
    setConfirmConfig({
      isOpen: true,
      title: 'Kredi Kartını Sil',
      message: `${name} kaydını kalıcı olarak silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: () => {
        setCards(prev => prev.filter(c => c.id !== id));
      }
    });
  };

  const handleDeleteLoan = (id: string) => {
    const loan = loans.find(l => l.id === id);
    const name = loan ? `${loan.bankName} - ${loan.loanName}` : 'Bu krediyi';
    setConfirmConfig({
      isOpen: true,
      title: 'Krediyi Sil',
      message: `${name} kredisini silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: () => {
        setLoans(prev => prev.filter(l => l.id !== id));
      }
    });
  };

  const handleDeleteDebt = (id: string) => {
    const debt = debts.find(d => d.id === id);
    const name = debt ? `"${debt.title}"` : 'Bu borç kaydını';
    setConfirmConfig({
      isOpen: true,
      title: 'Borç Kaydını Sil',
      message: `${name} kaydını silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: () => {
        setDebts(prev => prev.filter(d => d.id !== id));
      }
    });
  };

  const handleDeleteReceivable = (id: string) => {
    const rec = receivables.find(r => r.id === id);
    const name = rec ? `"${rec.debtorName} (${rec.title})"` : 'Bu alacak kaydını';
    setConfirmConfig({
      isOpen: true,
      title: 'Alacak Kaydını Sil',
      message: `${name} ve bu alacağa ait tüm tahsilat geçmişini silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      variant: 'danger',
      onConfirm: () => {
        setReceivables(prev => prev.filter(r => r.id !== id));
      }
    });
  };

  // Reset all
  const handleResetAllData = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Fabrika Ayarlarına Dön',
      message: 'DİKKAT: Tüm kayıtlı kart, kredi, borç, alacak ve gelir verileriniz silinecektir!',
      confirmText: 'Tümünü Temizle',
      variant: 'danger',
      onConfirm: () => {
        setCards([]);
        setLoans([]);
        setDebts([]);
        setReceivables([]);
        setMonthlyIncome(undefined);
        setMonthlyPayments({});
        localStorage.removeItem('finans_cards');
        localStorage.removeItem('finans_loans');
        localStorage.removeItem('finans_debts');
        localStorage.removeItem('finans_receivables');
        localStorage.removeItem('finans_income');
        localStorage.removeItem('finans_monthly_payments');
      }
    });
  };

  const handleRestoreData = (data: {
    cards: CreditCard[];
    loans: Loan[];
    debts: Debt[];
    receivables?: Receivable[];
    monthlyIncome?: number;
    monthlyPayments?: Record<string, Record<string, any>>;
  }) => {
    if (data.cards) setCards(data.cards);
    if (data.loans) setLoans(data.loans);
    if (data.debts) setDebts(data.debts);
    if (data.receivables) setReceivables(data.receivables);
    if (data.monthlyIncome !== undefined) setMonthlyIncome(data.monthlyIncome);
    if (data.monthlyPayments) setMonthlyPayments(data.monthlyPayments);
  };

  // Global counts & alerts for display items
  const unpaidCards = displayCards.filter(c => !c.isPaidThisMonth && !c.isPartialPaidThisMonth);
  const unpaidLoans = displayLoans.filter(l => !l.isPaidThisMonth);
  const unpaidDebts = displayDebts.filter(d => !d.isPaidThisMonth);
  const totalUnpaidCount = unpaidCards.length + unpaidLoans.length + unpaidDebts.length;

  const allUnpaidItems = [
    ...unpaidCards.map(c => ({ dueDay: c.dueDay })),
    ...unpaidLoans.map(l => ({ dueDay: l.paymentDay })),
    ...unpaidDebts.map(d => ({ dueDay: d.dueDay }))
  ];

  const overdueCount = allUnpaidItems.filter(item => getDaysRemaining(item.dueDay).status === 'overdue').length;
  const dueSoonCount = allUnpaidItems.filter(item => getDaysRemaining(item.dueDay).status === 'soon' || getDaysRemaining(item.dueDay).status === 'today').length;

  const totalMonthlyDebt = displayCards.reduce((s, c) => s + c.statementAmount, 0) +
                           displayLoans.reduce((s, l) => s + l.monthlyInstallment, 0) +
                           displayDebts.reduce((s, d) => s + d.monthlyAmount, 0);

  const totalPaidAmount = displayCards.reduce((s, c) => {
                            if (c.isPartialPaidThisMonth && c.paidAmountThisMonth) return s + c.paidAmountThisMonth;
                            if (c.isPaidThisMonth) return s + c.statementAmount;
                            return s;
                          }, 0) +
                          displayLoans.filter(l => l.isPaidThisMonth).reduce((s, l) => s + l.monthlyInstallment, 0) +
                          displayDebts.filter(d => d.isPaidThisMonth).reduce((s, d) => s + d.monthlyAmount, 0);

  const handleOpenAddModal = (type?: 'card' | 'loan' | 'debt' | 'receivable') => {
    if (type === 'card' || activeTab === 'cards') {
      setEditingCard(null);
      setIsCardModalOpen(true);
    } else if (type === 'loan' || activeTab === 'loans') {
      setEditingLoan(null);
      setIsLoanModalOpen(true);
    } else if (type === 'debt' || activeTab === 'debts') {
      setEditingDebt(null);
      setIsDebtModalOpen(true);
    } else if (type === 'receivable' || activeTab === 'receivables') {
      setEditingReceivable(null);
      setIsReceivableModalOpen(true);
    } else {
      setEditingCard(null);
      setIsCardModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-slate-100/50 dark:bg-slate-950 shadow-2xl">
        <OfflineIndicator />
        <PWAInstallBanner onOpenModal={() => setIsInstallModalOpen(true)} />

        {/* Header */}
        <Header
          activeTab={activeTab}
          overdueCount={overdueCount}
          dueSoonCount={dueSoonCount}
          totalMonthlyDebt={totalMonthlyDebt}
          totalPaidAmount={totalPaidAmount}
          selectedMonthKey={selectedMonthKey}
          onOpenMonthPicker={() => setIsMonthPickerOpen(true)}
          onPrevMonth={() => setSelectedMonthKey(prev => getPrevMonthKey(prev))}
          onNextMonth={() => setSelectedMonthKey(prev => getNextMonthKey(prev))}
          onOpenAddModal={() => handleOpenAddModal()}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          isInstalled={isInstalled}
          onOpenAdvisor={() => handleOpenAdvisor()}
          advisorCount={advisorRecommendations.length}
        />

        {/* Section View Container */}
        <main className="flex-1 px-3.5 py-2">
          {activeTab === 'dashboard' && (
            <DashboardView
              cards={displayCards}
              loans={displayLoans}
              debts={displayDebts}
              onNavigateTab={setActiveTab}
              onToggleCardPaid={handleToggleCardPaid}
              onToggleLoanPaid={handleToggleLoanPaid}
              onToggleDebtPaid={handleToggleDebtPaid}
              onOpenAddModal={handleOpenAddModal}
              monthlyIncome={monthlyIncome}
              onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
              onOpenAdvisor={() => handleOpenAdvisor()}
              selectedMonthKey={selectedMonthKey}
            />
          )}

          {activeTab === 'cards' && (
            <CardsView
              cards={displayCards}
              onTogglePaid={handleToggleCardPaid}
              onOpenAddModal={() => {
                setEditingCard(null);
                setIsCardModalOpen(true);
              }}
              onEditCard={(c) => {
                setEditingCard(c);
                setIsCardModalOpen(true);
              }}
              onDeleteCard={handleDeleteCard}
              onOpenPartialPaymentModal={(c) => setPartialPaymentCard(c)}
              onOpenAdvisor={(targetId) => handleOpenAdvisor(targetId)}
              onOpenFuturePlans={(c) => {
                setFuturePlansCard(c);
                setIsFuturePlansModalOpen(true);
              }}
              currentSelectedMonthKey={selectedMonthKey}
            />
          )}

          {activeTab === 'loans' && (
            <LoansView
              loans={displayLoans}
              onTogglePaid={handleToggleLoanPaid}
              onOpenAddModal={() => {
                setEditingLoan(null);
                setIsLoanModalOpen(true);
              }}
              onEditLoan={(l) => {
                setEditingLoan(l);
                setIsLoanModalOpen(true);
              }}
              onDeleteLoan={handleDeleteLoan}
              onOpenAdvisor={(targetId) => handleOpenAdvisor(targetId)}
            />
          )}

          {activeTab === 'debts' && (
            <DebtsView
              debts={displayDebts}
              onTogglePaid={handleToggleDebtPaid}
              onOpenAddModal={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
              onEditDebt={(d) => {
                setEditingDebt(d);
                setIsDebtModalOpen(true);
              }}
              onDeleteDebt={handleDeleteDebt}
            />
          )}

          {activeTab === 'receivables' && (
            <ReceivablesView
              receivables={receivables}
              onOpenAddModal={() => {
                setEditingReceivable(null);
                setIsReceivableModalOpen(true);
              }}
              onEditReceivable={(r) => {
                setEditingReceivable(r);
                setIsReceivableModalOpen(true);
              }}
              onDeleteReceivable={handleDeleteReceivable}
              onOpenCollectionModal={(r) => {
                setCollectionReceivable(r);
                setIsCollectionModalOpen(true);
              }}
              onDeleteCollection={handleDeleteCollection}
            />
          )}
        </main>

        {/* Mobile Chrome 5-Section Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cardsCount={displayCards.length}
          loansCount={displayLoans.length}
          debtsCount={displayDebts.length}
          receivablesCount={receivables.filter(r => r.totalAmount > r.collections.reduce((s, c) => s + c.amount, 0)).length}
          unpaidTotalCount={totalUnpaidCount}
        />

        {/* Modals */}
        <MonthPickerModal
          isOpen={isMonthPickerOpen}
          onClose={() => setIsMonthPickerOpen(false)}
          selectedMonthKey={selectedMonthKey}
          onSelectMonth={(key) => setSelectedMonthKey(key)}
          scheduledMonths={scheduledMonths}
        />

        <CardModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          onSave={handleSaveCard}
          initialCard={editingCard}
          currentSelectedMonthKey={selectedMonthKey}
          onOpenFuturePlans={(card) => {
            setFuturePlansCard(card);
            setIsFuturePlansModalOpen(true);
          }}
        />

        <FutureInstallmentsModal
          isOpen={isFuturePlansModalOpen}
          onClose={() => {
            setIsFuturePlansModalOpen(false);
            setFuturePlansCard(null);
          }}
          card={futurePlansCard}
          currentSelectedMonthKey={selectedMonthKey}
          onSavePlans={handleSaveCardPlans}
          onNavigateToMonth={(key) => setSelectedMonthKey(key)}
        />

        <LoanModal
          isOpen={isLoanModalOpen}
          onClose={() => setIsLoanModalOpen(false)}
          onSave={handleSaveLoan}
          initialLoan={editingLoan}
        />

        <DebtModal
          isOpen={isDebtModalOpen}
          onClose={() => setIsDebtModalOpen(false)}
          onSave={handleSaveDebt}
          initialDebt={editingDebt}
        />

        <ReceivableModal
          isOpen={isReceivableModalOpen}
          onClose={() => setIsReceivableModalOpen(false)}
          onSave={handleSaveReceivable}
          initialReceivable={editingReceivable}
        />

        <CollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          receivable={collectionReceivable}
          onSaveCollection={handleAddCollection}
        />

        <IncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => setIsIncomeModalOpen(false)}
          monthlyIncome={monthlyIncome}
          onSaveIncome={(inc) => setMonthlyIncome(inc)}
        />

        <BackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          cards={cards}
          loans={loans}
          debts={debts}
          receivables={receivables}
          monthlyIncome={monthlyIncome}
          monthlyPayments={monthlyPayments}
          onRestoreData={handleRestoreData}
          onResetAllData={handleResetAllData}
        />

        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
        />

        <PartialPaymentModal
          isOpen={!!partialPaymentCard}
          onClose={() => setPartialPaymentCard(null)}
          card={partialPaymentCard}
          onSavePartialPayment={handleSavePartialPayment}
        />

        <PWAInstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

        <PaymentAdvisorModal
          isOpen={isAdvisorModalOpen}
          onClose={() => {
            setIsAdvisorModalOpen(false);
            setAdvisorTargetId(undefined);
          }}
          cards={displayCards}
          loans={displayLoans}
          debts={displayDebts}
          initialTargetId={advisorTargetId}
        />
      </div>
    </div>
  );
}
