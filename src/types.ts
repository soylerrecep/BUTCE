export type TabType = 'dashboard' | 'cards' | 'loans' | 'debts' | 'receivables';

export type CardTheme = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber' | 'slate' | 'indigo' | 'dark';

export interface CardMonthlyPlan {
  statementAmount: number;
  minimumPayment?: number;
  note?: string;
}

export interface CreditCard {
  id: string;
  bankName: string;
  cardName: string;
  last4Digits: string;
  cardColor: CardTheme;
  limit: number;
  statementDay: number; // 1-31 (Hesap kesim günü)
  dueDay: number; // 1-31 (Son ödeme günü)
  statementAmount: number; // Güncel Ekstre Borcu
  minimumPayment: number; // Asgari Ödeme Tutarı
  isPaidThisMonth: boolean;
  isPartialPaidThisMonth?: boolean;
  paidAmountThisMonth?: number;
  notes?: string;
  createdAt: string;
  monthlyPlans?: Record<string, CardMonthlyPlan>; // Gelecek aylar için girilmiş taksit ve ekstreler (örn: "2026-12" -> { statementAmount: 3500, note: "Telefon Taksiti" })
  startMonthKey?: string;
}

export interface Loan {
  id: string;
  bankName: string;
  loanName: string; // örn: İhtiyaç Kredisi, Konut Kredisi
  totalAmount: number; // Toplam Kredi Tutarı
  monthlyInstallment: number; // Aylık Taksit Tutarı
  remainingInstallments: number; // Kalan Taksit Sayısı
  totalInstallments: number; // Toplam Taksit Sayısı
  paymentDay: number; // Her ayın ödeme günü (1-31)
  isPaidThisMonth: boolean;
  notes?: string;
  createdAt: string;
}

export type DebtCategory = 'personal' | 'bill' | 'rent' | 'other';

export interface Debt {
  id: string;
  title: string; // Borç Tanımı (örn: Ahmet Bey Borç, Elektrik Faturası)
  creditor: string; // Alacaklı / Kurum
  category: DebtCategory;
  totalAmount: number; // Toplam Tutar
  monthlyAmount: number; // Bu Ayki Ödeme Tutarı
  dueDate: string; // Son Ödeme Tarihi (YYYY-MM-DD veya Gün)
  dueDay: number; // 1-31
  isPaidThisMonth: boolean;
  notes?: string;
  createdAt: string;
  // Taksit Seçenekleri
  isInstallment?: boolean; // Taksitli mi?
  totalInstallments?: number; // Toplam Taksit Sayısı
  remainingInstallments?: number; // Kalan Taksit Sayısı
}

export interface PaymentLog {
  id: string;
  itemId: string;
  itemType: 'card' | 'loan' | 'debt';
  title: string;
  amount: number;
  paidAt: string; // ISO date string
  monthYear: string; // "2026-08"
}

export interface AppSettings {
  monthlyIncome?: number;
  currency: string;
  theme: 'light' | 'dark';
  reminderDaysBefore: number;
}

export interface CollectionRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string;
}

export interface Receivable {
  id: string;
  debtorName: string; // Borçlu Kişi veya Kurum Adı
  title: string; // Alacak Açıklaması / Konusu
  totalAmount: number; // Toplam Alacak Tutarı
  dueDate?: string; // Vade / Beklenen Tarih (opsiyonel)
  phone?: string; // Telefon Numarası (opsiyonel)
  notes?: string; // Özel Notlar (opsiyonel)
  collections: CollectionRecord[]; // Parça parça yapılan tahsilatlar
  createdAt: string;
}
