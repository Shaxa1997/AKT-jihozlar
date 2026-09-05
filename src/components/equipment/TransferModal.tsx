import React, { useState, useEffect } from 'react';
import { X, UserCheck, ArrowRight, Check } from 'lucide-react';
import { Equipment, UserProfile } from '../../types';
import { getUsers, transferEquipment } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface TransferModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  equipment,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [transferReason, setTransferReason] = useState('Xodim almashtirilishi / Rejalashtirilgan biriktiruv');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      const list = await getUsers();
      setUsers(list.filter(u => u.status === 'active'));
      if (list.length > 0) {
        setSelectedUserId(list[0].uid);
      }
    }
    loadUsers();
  }, []);

  if (!equipment) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUserId) return;

    const targetUser = users.find(u => u.uid === selectedUserId);
    if (!targetUser) return;

    if (targetUser.uid === equipment.currentUserId) {
      showToast("Jihoz allaqachon ushbu xodimga biriktirilgan!", "warning");
      return;
    }

    setLoading(true);

    try {
      await transferEquipment(
        equipment.id,
        targetUser.uid,
        targetUser.name,
        targetUser.position || 'Xodim',
        transferReason,
        user
      );

      showToast(`Jihoz ${targetUser.name} ga ko'chirildi!`, "success");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Ko'chirishda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Jihozni Boshqa Xodimga O'tkazish
              </h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                {equipment.code}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTransfer} className="space-y-4">
          
          {/* Transfer Visual Route */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Eski foydalanuvchi:</span>
              <span className="font-bold text-slate-900 dark:text-white">{equipment.currentUserName}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-indigo-500 block">Yangi foydalanuvchi:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {users.find(u => u.uid === selectedUserId)?.name || 'Tanlang'}
              </span>
            </div>
          </div>

          {/* Select New User */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Yangi Biriktiriluvchi Xodim *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
            >
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name} ({u.position || 'Xodim'})
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              O'tkazish Sababi va Hujjat
            </label>
            <textarea
              rows={2}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Masalan: Bo'limlararo rotatsiya yoki xodim almashtirilishi..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
            />
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "O'tkazilmoqda..." : "Biriktiruvni Saqlash"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
