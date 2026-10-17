import React, { useState, useRef } from 'react';
import { X, Download, FolderUp, FileCheck, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { CreditCard, Loan, Debt, Receivable } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  loans: Loan[];
  debts: Debt[];
  receivables?: Receivable[];
  monthlyIncome?: number;
  monthlyPayments?: Record<string, Record<string, any>>;
  onRestoreData: (data: {
    cards: CreditCard[];
    loans: Loan[];
    debts: Debt[];
    receivables?: Receivable[];
    monthlyIncome?: number;
    monthlyPayments?: Record<string, Record<string, any>>;
  }) => void;
  onResetAllData: () => void;
}

interface ParsedBackupData {
  cards?: CreditCard[];
  loans?: Loan[];
  debts?: Debt[];
  receivables?: Receivable[];
  monthlyIncome?: number;
  monthlyPayments?: Record<string, Record<string, any>>;
  exportedAt?: string;
  version?: number;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  cards,
  loans,
  debts,
  receivables = [],
  monthlyIncome,
  monthlyPayments,
  onRestoreData,
  onResetAllData
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedBackupData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const data = {
      version: 3,
      exportedAt: new Date().toISOString(),
      monthlyIncome,
      cards,
      loans,
      debts,
      receivables,
      monthlyPayments
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finans_takip_yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: 'success', text: 'Yedek JSON dosyası başarıyla indirildi!' });
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setMsg({ type: 'error', text: 'Lütfen geçerli bir .json uzantılı yedek dosyası seçin.' });
      setSelectedFile(null);
      setParsedData(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || !content.trim()) {
          throw new Error('Dosya içeriği boş.');
        }

        const parsed = JSON.parse(content);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Dosya içeriği geçerli bir JSON objesi değil.');
        }

        if (
          !Array.isArray(parsed.cards) &&
          !Array.isArray(parsed.loans) &&
          !Array.isArray(parsed.debts) &&
          !Array.isArray(parsed.receivables)
        ) {
          throw new Error('Yedek dosyasında geçerli finansal kayıt bulunamadı.');
        }

        setSelectedFile(file);
        setParsedData(parsed);
        setMsg({
          type: 'success',
          text: `"${file.name}" yüklendi ve doğrulandı! Yedeği içeri aktarmak için aşağıdaki butona tıklayın.`
        });
      } catch (err: any) {
        setSelectedFile(null);
        setParsedData(null);
        setMsg({ type: 'error', text: 'Dosya işlenemedi: ' + (err.message || 'Geçersiz dosya yapısı') });
      }
    };

    reader.onerror = () => {
      setMsg({ type: 'error', text: 'Dosya okunurken bir sistem hatası oluştu.' });
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleConfirmRestore = () => {
    if (!parsedData) return;

    onRestoreData({
      cards: Array.isArray(parsedData.cards) ? parsedData.cards : [],
      loans: Array.isArray(parsedData.loans) ? parsedData.loans : [],
      debts: Array.isArray(parsedData.debts) ? parsedData.debts : [],
      receivables: Array.isArray(parsedData.receivables) ? parsedData.receivables : undefined,
      monthlyIncome: parsedData.monthlyIncome,
      monthlyPayments: parsedData.monthlyPayments
    });

    setMsg({ type: 'success', text: 'Yedek başarıyla geri yüklendi ve tüm veriler güncellendi!' });
    setSelectedFile(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div id="backup-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="backup-modal-container" className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <FolderUp className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Veri Yedekleme & Geri Yükleme
            </h3>
          </div>
          <button
            id="backup-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message notification */}
        {msg && (
          <div
            id="backup-status-message"
            className={`p-3 rounded-2xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Export section */}
          <div id="backup-export-section" className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-500" />
              Tüm Verileri İndir (Yedek Al)
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mb-3">
              Kredi kartları, krediler, borçlar, alacaklar ve ödeme kayıtlarınızı tek bir .json dosyası olarak cihazınıza indirebilirsiniz.
            </p>
            <button
              id="backup-download-btn"
              onClick={handleExport}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              JSON Yedeğini İndir
            </button>
          </div>

          {/* Direct File Upload & Restore Section */}
          <div id="backup-import-section" className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FolderUp className="w-4 h-4 text-indigo-500" />
              Yedek Dosyasını Yükle (Geri Yükle)
            </h4>
            <p className="text-slate-500 dark:text-slate-400">
              Yedek dosyanızı doğrudan seçin veya bu alana sürükleyip bırakın:
            </p>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              id="backup-file-input"
              type="file"
              accept=".json,application/json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Drag & Drop / Click Zone */}
            {!selectedFile ? (
              <div
                id="backup-dropzone"
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/80'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FolderUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    Yedek dosyasını buraya sürükleyin
                  </span>
                  <span className="text-[11px] text-slate-400">
                    veya dosya seçmek için <span className="text-indigo-500 underline font-semibold">göz atın</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">
                  Yalnızca .json dosyaları
                </span>
              </div>
            ) : (
              /* Selected File Details & Preview */
              <div id="backup-file-preview-card" className="border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatFileSize(selectedFile.size)}
                        {parsedData?.exportedAt && ` • ${new Date(parsedData.exportedAt).toLocaleDateString('tr-TR')}`}
                      </p>
                    </div>
                  </div>
                  <button
                    id="backup-clear-file-btn"
                    onClick={handleClearSelectedFile}
                    title="Dosyayı Değiştir / Kaldır"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Parsed summary badges */}
                {parsedData && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-indigo-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400">Kredi Kartı</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                        {parsedData.cards?.length || 0} Adet
                      </span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-indigo-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400">Kredi</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                        {parsedData.loans?.length || 0} Adet
                      </span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-indigo-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400">Borç</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                        {parsedData.debts?.length || 0} Adet
                      </span>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-indigo-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400">Alacak</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                        {parsedData.receivables?.length || 0} Adet
                      </span>
                    </div>
                  </div>
                )}

                <button
                  id="backup-apply-restore-btn"
                  onClick={handleConfirmRestore}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  Yedeği Geri Yükle ve Uygula
                </button>
              </div>
            )}
          </div>

          {/* Reset all data option */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              id="backup-reset-all-btn"
              onClick={() => {
                onResetAllData();
                onClose();
              }}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition text-center"
            >
              Fabrika Ayarlarına Sıfırla (Tüm Verileri Sil)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
