import { CreditCard, Loan, Debt } from '../types';

export interface AdvisorTarget {
  id: string;
  type: 'loan' | 'card' | 'debt';
  title: string;
  subtitle?: string;
  requiredAmount: number;
  dueDay: number;
  remainingInstallments?: number;
  totalInstallments?: number;
  bankName?: string;
  isPaid: boolean;
}

export interface SourceCardInfo {
  id: string;
  bankName: string;
  cardName: string;
  statementAmount: number;
  minimumPayment: number;
  freedCash: number; // statementAmount - minimumPayment
  cardColor: string;
  dueDay: number;
}

export interface PaymentRecommendation {
  id: string;
  type: 'single-card' | 'multi-card' | 'multi-target';
  priority: 'high' | 'medium' | 'normal';
  title: string;
  description: string;
  sourceCards: SourceCardInfo[];
  totalMinimumPayment: number;
  totalFreedCash: number;
  targets: AdvisorTarget[];
  totalRequiredAmount: number;
  extraCashLeft: number; // totalFreedCash - totalRequiredAmount
  savingsPercentage: number;
  financialTip: string;
}

/**
 * Calculates effective unpaid amounts for credit cards, considering partial payments.
 */
export function getCardUnpaidDetails(card: CreditCard): {
  remStatement: number;
  remMin: number;
  freedCash: number;
} {
  const paid = card.isPartialPaidThisMonth
    ? (card.paidAmountThisMonth || 0)
    : (card.isPaidThisMonth ? card.statementAmount : 0);

  const remStatement = Math.max(0, (card.statementAmount || 0) - paid);
  const remMin = Math.max(0, (card.minimumPayment || 0) - paid);
  const freedCash = Math.max(0, remStatement - remMin);

  return { remStatement, remMin, freedCash };
}

/**
 * Extract active unpaid targets from loans, other cards, and debts.
 */
export function getAvailableTargets(
  cards: CreditCard[],
  loans: Loan[],
  debts: Debt[],
  excludeCardIds: string[] = []
): AdvisorTarget[] {
  const targets: AdvisorTarget[] = [];

  // 1. Unpaid Loans (High priority)
  loans.forEach(l => {
    if (!l.isPaidThisMonth && l.monthlyInstallment > 0) {
      targets.push({
        id: l.id,
        type: 'loan',
        title: `${l.bankName} - ${l.loanName}`,
        subtitle: `${l.remainingInstallments}/${l.totalInstallments} taksit kaldı`,
        requiredAmount: l.monthlyInstallment,
        dueDay: l.paymentDay,
        remainingInstallments: l.remainingInstallments,
        totalInstallments: l.totalInstallments,
        bankName: l.bankName,
        isPaid: false
      });
    }
  });

  // 2. Unpaid Credit Cards (Full statement payoff)
  cards.forEach(c => {
    if (excludeCardIds.includes(c.id)) return;
    const { remStatement } = getCardUnpaidDetails(c);
    if (!c.isPaidThisMonth && remStatement > 0) {
      targets.push({
        id: c.id,
        type: 'card',
        title: `${c.bankName} - ${c.cardName}`,
        subtitle: `Asgari: ${c.minimumPayment.toLocaleString('tr-TR')} ₺`,
        requiredAmount: remStatement,
        dueDay: c.dueDay,
        bankName: c.bankName,
        isPaid: false
      });
    }
  });

  // 3. Unpaid Debts & Bills
  debts.forEach(d => {
    if (!d.isPaidThisMonth && d.monthlyAmount > 0) {
      targets.push({
        id: d.id,
        type: 'debt',
        title: d.title,
        subtitle: d.creditor ? `Alacaklı: ${d.creditor}` : 'Aylık Borç',
        requiredAmount: d.monthlyAmount,
        dueDay: d.dueDay,
        remainingInstallments: d.remainingInstallments,
        totalInstallments: d.totalInstallments,
        isPaid: false
      });
    }
  });

  return targets;
}

/**
 * Generates all valid recommendations where paying minimum on one or more cards
 * frees up enough cash to completely pay off another card or loan installment.
 */
export function generateRecommendations(
  cards: CreditCard[],
  loans: Loan[],
  debts: Debt[]
): PaymentRecommendation[] {
  const recommendations: PaymentRecommendation[] = [];

  // Filter cards with positive freed cash (where statement > minimum and not fully paid)
  const candidateCards: SourceCardInfo[] = [];

  cards.forEach(c => {
    if (c.isPaidThisMonth && !c.isPartialPaidThisMonth) return;
    const { remStatement, remMin, freedCash } = getCardUnpaidDetails(c);
    if (freedCash > 0 && remMin > 0) {
      candidateCards.push({
        id: c.id,
        bankName: c.bankName,
        cardName: c.cardName,
        statementAmount: remStatement,
        minimumPayment: remMin,
        freedCash,
        cardColor: c.cardColor,
        dueDay: c.dueDay
      });
    }
  });

  if (candidateCards.length === 0) {
    return recommendations;
  }

  // A. Single Card -> Single Target Recommendations
  candidateCards.forEach(sc => {
    // Targets excluding the source card itself
    const targets = getAvailableTargets(cards, loans, debts, [sc.id]);

    targets.forEach(target => {
      if (sc.freedCash >= target.requiredAmount) {
        const extraCashLeft = sc.freedCash - target.requiredAmount;
        const savingsRatio = Math.round((sc.freedCash / sc.statementAmount) * 100);

        let priority: 'high' | 'medium' | 'normal' = 'normal';
        let tip = '';

        if (target.type === 'loan') {
          priority = 'high';
          tip = `${sc.bankName} kartının asgarisini yatırarak banka kredi taksitini gecikmeye düşmeden %100 kapatabilir, kredi notunuzu koruyabilirsiniz.`;
        } else if (target.type === 'card') {
          priority = 'medium';
          tip = `${target.title} kartının tüm ekstresi sıfırlanacağı için bu kartta sonraki aya hiçbir faiz kalmaz.`;
        } else {
          priority = 'normal';
          tip = `${target.title} borcu tamamen kapatılırken cebinizde ${extraCashLeft.toLocaleString('tr-TR')} ₺ nakit kalmaya devam eder.`;
        }

        recommendations.push({
          id: `rec-single-${sc.id}-${target.id}`,
          type: 'single-card',
          priority,
          title: `${sc.cardName} Asgarisiyle ➔ ${target.title} %100 Kapanır`,
          description: `${sc.bankName} (${sc.cardName}) kartının ekstre borcu (${sc.statementAmount.toLocaleString('tr-TR')} ₺) yerine yalnızca asgarisini (${sc.minimumPayment.toLocaleString('tr-TR')} ₺) ödeyerek açığa çıkan ${sc.freedCash.toLocaleString('tr-TR')} ₺ likidite ile ${target.title} (${target.requiredAmount.toLocaleString('tr-TR')} ₺) borcunu tamamen kapatabilirsiniz.`,
          sourceCards: [sc],
          totalMinimumPayment: sc.minimumPayment,
          totalFreedCash: sc.freedCash,
          targets: [target],
          totalRequiredAmount: target.requiredAmount,
          extraCashLeft,
          savingsPercentage: savingsRatio,
          financialTip: tip
        });
      }
    });
  });

  // B. Single Card -> Multiple Targets (Double/Triple Coverage)
  candidateCards.forEach(sc => {
    const targets = getAvailableTargets(cards, loans, debts, [sc.id]);
    if (targets.length >= 2) {
      for (let i = 0; i < targets.length; i++) {
        for (let j = i + 1; j < targets.length; j++) {
          const combinedRequired = targets[i].requiredAmount + targets[j].requiredAmount;
          if (sc.freedCash >= combinedRequired) {
            const extraCashLeft = sc.freedCash - combinedRequired;
            recommendations.push({
              id: `rec-multitarget-${sc.id}-${targets[i].id}-${targets[j].id}`,
              type: 'multi-target',
              priority: 'high',
              title: `Çifte Kazanç: ${sc.cardName} ➔ 2 Borcu Birden Sıfırlar`,
              description: `${sc.bankName} kartından elde edilen ${sc.freedCash.toLocaleString('tr-TR')} ₺ nakit ile hem ${targets[i].title} hem de ${targets[j].title} borcunu aynı anda tamamen ödeyebilirsiniz!`,
              sourceCards: [sc],
              totalMinimumPayment: sc.minimumPayment,
              totalFreedCash: sc.freedCash,
              targets: [targets[i], targets[j]],
              totalRequiredAmount: combinedRequired,
              extraCashLeft,
              savingsPercentage: Math.round((sc.freedCash / sc.statementAmount) * 100),
              financialTip: `Tek kartın asgari ödemesiyle iki farklı ödemeyi tamamen kapatarak nakit akışınızı rahatlatın.`
            });
          }
        }
      }
    }
  });

  // C. Multi-Card Combinations (2 Cards together) -> Target
  if (candidateCards.length >= 2) {
    for (let i = 0; i < candidateCards.length; i++) {
      for (let j = i + 1; j < candidateCards.length; j++) {
        const c1 = candidateCards[i];
        const c2 = candidateCards[j];
        const combinedFreed = c1.freedCash + c2.freedCash;
        const combinedMin = c1.minimumPayment + c2.minimumPayment;

        const targets = getAvailableTargets(cards, loans, debts, [c1.id, c2.id]);

        targets.forEach(target => {
          const c1CoversAlone = c1.freedCash >= target.requiredAmount;
          const c2CoversAlone = c2.freedCash >= target.requiredAmount;

          if (!c1CoversAlone && !c2CoversAlone && combinedFreed >= target.requiredAmount) {
            const extraCashLeft = combinedFreed - target.requiredAmount;
            recommendations.push({
              id: `rec-pair-${c1.id}-${c2.id}-${target.id}`,
              type: 'multi-card',
              priority: target.type === 'loan' ? 'high' : 'medium',
              title: `${c1.cardName} + ${c2.cardName} ➔ ${target.title} Tamamen Kapanır`,
              description: `${c1.bankName} ve ${c2.bankName} kartlarınızın asgarilerini (${combinedMin.toLocaleString('tr-TR')} ₺) ödediğinizde toplam ${combinedFreed.toLocaleString('tr-TR')} ₺ nakit serbest kalır. Bu sayede ${target.title} (${target.requiredAmount.toLocaleString('tr-TR')} ₺) tamamen kapatılabilir.`,
              sourceCards: [c1, c2],
              totalMinimumPayment: combinedMin,
              totalFreedCash: combinedFreed,
              targets: [target],
              totalRequiredAmount: target.requiredAmount,
              extraCashLeft,
              savingsPercentage: Math.round((combinedFreed / (c1.statementAmount + c2.statementAmount)) * 100),
              financialTip: `Yüksek taksitli bu yükümlülüğü iki kartın asgari gücünü birleştirerek kapatabilirsiniz.`
            });
          }
        });
      }
    }
  }

  // Deduplicate and Sort
  return recommendations.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, normal: 1 };
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    const aHasLoan = a.targets.some(t => t.type === 'loan');
    const bHasLoan = b.targets.some(t => t.type === 'loan');
    if (aHasLoan !== bHasLoan) return aHasLoan ? -1 : 1;

    return b.extraCashLeft - a.extraCashLeft;
  });
}

/**
 * Search recommendations for a specific chosen target
 */
export function findAdvisorPlansForTarget(
  targetId: string,
  targetType: 'loan' | 'card' | 'debt',
  cards: CreditCard[],
  loans: Loan[],
  debts: Debt[]
): PaymentRecommendation[] {
  const all = generateRecommendations(cards, loans, debts);
  return all.filter(r => r.targets.some(t => t.id === targetId && t.type === targetType));
}

/**
 * Simulate custom selection: user chooses arbitrary cards to pay minimum on,
 * returns total freed cash and which targets become 100% payable.
 */
export function simulateFreedCash(
  selectedCardIds: string[],
  cards: CreditCard[],
  loans: Loan[],
  debts: Debt[]
) {
  let totalMin = 0;
  let totalStatement = 0;
  let totalFreed = 0;

  const selectedCards: SourceCardInfo[] = [];

  cards.forEach(c => {
    if (selectedCardIds.includes(c.id)) {
      const { remStatement, remMin, freedCash } = getCardUnpaidDetails(c);
      totalMin += remMin;
      totalStatement += remStatement;
      totalFreed += freedCash;
      selectedCards.push({
        id: c.id,
        bankName: c.bankName,
        cardName: c.cardName,
        statementAmount: remStatement,
        minimumPayment: remMin,
        freedCash,
        cardColor: c.cardColor,
        dueDay: c.dueDay
      });
    }
  });

  const allTargets = getAvailableTargets(cards, loans, debts, selectedCardIds);

  const payableTargets: { target: AdvisorTarget; extraCash: number }[] = [];
  const unpayableTargets: { target: AdvisorTarget; deficit: number }[] = [];

  allTargets.forEach(target => {
    if (totalFreed >= target.requiredAmount) {
      payableTargets.push({
        target,
        extraCash: totalFreed - target.requiredAmount
      });
    } else {
      unpayableTargets.push({
        target,
        deficit: target.requiredAmount - totalFreed
      });
    }
  });

  payableTargets.sort((a, b) => b.target.requiredAmount - a.target.requiredAmount);
  unpayableTargets.sort((a, b) => a.deficit - b.deficit);

  return {
    selectedCards,
    totalMin,
    totalStatement,
    totalFreed,
    payableTargets,
    unpayableTargets
  };
}
