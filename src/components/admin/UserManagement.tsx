import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, ShieldOff, Edit3, UserCheck, X, Check } from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { getUsers, saveUser, getDepartments } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const UserManagement: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<UserStatus>('active');
  const [avatarUrl, setAvatarUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    const list = await getUsers();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUid(null);
    setName('');
    setPhone('');
    setRole('user');
    setPosition('Mutaxassis');
    setStatus('active');
    setAvatarUrl(`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditingUid(u.uid);
    setName(u.name);
    setPhone(u.phone || '');
    setRole(u.role);
    setPosition(u.position || '');
    setStatus(u.status);
    setAvatarUrl(u.avatarUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const uid = editingUid || `usr_${Date.now()}`;
    const newUser: UserProfile = {
      uid,
      name: name.trim(),
      phone: phone.trim(),
      role,
      position: position.trim(),
      status,
      avatarUrl: avatarUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
      equipmentCount: 0
    };

    await saveUser(newUser);
    showToast("Foydalanuvchi muvaffaqiyatli saqlandi!", "success");
    setIsModalOpen(false);
    loadData();
  };

  const toggleBlockStatus = async (u: UserProfile) => {
    const newStatus: UserStatus = u.status === 'active' ? 'blocked' : 'active';
    await saveUser({ ...u, status: newStatus });
    showToast(`Foydalanuvchi holati ${newStatus} ga o'zgartirildi!`, "info");
    loadData();
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Foydalanuvchilarni Boshqarish
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Admin va xodimlar hisoblari nazorati
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow flex items-center gap-1.5 transition-all border border-blue-500/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yangi Foydalanuvchi</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E293B] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0B0F13] text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-[#1E293B]">
              <tr>
                <th className="p-3">F.I.O. va Lavozimi</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Roli</th>
                <th className="p-3">Holati</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/80 dark:hover:bg-[#161B22] transition-colors">
                  <td className="p-3 font-medium text-slate-900 dark:text-[#E2E8F0]">
                    <div className="flex items-center gap-2.5">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{u.name}</div>
                        <span className="block text-[10px] text-slate-400 font-normal font-mono">{u.position || 'Xodim'} • {u.departmentName || 'Bo\'limsiz'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">{u.phone || '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      u.role === 'admin' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {u.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      u.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {u.status === 'active' ? 'Aktiv' : 'Bloklangan'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1 rounded border border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleBlockStatus(u)}
                      className={`p-1 rounded text-white transition-colors ${
                        u.status === 'active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      title={u.status === 'active' ? 'Bloklash' : 'Aktivlashtirish'}
                    >
                      {u.status === 'active' ? <ShieldOff className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0F172A] rounded-lg max-w-md w-full p-4 shadow-2xl border border-slate-200 dark:border-[#30363D] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E293B]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#E2E8F0]">
                {editingUid ? 'Foydalanuvchini Tahrirlash' : 'Yangi Foydalanuvchi Qo\'shish'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">F.I.O. *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Lavozimi</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Rasm URL (Avatar)</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Roli</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-white font-mono"
                  >
                    <option value="user">Foydalanuvchi</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Holati</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-white font-mono"
                  >
                    <option value="active">Aktiv</option>
                    <option value="blocked">Bloklangan</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 dark:border-[#30363D] text-slate-700 dark:text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
