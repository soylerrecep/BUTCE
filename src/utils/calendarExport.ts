import { formatCurrency, getMonthNameAndYear } from './formatters';

export interface CalendarPaymentEvent {
  id: string;
  type: 'card' | 'loan' | 'debt';
  title: string;
  amount: number;
  dueDay: number;
  monthKey: string; // e.g. "2026-11"
  description?: string;
  isPaid?: boolean;
}

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const getClampedDueDate = (monthKey: string, dueDay: number) => {
  const [yStr, mStr] = (monthKey || '2026-08').split('-');
  const year = parseInt(yStr, 10) || new Date().getFullYear();
  const month = Math.min(12, Math.max(1, parseInt(mStr, 10) || (new Date().getMonth() + 1)));
  const maxDay = new Date(year, month, 0).getDate();
  const day = Math.min(maxDay, Math.max(1, Math.round(dueDay) || 1));

  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    year,
    month,
    day,
    ymd: `${year}${pad(month)}${pad(day)}`,
    formattedTR: `${day} ${MONTH_NAMES_TR[month - 1]} ${year}`
  };
};

const getTypeLabelTR = (type: CalendarPaymentEvent['type']): string => {
  switch (type) {
    case 'card':
      return 'Kredi Kartı Ekstresi';
    case 'loan':
      return 'Banka Kredisi Taksiti';
    case 'debt':
      return 'Borç / Fatura Ödemesi';
  }
};

export const buildGoogleCalendarUrl = (
  ev: CalendarPaymentEvent,
  alarmHour: number,
  repeatMonthly: boolean = false
): string => {
  const { ymd, formattedTR } = getClampedDueDate(ev.monthKey, ev.dueDay);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const hh = pad(Math.min(23, Math.max(0, alarmHour)));
  const start = `${ymd}T${hh}0000`;
  const end = `${ymd}T${hh}3000`;
  const text = `Ödeme: ${ev.title} (${formatCurrency(ev.amount)})`;
  const details = [
    `Tür: ${getTypeLabelTR(ev.type)}`,
    `Tutar: ${formatCurrency(ev.amount)}`,
    `Son Ödeme Tarihi: ${formattedTR}`,
    `Dönem: ${getMonthNameAndYear(ev.monthKey)}`,
    ev.description ? `Detay: ${ev.description}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text,
    dates: `${start}/${end}`,
    details
  });

  if (repeatMonthly) {
    params.set('recur', 'RRULE:FREQ=MONTHLY');
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
