import React from 'react';
import { AlertTriangle, Trash2, RefreshCw, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Evet, Sil',
  cancelText = 'Vazgeç',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <RefreshCw className="w-6 h-6 text-amber-500 animate-spin-slow" />,
          iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
          confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
        };
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
          iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
          confirmBtn: 'bg-blue-600 hover:bg-blue-500 text-white font-black',
        };
      case 'danger':
      default:
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-500" />,
          iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white font-black',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3.5">
          <div className={`p-3 rounded-2xl ${style.iconBg} shrink-0`}>
            {style.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {message}
            </p>
          </div>
        </div>

        <div className="pt-2 flex space-x-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`w-1/2 py-2.5 rounded-xl ${style.confirmBtn} shadow-lg transition active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
