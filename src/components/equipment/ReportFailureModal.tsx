import React, { useState } from 'react';
import { X, AlertTriangle, Upload, Check, Camera, Trash2 } from 'lucide-react';
import { Equipment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reportEquipmentFailure } from '../../services/db';
import { compressImage } from '../../utils/imageCompressor';

interface ReportFailureModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportFailureModal: React.FC<ReportFailureModalProps> = ({
  equipment,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [failureReasonSelect, setFailureReasonSelect] = useState('Elektron nosozlik');
  const [customReason, setCustomReason] = useState('');
  const [failureType, setFailureType] = useState('Texnik muammo');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!equipment) return null;

  const failureReasonsList = [
    'Elektron nosozlik',
    'Mexanik nosozlik',
    'Ekran / Monitor buzilgan',
    'Suv / Suyuqlik tegishi',
    'Jismoniy zarba / Shikast',
    'Eskirish / Resurs tugashi',
    'Dasturiy qotish / Tizim xatosi',
    "Yo'qolgan / O'g'irlangan",
    'Boshqa sabab'
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileList: File[] = Array.from(files);
    for (const file of fileList) {
      try {
        const compressedUrl = await compressImage(file, 800, 800, 0.7);
        setPhotos((prev) => [...prev, compressedUrl].slice(0, 5));
      } catch (err) {
        console.error("Error compressing failure photo:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalReason = failureReasonSelect === 'Boshqa sabab' 
      ? customReason.trim() 
      : `${failureReasonSelect}${customReason ? ' - ' + customReason : ''}`;

    if (!finalReason) {
      showToast("Nosozlik sababini kiriting!", "warning");
      return;
    }

    setLoading(true);

    try {
      await reportEquipmentFailure(
        {
          equipmentId: equipment.id,
          equipmentCode: equipment.code,
          equipmentTypeName: equipment.typeName,
          failureDate: new Date().toISOString(),
          failureReason: finalReason,
          failureType,
          reportedBy: user.uid,
          reportedByName: user.name,
          images: photos,
          notes,
          status: 'nosoz'
        },
        user
      );

      showToast("Nosozlik muvaffaqiyatli qayd etildi!", "success");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Nosozlikni Qayd Etish
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-mono font-semibold">
                {equipment.code} — {equipment.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Failure Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ishdan Chiqish Sababi *
            </label>
            <select
              value={failureReasonSelect}
              onChange={(e) => setFailureReasonSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white"
            >
              {failureReasonsList.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Custom detail notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Batafsil Tafsif va Izoh
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Qanday nosozlik yuz berdi? Masalan: Ekranida chiziqlar paydo bo'ldi va yonmay qoldi..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Nosozlik rasmlari */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-rose-500" />
              Nosozlik Oqibati Rasmlari (Maks 5 ta)
            </label>

            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden h-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-rose-600 text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <Upload className="w-4 h-4" />
                  <span className="text-[9px] font-semibold">Yuklash</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Saqlanmoqda..." : "Nosoz Qilib Qayd Etish"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
