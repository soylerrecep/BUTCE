import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarPlus,
  Clock,
  ExternalLink,
  Repeat,
  CreditCard as CardIcon,
  Landmark,
  ReceiptText
} from 'lucide-react';
import {
  CalendarPaymentEvent,
  getClampedDueDate,
  buildGoogleCalendarUrl
} from '../utils/calendarExport';
import { formatCurrency, getMonthNameAndYear } from '../utils/formatters';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarPaymentEvent[];
  monthKey: string;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  events,
  monthKey
}) => {
  const [alarmHour, setAlarmHour] = useState<number>(9);
  const [repeatMonthly, setRepeatMonthly] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRepeatMonthly(false);
    }
  }, [isOpen, events]);

  if (!isOpen || events.length === 0) return null;

  const isSingle = events.length === 1;

  const getTypeIcon = (type: CalendarPaymentEvent['type']) => {
    switch (type) {
      case 'card':
        return <CardIcon className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'loan':
        return <Landmark className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'debt':
        return <ReceiptText className="w-4 h-4 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Google Takvim&apos;e Ekle
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {getMonthNameAndYear(monthKey)} • Ödeme hatırlatıcısı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Alarm Hour */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Hatırlatma Saati</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { hour: 9, label: '09:00' },
                { hour: 12, label: '12:00' },
                { hour: 15, label: '15:00' },
                { hour: 18, label: '18:00' }
              ].map(opt => (
                <button
                  key={opt.hour}
                  type="button"
                  onClick={() => setAlarmHour(opt.hour)}
                  className={`py-2 rounded-xl border font-bold text-xs transition ${
                    alarmHour === opt.hour
                      ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Recurrence Toggle */}
          <button
            type="button"
            onClick={() => setRepeatMonthly(prev => !prev)}
            className={`w-full p-3 rounded-2xl border flex items-center justify-between transition ${
              repeatMonthly
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              <Repeat className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white">
                  Her Ay Otomatik Tekrarla
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Sabit kredi taksiti ve kira gibi aylık ödemeler için uygundur
                </span>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                repeatMonthly ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  repeatMonthly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Single Payment View vs Multiple Payments List */}
          {isSingle ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {getTypeIcon(events[0].type)}
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {events[0].title}
                    </span>
                  </div>
                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                    {formatCurrency(events[0].amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/70 dark:border-slate-700/60">
                  <span>Son Ödeme Tarihi:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {getClampedDueDate(events[0].monthKey, events[0].dueDay).formattedTR}
                  </span>
                </div>
              </div>

              <a
                href={buildGoogleCalendarUrl(events[0], alarmHour, repeatMonthly)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
              >
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                <span>Google Takvim&apos;e Ekle</span>
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Ödemeler ({events.length})
                </span>
                <span className="text-[10px] text-slate-400">
                  Eklemek istediğiniz ödemeye dokunun
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {events.map(ev => {
                  const key = `${ev.type}-${ev.id}`;
                  const dateInfo = getClampedDueDate(ev.monthKey, ev.dueDay);
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                        ev.isPaid
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-65'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getTypeIcon(ev.type)}
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {ev.title}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            {dateInfo.formattedTR} • <strong>{formatCurrency(ev.amount)}</strong>
                            {ev.isPaid ? ' • Ödendi' : ''}
                          </span>
                        </div>
                      </div>

                      <a
                        href={buildGoogleCalendarUrl(ev, alarmHour, repeatMonthly)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 transition active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Google Takvim</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
