import { CreditCard, Loan, Debt, Receivable } from '../types';

export const INITIAL_CARDS: CreditCard[] = [
  {
    id: 'card-1',
    bankName: 'Garanti BBVA',
    cardName: 'Bonus Platinum',
    last4Digits: '4821',
    cardColor: 'emerald',
    limit: 120000,
    statementDay: 15,
    dueDay: 25,
    statementAmount: 18450,
    minimumPayment: 3690,
    isPaidThisMonth: false,
    notes: 'Online alışveriş ve taksitli harcamalar',
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-2',
    bankName: 'Yapı Kredi',
    cardName: 'Worldcard',
    last4Digits: '9012',
    cardColor: 'purple',
    limit: 85000,
    statementDay: 5,
    dueDay: 15,
    statementAmount: 8700,
    minimumPayment: 1740,
    isPaidThisMonth: true,
    notes: 'Market ve benzin ödemeleri',
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-3',
    bankName: 'İş Bankası',
    cardName: 'Maximum',
    last4Digits: '3341',
    cardColor: 'blue',
    limit: 150000,
    statementDay: 20,
    dueDay: 30,
    statementAmount: 24300,
    minimumPayment: 4860,
    isPaidThisMonth: false,
    notes: 'Elektronik ve seyahat',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan-1',
    bankName: 'Akbank',
    loanName: 'İhtiyaç Kredisi',
    totalAmount: 150000,
    monthlyInstallment: 7850,
    remainingInstallments: 14,
    totalInstallments: 24,
    paymentDay: 12,
    isPaidThisMonth: false,
    notes: 'Ev tadilatı kredisi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'loan-2',
    bankName: 'Ziraat Bankası',
    loanName: 'Taşıt Kredisi',
    totalAmount: 400000,
    monthlyInstallment: 18400,
    remainingInstallments: 28,
    totalInstallments: 36,
    paymentDay: 20,
    isPaidThisMonth: true,
    notes: 'Araba taksidi',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    title: 'Ev Kirası',
    creditor: 'Ev Sahibi (Mehmet Bey)',
    category: 'rent',
    totalAmount: 22000,
    monthlyAmount: 22000,
    dueDate: '2026-08-01',
    dueDay: 1,
    isPaidThisMonth: true,
    notes: 'Her ayın 1\'inde İBAN\'a transfer',
    createdAt: new Date().toISOString()
  },
  {
    id: 'debt-2',
    title: 'Elektrik & Doğalgaz Faturası',
    creditor: 'Enerjisa / İGDAŞ',
    category: 'bill',
    totalAmount: 2450,
    monthlyAmount: 2450,
    dueDate: '2026-08-18',
    dueDay: 18,
    isPaidThisMonth: false,
    notes: 'Otomatik ödeme talimatı yok',
    createdAt: new Date().toISOString()
  },
  {
    id: 'debt-3',
    title: 'Şahıs Borcu (Ahmet Bey)',
    creditor: 'Ahmet Yılmaz',
    category: 'personal',
    totalAmount: 15000,
    monthlyAmount: 5000,
    dueDate: '2026-08-28',
    dueDay: 28,
    isPaidThisMonth: false,
    notes: 'Borç kapatma 3. taksit',
    createdAt: new Date().toISOString(),
    isInstallment: true,
    totalInstallments: 3,
    remainingInstallments: 2
  }
];

export const INITIAL_RECEIVABLES: Receivable[] = [
  {
    id: 'rec-1',
    debtorName: 'Kerem Öztürk',
    title: 'Elden Borç Verildi',
    totalAmount: 30000,
    dueDate: '2026-10-15',
    phone: '0555 123 4567',
    notes: '3 taksit halinde ödeme sözü verdi',
    collections: [
      {
        id: 'col-1',
        amount: 10000,
        date: '2026-08-10',
        note: '1. taksit banka havalesiyle alındı',
        createdAt: new Date().toISOString()
      },
      {
        id: 'col-2',
        amount: 10000,
        date: '2026-09-05',
        note: '2. taksit elden nakit teslim alındı',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'rec-2',
    debtorName: 'Ayşe Demir',
    title: 'Bilgisayar Satış Bedeli',
    totalAmount: 18500,
    dueDate: '2026-09-25',
    phone: '0542 987 6543',
    notes: 'Kalan tutarı ay sonunda kapatacak',
    collections: [
      {
        id: 'col-3',
        amount: 8500,
        date: '2026-08-20',
        note: 'Peşinat alındı',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

