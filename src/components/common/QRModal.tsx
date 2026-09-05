import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import { Equipment } from '../../types';

interface QRModalProps {
  equipment: Equipment | null;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ equipment, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (equipment) {
      const verifyUrl = `${window.location.origin}?verify=${equipment.code}`;
      QRCode.toDataURL(verifyUrl, { width: 300, margin: 2 }, (err, url) => {
        if (!err && url) {
          setQrUrl(url);
        }
      });
    }
  }, [equipment]);

  if (!equipment) return null;

  const verifyUrl = `${window.location.origin}?verify=${equipment.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR_${equipment.code}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative space-y-4">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <QrIcon className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Inventar QR Kodi
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold mt-1">
            {equipment.code}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {equipment.name} ({equipment.typeName})
          </p>
        </div>

        {/* QR Code Image */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner inline-block">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR Code ${equipment.code}`} className="w-48 h-48 mx-auto" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
              QR yaratilmoqda...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleCopy}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Nusxalandi' : 'Havola nusxalash'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Yuklab olish</span>
          </button>
        </div>

      </div>
    </div>
  );
};
