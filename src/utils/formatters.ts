import { CreditCard, Loan, Debt } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('tr-TR').format(val);
};

export const getDaysRemaining = (dueDay: number): { days: number; status: 'overdue' | 'today' | 'soon' | 'normal' } => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Target date in current month
  let targetDate = new Date(currentYear, currentMonth, dueDay);
  
  // If target day has passed in current month and it's not paid yet, calculate difference
  const diffTime = targetDate.getTime() - new Date(currentYear, currentMonth, currentDay).getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, status: 'overdue' };
  } else if (diffDays === 0) {
    return { days: 0, status: 'today' };
  } else if (diffDays <= 3) {
    return { days: diffDays, status: 'soon' };
  } else {
    return { days: diffDays, status: 'normal' };
  }
};

export const getDueDateLabel = (dueDay: number, isPaid: boolean): { text: string; colorClass: string; badgeBg: string } => {
  if (isPaid) {
    return {
      text: 'Ödendi',
      colorClass: 'text-emerald-700 dark:text-emerald-400 font-semibold',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    };
  }

  const { days, status } = getDaysRemaining(dueDay);

  switch (status) {
    case 'overdue':
      return {
        text: `${Math.abs(days)} gün gecikti!`,
        colorClass: 'text-rose-600 dark:text-rose-400 font-bold',
        badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
      };
    case 'today':
      return {
        text: 'Bugün son gün!',
        colorClass: 'text-amber-600 dark:text-amber-400 font-bold',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      };
    case 'soon':
      return {
        text: `${days} gün kaldı`,
        colorClass: 'text-amber-600 dark:text-amber-400 font-medium',
        badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      };
    default:
      return {
        text: `${days} gün kaldı (${dueDay}. gün)`,
        colorClass: 'text-slate-600 dark:text-slate-400',
        badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      };
  }
};

export const getMonthNameAndYear = (monthKey: string): string => {
  if (!monthKey || !monthKey.includes('-')) return 'Ağustos 2026';
  const [yearStr, monthStr] = monthKey.split('-');
  const monthNum = parseInt(monthStr, 10);
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const name = monthNames[(monthNum - 1) % 12] || 'Ağustos';
  return `${name} ${yearStr}`;
};

export const getPrevMonthKey = (monthKey: string): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) - 1;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  return `${y}-${m.toString().padStart(2, '0')}`;
};

export const getNextMonthKey = (monthKey: string): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}-${m.toString().padStart(2, '0')}`;
};

export const getMonthDiff = (baseMonthKey: string, targetMonthKey: string): number => {
  const [bY, bM] = baseMonthKey.split('-').map(Number);
  const [tY, tM] = targetMonthKey.split('-').map(Number);
  return (tY - bY) * 12 + (tM - bM);
};

export const getMonthsBetween = (startKey: string, endKey: string): string[] => {
  if (startKey === endKey) return [startKey];
  const diff = getMonthDiff(startKey, endKey);
  if (diff <= 0) return [startKey];
  
  const result: string[] = [startKey];
  let curr = startKey;
  while (curr !== endKey && getMonthDiff(curr, endKey) > 0) {
    curr = getNextMonthKey(curr);
    result.push(curr);
  }
  return result;
};

export const getCardColorStyle = (theme: string) => {
  switch (theme) {
    case 'emerald':
      return 'from-emerald-700 via-teal-800 to-emerald-950 text-white shadow-emerald-900/20';
    case 'purple':
      return 'from-purple-800 via-indigo-900 to-slate-950 text-white shadow-purple-900/20';
    case 'blue':
      return 'from-blue-700 via-cyan-900 to-slate-950 text-white shadow-blue-900/20';
    case 'rose':
      return 'from-rose-700 via-pink-900 to-slate-950 text-white shadow-rose-900/20';
    case 'amber':
      return 'from-amber-600 via-orange-800 to-slate-950 text-white shadow-amber-900/20';
    case 'indigo':
      return 'from-indigo-700 via-blue-900 to-slate-950 text-white shadow-indigo-900/20';
    case 'dark':
      return 'from-slate-800 via-slate-900 to-black text-white shadow-slate-900/20';
    case 'slate':
    default:
      return 'from-slate-700 via-gray-800 to-slate-900 text-white shadow-slate-900/20';
  }
};
