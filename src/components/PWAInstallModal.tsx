import React from 'react';
import { X, Smartphone, ArrowDownToLine, CheckCircle2, Share, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-base">Telefona Yükle (PWA)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon & App Info */}
        <div className="flex flex-col items-center text-center my-3">
          <div className="relative mb-3">
            <img
              src="/pwa-192x192.png"
              alt="Bütçe & Borç Takip"
              className="w-20 h-20 rounded-2xl shadow-lg ring-4 ring-emerald-500/20 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
              PWA
            </span>
          </div>

          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Kredi &amp; Borç Takip
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
            Telefonunuzun ana ekranından tıpkı mağaza uygulamaları gibi tam ekran ve internetsiz hızlıca kullanın.
          </p>
        </div>

        {/* Features / Benefits */}
        <div className="my-4 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Tarayıcı çubuğu olmadan tam ekran deneyim</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Çevrimdışı (offline) çalışma &amp; anında açılış</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Verileriniz güvenle telefonunuzda saklanır</span>
          </div>
        </div>

        {/* Action / Instructions depending on environment */}
        {isInstalled ? (
          <div className="text-center py-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            ✓ Uygulama cihazınızda zaten yüklü ve çalışıyor!
          </div>
        ) : isInstallable ? (
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowDownToLine className="w-5 h-5 stroke-[2.5]" />
              <span>Hemen Yükle</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Chrome yükleme onay penceresini açacaktır.
            </p>
          </div>
        ) : isIOS ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2 text-left">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Share className="w-4 h-4" />
              <span>iPhone / iPad Safari için Kurulum:</span>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal pl-4">
              <li>
                Safari altındaki <strong>Paylaş (Share)</strong> simgesine dokunun.
              </li>
              <li>
                Açılan menüde aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> butonunu seçin.
              </li>
            </ol>
          </div>
        ) : (
          /* Chrome on Android Manual Guide (when beforeinstallprompt is not directly fired yet or in standard mobile Chrome) */
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-2.5 text-left">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <MoreVertical className="w-4 h-4" />
              <span>Chrome Üzerinden Yükleme Adımları:</span>
            </div>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal pl-4">
              <li>
                Chrome sağ üstündeki <strong>üç nokta (⋮)</strong> menüsüne dokunun.
              </li>
              <li>
                Menüden <strong>"Uygulamayı yükle"</strong> veya <strong>"Ana ekrana ekle"</strong> seçeneğini seçin.
              </li>
            </ol>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
