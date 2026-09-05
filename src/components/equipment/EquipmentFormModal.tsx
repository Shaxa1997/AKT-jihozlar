import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Trash2, 
  Check, 
  Plus, 
  Sparkles, 
  User, 
  Shield, 
  FileText, 
  Layers,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  getDepartments, 
  getEquipmentTypes, 
  createEquipment, 
  generateEquipmentCode 
} from '../../services/db';
import { 
  Department, 
  EquipmentTypeItem, 
  EquipmentStatus, 
  EquipmentImage 
} from '../../types';
import { SignaturePad } from '../common/SignaturePad';
import { compressImage } from '../../utils/imageCompressor';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeItem[]>([]);
  const [autoCode, setAutoCode] = useState<string>('JHZ-2026-000001');

  // Form Fields
  const [typeName, setTypeName] = useState('Kompyuter');
  const [typeId, setTypeId] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [inventoryNumber, setInventoryNumber] = useState('');
  const [manufactureYear, setManufactureYear] = useState<number>(2025);
  const [status, setStatus] = useState<EquipmentStatus>('ishlayapti');
  const [ownerType, setOwnerType] = useState<'tashkilot' | 'bolim' | 'xodim'>('tashkilot');
  const [departmentId, setDepartmentId] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  
  // Current User details
  const [currentUserName, setCurrentUserName] = useState(user?.name || '');
  const [userPosition, setUserPosition] = useState(user?.position || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>('');

  // Location & Notes
  const [locationRoom, setLocationRoom] = useState('101-Xona');
  const [notes, setNotes] = useState('');

  // Photos (Up to 10 max)
  const [equipmentPhotos, setEquipmentPhotos] = useState<EquipmentImage[]>([]);

  // Signature
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signedBy, setSignedBy] = useState<string>('');

  useEffect(() => {
    async function initFormData() {
      if (!isOpen) return;
      const depts = await getDepartments();
      const types = await getEquipmentTypes();
      setDepartments(depts);
      setEquipmentTypes(types);
      if (types.length > 0 && !typeId) {
        setTypeId(types[0].id);
        setTypeName(types[0].name);
      }
      if (depts.length > 0 && !departmentId) {
        setDepartmentId(depts[0].id);
        setDepartmentName(depts[0].name);
      }
      const newCode = await generateEquipmentCode();
      setAutoCode(newCode);

      // Auto-fill from user profile
      if (user) {
        setCurrentUserName(user.name);
        setUserPosition(user.position || 'Xodim');
        setUserPhone(user.phone || '');
      }
    }
    initFormData();
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle Equipment Photos Upload (Compressed Data URLs)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (equipmentPhotos.length + files.length > 10) {
      showToast("Maksimal 10 ta rasm yuklash mumkin!", "warning");
      return;
    }

    const fileList: File[] = Array.from(files);
    for (const file of fileList) {
      try {
        const compressedUrl = await compressImage(file, 800, 800, 0.7);
        const newImg: EquipmentImage = {
          id: Math.random().toString(36).substring(2, 9),
          url: compressedUrl,
          name: file.name,
          uploadedAt: new Date().toISOString(),
          sortOrder: equipmentPhotos.length + 1
        };
        setEquipmentPhotos((prev) => [...prev, newImg].slice(0, 10));
      } catch (err) {
        console.error("Error compressing image:", err);
      }
    }
  };

  // Handle User Photo Upload
  const handleUserPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedUrl = await compressImage(file, 400, 400, 0.7);
      setUserPhotoUrl(compressedUrl);
    } catch (err) {
      console.error("Error compressing user photo:", err);
    }
  };

  const removePhoto = (id: string) => {
    setEquipmentPhotos((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Foydalanuvchi tizimga kirmagan!", "error");
      return;
    }

    if (!equipmentName.trim()) {
      showToast("Jihoz nomini kiriting!", "warning");
      return;
    }

    // Auto-fallback to persistent signature if signatureUrl isn't set
    let effectiveSigUrl = signatureUrl;
    let effectiveSignedBy = signedBy || currentUserName || user.name;

    if (!effectiveSigUrl) {
      const savedSig = localStorage.getItem('app_saved_user_signature');
      const savedName = localStorage.getItem('app_saved_signer_name');
      if (savedSig) {
        effectiveSigUrl = savedSig;
        if (savedName) effectiveSignedBy = savedName;
      }
    }

    if (!effectiveSigUrl) {
      showToast("Iltimos, elektron imzoni tasdiqlang!", "warning");
      return;
    }

    setLoading(true);

    try {
      const selectedType = equipmentTypes.find(t => t.id === typeId) || { name: typeName };
      const selectedDept = departments.find(d => d.id === departmentId) || { name: departmentName };

      await createEquipment(
        {
          typeId: typeId || 'type_gen',
          typeName: selectedType.name || typeName,
          name: equipmentName.trim(),
          brand: brand.trim(),
          model: model.trim(),
          serialNumber: serialNumber.trim(),
          inventoryNumber: inventoryNumber.trim(),
          manufactureYear: Number(manufactureYear) || 2025,
          status,
          ownerType,
          departmentId,
          departmentName: selectedDept.name || '',
          currentUserId: user.uid,
          currentUserName: currentUserName.trim() || user.name,
          userPosition: userPosition.trim(),
          userPhone: userPhone.trim(),
          userPhotoUrl: userPhotoUrl || '',
          locationRoom: locationRoom || '',
          notes: notes || '',
          mainImageUrl: equipmentPhotos[0]?.url || '',
          images: equipmentPhotos || [],
          signatureUrl: effectiveSigUrl,
          signedBy: effectiveSignedBy,
          signedAt: new Date().toISOString(),
          isBroken: status === 'ishdan_chiqqan',
          createdBy: user.uid,
          createdByName: user.name
        },
        user
      );

      showToast("Jihoz muvaffaqiyatli saqlandi!", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast("Saqlashda xatolik yuz berdi: " + (err.message || ''), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 my-auto flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Yangi Jihoz Qo'shish
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
                Avto ID: {autoCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Asosiy Inventar Ma'lumotlari</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Jihoz Nomi */}
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jihoz Nomi va Modeli *
                </label>
                <input
                  type="text"
                  required
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="Masalan: Monoblok Lenovo IdeaCentre AIO 3"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Jihoz Turi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jihoz Turi *
                </label>
                <select
                  value={typeId}
                  onChange={(e) => {
                    setTypeId(e.target.value);
                    const t = equipmentTypes.find(it => it.id === e.target.value);
                    if (t) setTypeName(t.name);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  {equipmentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Holati */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Holati *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white font-semibold"
                >
                  <option value="yangi">Yangi</option>
                  <option value="ishlayapti">Ishlayapti</option>
                  <option value="ishlatilmoqda">Ishlatilmoqda</option>
                  <option value="tamirda">Ta'mirda</option>
                  <option value="ishdan_chiqqan">Ishdan chiqqan</option>
                  <option value="omborda">Omborda</option>
                </select>
              </div>

              {/* Brend */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brend / Ishlab chiqaruvchi
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Lenovo, HP, Canon, Samsung"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Ishlab chiqarilgan yili */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ishlab Chiqarilgan Yili *
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  value={manufactureYear}
                  onChange={(e) => setManufactureYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Seriya Raqami */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seriya Raqami (Serial Number)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="SN: 89432742938"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Inventar raqami */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inventar Stiker / Balans Raqami
                </label>
                <input
                  type="text"
                  value={inventoryNumber}
                  onChange={(e) => setInventoryNumber(e.target.value)}
                  placeholder="INV-098231"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Ownership & Current User */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Biriktirilgan Shaxs va Bo'lim</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Kimga Tegishliligi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tegishlilik Turi
                </label>
                <select
                  value={ownerType}
                  onChange={(e) => setOwnerType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="tashkilot">Tashkilot Balansi</option>
                  <option value="bolim">Bo'limga Tegishli</option>
                  <option value="xodim">Shaxsiy Biriktirilgan</option>
                </select>
              </div>

              {/* Bo'lim */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bo'lim *
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    const d = departments.find(item => item.id === e.target.value);
                    if (d) setDepartmentName(d.name);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Foydalanayotgan Shaxs FIO */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foydalanayotgan Shaxs F.I.O. *
                </label>
                <input
                  type="text"
                  required
                  value={currentUserName}
                  onChange={(e) => setCurrentUserName(e.target.value)}
                  placeholder="Jasur Toshmatov"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Lavozim */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lavozimi
                </label>
                <input
                  type="text"
                  value={userPosition}
                  onChange={(e) => setUserPosition(e.target.value)}
                  placeholder="Aparaturachi Muhandis / Mutaxassis"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* User Photo Upload */}
              <div className="col-span-1 sm:col-span-2 flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    Foydalanuvchi Rasmi (Max 1 ta)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Jihozdan foydalanayotgan shaxsning yuz rasmi
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUserPhotoUpload}
                    className="mt-1 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Equipment Photos (Up to 10 photos max) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-500" />
                Jihoz Rasmlari (Maks 10 ta) ({equipmentPhotos.length}/10)
              </span>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {equipmentPhotos.map((img, idx) => (
                <div key={img.id} className="relative group rounded-2xl overflow-hidden h-24 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(img.id)}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {equipmentPhotos.length < 10 && (
                <label className="h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold">Rasm qo'shish</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Section 4: Signature Pad */}
          <SignaturePad
            initialSignerName={currentUserName || user?.name}
            onSave={(dataUrl, signer) => {
              setSignatureUrl(dataUrl);
              setSignedBy(signer);
            }}
          />

          {/* Section 5: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Qo'shimcha Izoh va Qaydlar
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jihozning holati, komplekti yoki qo'shimcha detallari..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Saqlanmoqda...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Jihozni Saqlash</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
