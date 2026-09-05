import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Printer, 
  FileText, 
  Wrench, 
  UserCheck, 
  History as HistoryIcon, 
  Calendar, 
  User, 
  Building, 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Tag,
  PenTool,
  Clock
} from 'lucide-react';
import { Equipment, EquipmentHistory } from '../../types';
import { getEquipmentHistoryList } from '../../services/db';
import { generateEquipmentPassportPDF } from './PassportPDF';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { QRModal } from '../common/QRModal';
import { useAuth } from '../../context/AuthContext';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onReportFailure: (equipment: Equipment) => void;
  onTransfer: (equipment: Equipment) => void;
  onUpdateStatus?: () => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  onClose,
  onReportFailure,
  onTransfer,
  onUpdateStatus
}) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<EquipmentHistory[]>([]);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  useEffect(() => {
    async function loadHistory() {
      if (equipment) {
        const list = await getEquipmentHistoryList(equipment.id);
        setHistory(list);
      }
    }
    loadHistory();
  }, [equipment]);

  if (!equipment) return null;

  const allPhotos = equipment.images && equipment.images.length > 0 
    ? equipment.images 
    : equipment.mainImageUrl 
    ? [{ id: '1', url: equipment.mainImageUrl, name: 'Asosiy rasm', uploadedAt: '', sortOrder: 0 }] 
    : [];

  const handleExportPDF = async () => {
    await generateEquipmentPassportPDF(equipment);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 my-auto flex flex-col">
          
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs tracking-wider shadow-md">
                {equipment.code}
              </span>
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  {equipment.typeName}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {equipment.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQR(true)}
                title="QR kodi"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'info'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                Ma'lumotlar
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>Tarix ({history.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-blue-500" />
                <span>PDF Pasport</span>
              </button>

              <button
                onClick={() => onReportFailure(equipment)}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Nosozlikni Qayd Etish</span>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => onTransfer(equipment)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Ko'chirish</span>
                </button>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 space-y-6 flex-1">
            
            {activeTab === 'info' ? (
              <>
                {/* Photo Gallery Carousel */}
                {allPhotos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Jihoz Rasmlari ({allPhotos.length} ta)</span>
                      <span className="text-[10px] text-blue-500 font-normal">Kattalashtirish uchun bosing</span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allPhotos.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setPhotoViewerIndex(idx);
                            setShowPhotoViewer(true);
                          }}
                          className="w-28 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                        >
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left Specs */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4" /> Inventar Ma'lumotlari
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-500">Jihoz Turi:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{equipment.typeName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-500">Holati:</span>
                        <span className="font-bold text-emerald-600 capitalize">{equipment.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-500">Brend / Model:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{equipment.brand || '—'} {equipment.model}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-500">Seriya Raqami:</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">{equipment.serialNumber || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-500">Inventar Stikeri:</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">{equipment.inventoryNumber || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ishlab Chiqarilgan Yili:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{equipment.manufactureYear}-yil</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Specs: User & Location */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Biriktirilgan Foydalanuvchi
                    </h3>

                    {/* User Profile Card */}
                    <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm">
                        {equipment.userPhotoUrl ? (
                          <img src={equipment.userPhotoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          equipment.currentUserName.substring(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {equipment.currentUserName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {equipment.userPosition || 'Xodim'}
                        </div>
                        {equipment.userPhone && (
                          <div className="text-[10px] text-blue-600 dark:text-blue-400">
                            {equipment.userPhone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-1">
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-500">Bo'lim:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{equipment.departmentName || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="text-slate-500">Tegishlilik Turi:</span>
                        <span className="font-semibold uppercase text-slate-900 dark:text-white">{equipment.ownerType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Qo'shilgan Sana:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {new Date(equipment.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Electronic Signature Display Block */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-emerald-500" /> Qabul Qiluvchi Elektron Imzosi
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {equipment.signedAt ? new Date(equipment.signedAt).toLocaleString('uz-UZ') : new Date(equipment.createdAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {equipment.signedBy || equipment.currentUserName}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Raqamli Imzo Tasdiqlangan
                      </div>
                    </div>

                    {equipment.signatureUrl ? (
                      <img src={equipment.signatureUrl} alt="Signature" className="h-12 max-w-[140px] object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Imzo chekilgan</span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {equipment.notes && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-1">Izoh va Qayd:</span>
                    {equipment.notes}
                  </div>
                )}

              </>
            ) : (
              /* History Timeline */
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Jihoz Harakatlari va O'zgarishlar Tarixi
                </h3>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Tarixiy yozuvlar mavjud emas</p>
                ) : (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                    {history.map((h) => (
                      <div key={h.id} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {h.action}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {h.details}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Bajaruvchi: <b>{h.performedByName}</b></span>
                          <span>•</span>
                          <span>{new Date(h.timestamp).toLocaleString('uz-UZ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <QRModal equipment={equipment} onClose={() => setShowQR(false)} />
      )}

      {/* Fullscreen Photo Viewer Modal */}
      {showPhotoViewer && (
        <PhotoViewerModal
          images={allPhotos}
          initialIndex={photoViewerIndex}
          onClose={() => setShowPhotoViewer(false)}
        />
      )}
    </>
  );
};
