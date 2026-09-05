import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { getEquipmentList, getDepartments, getEquipmentTypes } from '../../services/db';
import { Equipment, Department, EquipmentTypeItem, EquipmentFilterOptions } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ReportsView: React.FC = () => {
  const { showToast } = useToast();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeItem[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const loadData = async () => {
    const filters: EquipmentFilterOptions = {
      status: statusFilter || undefined,
      typeId: typeFilter || undefined,
      departmentId: deptFilter || undefined,
      manufactureYear: yearFilter || undefined
    };

    const list = await getEquipmentList(filters);
    setEquipmentList(list);
  };

  useEffect(() => {
    async function init() {
      const depts = await getDepartments();
      const types = await getEquipmentTypes();
      setDepartments(depts);
      setEquipmentTypes(types);
      loadData();
    }
    init();
  }, []);

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter, deptFilter, yearFilter]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (equipmentList.length === 0) {
      showToast("Eksport qilish uchun ma'lumot yo'q!", "warning");
      return;
    }

    const headers = [
      "Jihoz Kodi",
      "Jihoz Nomi",
      "Jihoz Turi",
      "Brend",
      "Model",
      "Seriya Raqami",
      "Inventar Raqami",
      "Ishlab Chiqarilgan Yili",
      "Holati",
      "Tegishlilik Turi",
      "Foydalanayotgan Shaxs",
      "Bo'lim",
      "Xona",
      "Qo'shilgan Sana"
    ];

    const rows = equipmentList.map((e) => [
      `"${e.code}"`,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.typeName}"`,
      `"${e.brand || ''}"`,
      `"${e.model || ''}"`,
      `"${e.serialNumber || ''}"`,
      `"${e.inventoryNumber || ''}"`,
      `"${e.manufactureYear}"`,
      `"${e.status}"`,
      `"${e.ownerType}"`,
      `"${e.currentUserName}"`,
      `"${e.departmentName || ''}"`,
      `"${e.locationRoom || ''}"`,
      `"${new Date(e.createdAt).toLocaleDateString('uz-UZ')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Jihozlar_Hisoboti_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Excel/CSV hisoboti muvaffaqiyatli yuklandi!", "success");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Hisobotlar va Excel Eksport
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Filtrlar bo'yicha saralangan inventarizatsiya hisobotlarini yuklab olish
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Excel / CSV Eksport ({equipmentList.length} ta)</span>
        </button>
      </div>

      {/* Filter Panel */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-blue-500" /> Hisobot Filtrlar
          </span>
          {(statusFilter || typeFilter || deptFilter || yearFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('');
                setDeptFilter('');
                setYearFilter('');
              }}
              className="text-rose-500 hover:underline capitalize"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Status */}
          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Holati</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
            >
              <option value="">Barcha holatlar</option>
              <option value="ishlayapti">Ishlayapti</option>
              <option value="tamirda">Ta'mirda</option>
              <option value="ishdan_chiqqan">Ishdan chiqqan</option>
              <option value="omborda">Omborda</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Jihoz Turi</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
            >
              <option value="">Barcha turlar</option>
              {equipmentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Bo'lim</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
            >
              <option value="">Barcha bo'limlar</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-slate-500 mb-1 font-semibold">Ishlab Chiqarilgan Yili</label>
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              placeholder="Masalan: 2025"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span>Hisobot Oldidan Ko'rib Chiqish ({equipmentList.length} ta yozuv)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">Kodi</th>
                <th className="p-3">Nomi & Turi</th>
                <th className="p-3">Holati</th>
                <th className="p-3">Foydalanuvchi</th>
                <th className="p-3">Bo'lim</th>
                <th className="p-3">Yili</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {equipmentList.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{e.code}</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {e.name}
                    <span className="block text-[10px] text-slate-400 font-normal">{e.typeName}</span>
                  </td>
                  <td className="p-3 capitalize text-slate-700 dark:text-slate-300">{e.status}</td>
                  <td className="p-3 text-slate-900 dark:text-white font-medium">{e.currentUserName}</td>
                  <td className="p-3 text-slate-500">{e.departmentName || '—'}</td>
                  <td className="p-3 text-slate-400">{e.manufactureYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
