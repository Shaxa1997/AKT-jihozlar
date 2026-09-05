import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  X, 
  UserPlus, 
  UserMinus, 
  Users, 
  Search, 
  Phone, 
  Briefcase, 
  Check, 
  Camera,
  UserCheck
} from 'lucide-react';
import { Department, UserProfile } from '../../types';
import { getDepartments, saveDepartment, getUsers, saveUser } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const DepartmentManagement: React.FC = () => {
  const { showToast } = useToast();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Department Modal
  const [isOpenDeptModal, setIsOpenDeptModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDescription, setDeptDescription] = useState('');

  // Assign Staff Modal
  const [selectedDeptForStaff, setSelectedDeptForStaff] = useState<Department | null>(null);
  const [staffSearch, setStaffSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptList, userList] = await Promise.all([
        getDepartments(),
        getUsers()
      ]);
      setDepartments(deptList);
      setUsers(userList);
    } catch (err) {
      console.error("Error loading department management data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Department CRUD
  const handleOpenAddDept = () => {
    setEditingId(null);
    setDeptName('');
    setDeptCode('B0' + (departments.length + 1));
    setDeptDescription('');
    setIsOpenDeptModal(true);
  };

  const handleOpenEditDept = (d: Department) => {
    setEditingId(d.id);
    setDeptName(d.name);
    setDeptCode(d.code);
    setDeptDescription(d.description || '');
    setIsOpenDeptModal(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    await saveDepartment({
      id: editingId || undefined,
      name: deptName.trim(),
      code: deptCode.trim(),
      description: deptDescription.trim()
    });

    showToast("Bo'lim muvaffaqiyatli saqlandi!", "success");
    setIsOpenDeptModal(false);
    loadData();
  };

  // Staff Assignment
  const handleAssignUserToDept = async (user: UserProfile, dept: Department | null) => {
    const updatedUser: UserProfile = {
      ...user,
      departmentId: dept ? dept.id : '',
      departmentName: dept ? dept.name : ''
    };

    await saveUser(updatedUser);
    showToast(
      dept 
        ? `${user.name} "${dept.name}" bo'limiga biriktirildi!` 
        : `${user.name} bo'limdan chiqarildi!`, 
      "success"
    );
    loadData();
  };

  // Filter staff for assignment modal
  const filteredUsersForAssign = users.filter((u) => {
    const s = staffSearch.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(s) || 
      (u.position && u.position.toLowerCase().includes(s)) ||
      (u.phone && u.phone.toLowerCase().includes(s));

    return matchesSearch;
  });

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-blue-400" /> Bo'limlar va Tarkib
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
            🏢 Tashkilot Bo'limlari va Xodimlar Biriktiruvi
          </h1>
          <p className="text-xs text-blue-200 max-w-xl">
            Tashkilot bo'limlarini boshqarish, har bir bo'limga xodimlarni ularning rasmi va lavozimi bilan biriktirish.
          </p>
        </div>

        <button
          onClick={handleOpenAddDept}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all shrink-0 active:scale-95 border border-white/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi Bo'lim Qo'shish</span>
        </button>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B]">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hozircha bo'limlar mavjud emas</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Yangi bo'lim qo'shish tugmasidan foydalaning.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            // Find users in this department
            const deptUsers = users.filter((u) => u.departmentId === dept.id || u.departmentName === dept.name);

            return (
              <div
                key={dept.id}
                className="p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-black text-xs border border-blue-500/20">
                        {dept.code}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {dept.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDept(dept)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Bo'limni tahrirlash"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {dept.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 my-2 leading-relaxed font-mono">
                      {dept.description}
                    </p>
                  )}

                  {/* Assigned Staff Section */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                        <Users className="w-3 h-3 text-blue-500" /> Biriktirilgan xodimlar ({deptUsers.length})
                      </span>

                      <button
                        onClick={() => setSelectedDeptForStaff(dept)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" /> Xodim biriktirish
                      </button>
                    </div>

                    {/* Staff List with Avatar Pictures */}
                    {deptUsers.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
                        Ushbu bo'limga hali xodim biriktirilmagan
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {deptUsers.map((u) => (
                          <div
                            key={u.uid}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 group hover:border-blue-300 dark:hover:border-blue-800 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Avatar Photo */}
                              <div className="relative shrink-0">
                                {u.avatarUrl ? (
                                  <img
                                    src={u.avatarUrl}
                                    alt={u.name}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className={`w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 absolute bottom-0 right-0 ${
                                  u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                              </div>

                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {u.name}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                                  <span>{u.position || 'Xodim'}</span>
                                  {u.phone && <span>• {u.phone}</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAssignUserToDept(u, null)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shrink-0"
                              title="Bo'limdan chiqarish"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <button
                  onClick={() => setSelectedDeptForStaff(dept)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Xodimlarni Boshqarish ({deptUsers.length})</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Add / Edit Department Modal */}
      {isOpenDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingId ? "Bo'limni Tahrirlash" : "Yangi Bo'lim Qo'shish"}
                </h3>
              </div>
              <button onClick={() => setIsOpenDeptModal(false)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bo'lim Nomi *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="Masalan: Raqamli texnologiyalar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bo'lim Kodi</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="RT"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tavsifi</label>
                <textarea
                  rows={2}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Bo'lim vazifasi va mas'uliyati"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpenDeptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Assign Staff to Department Modal */}
      {selectedDeptForStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    "{selectedDeptForStaff.name}" bo'limiga xodim biriktirish
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Bo'lim kodi: {selectedDeptForStaff.code}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDeptForStaff(null)} 
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Xodim ismi, lavozimi yoki telefonini qidirish..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Staff List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 max-h-80">
              {filteredUsersForAssign.map((u) => {
                const isAssignedToThisDept = u.departmentId === selectedDeptForStaff.id;

                return (
                  <div
                    key={u.uid}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isAssignedToThisDept
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Photo / Avatar */}
                      <div className="relative shrink-0">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {u.position || 'Xodim'} • {u.departmentName || 'Bo\'limsiz'}
                        </div>
                      </div>
                    </div>

                    {isAssignedToThisDept ? (
                      <button
                        onClick={() => handleAssignUserToDept(u, null)}
                        className="px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-600 dark:text-rose-300 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Chiqarish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignUserToDept(u, selectedDeptForStaff)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition-colors shrink-0 flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Biriktirish</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDeptForStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
