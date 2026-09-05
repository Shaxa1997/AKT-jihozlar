import React, { useState, useEffect } from 'react';
import { Grid, Plus, Edit3, X } from 'lucide-react';
import { EquipmentTypeItem } from '../../types';
import { getEquipmentTypes, saveEquipmentType } from '../../services/db';
import { useToast } from '../../context/ToastContext';

export const EquipmentTypeManagement: React.FC = () => {
  const { showToast } = useToast();
  const [types, setTypes] = useState<EquipmentTypeItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeName, setTypeName] = useState('');

  const loadData = async () => {
    const list = await getEquipmentTypes();
    setTypes(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTypeName('');
    setIsOpen(true);
  };

  const handleOpenEdit = (item: EquipmentTypeItem) => {
    setEditingId(item.id);
    setTypeName(item.name);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    await saveEquipmentType({
      id: editingId || undefined,
      name: typeName.trim()
    });

    showToast("Jihoz turi saqlandi!", "success");
    setIsOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-blue-600" />
            Jihoz Turlarini Boshqarish
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inventar toifalari (Kompyuter, Printer, Notebook, va h.k.)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Tur Qo'shish</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {types.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {t.name}
            </span>
            <button
              onClick={() => handleOpenEdit(t)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Turini Tahrirlash' : 'Yangi Tur Qo\'shish'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tur Nomi *</label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Masalan: Proyektor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
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
