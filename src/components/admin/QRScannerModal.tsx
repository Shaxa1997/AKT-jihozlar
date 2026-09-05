import React, { useState } from 'react';
import { QrCode, Search, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getEquipmentByCode } from '../../services/db';
import { Equipment } from '../../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipment: (equipment: Equipment) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectEquipment
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Equipment | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setNotFound(false);
    setResult(null);

    const eq = await getEquipmentByCode(code.trim().toUpperCase());
    if (eq) {
      setResult(eq);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                QR / Inventar Skanerlash
              </h3>
              <p className="text-xs text-slate-400">
                Jihoz kodi orqali autentifikatsiya
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masalan: JHZ-2026-000001"
              className="w-full pl-9 pr-24 py-2.5 text-xs font-mono font-bold uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors"
            >
              {loading ? "..." : "Tekshirish"}
            </button>
          </div>
        </form>

        {/* Result Card */}
        {result && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Haqiqiy (Verified)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {result.code}
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {result.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Biriktirilgan: <b>{result.currentUserName}</b> ({result.departmentName || 'Bo\'lim'})
              </div>
            </div>

            <button
              onClick={() => {
                onSelectEquipment(result);
                onClose();
              }}
              className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20"
            >
              Batafsil Pasportni Ochish →
            </button>
          </div>
        )}

        {notFound && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>Bunday kodli jihoz bazada topilmadi. Kodni qayta tekshiring!</span>
          </div>
        )}

      </div>
    </div>
  );
};
