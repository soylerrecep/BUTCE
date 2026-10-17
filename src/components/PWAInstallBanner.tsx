import React, { useState } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('finans_pwa_banner_dismissed') === 'true';
  });

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('finans_pwa_banner_dismissed', 'true');
  };

  const handleAction = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) return;
    }
    onOpenModal();
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/40 px-3 py-2 text-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        <div 
          onClick={handleAction} 
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
        >
          <img
            src="/pwa-192x192.png"
            alt="PWA Icon"
            className="w-8 h-8 rounded-lg shadow-sm border border-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition flex items-center gap-1.5">
              <span>Telefona Yükle</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Chrome ile ana ekrana ekleyin, internetsiz hızlıca kullanın
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleAction}
            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Yükle</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
