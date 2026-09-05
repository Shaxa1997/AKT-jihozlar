import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Package, PlusCircle, AlertCircle, Users, UserCheck, X } from 'lucide-react';
import { Equipment, EquipmentFilterOptions, Department, EquipmentTypeItem } from '../../types';
import { getEquipmentList, getDepartments, getEquipmentTypes } from '../../services/db';
import { EquipmentCard } from './EquipmentCard';
import { useAuth } from '../../context/AuthContext';

interface EquipmentListProps {
  onSelectEquipment: (equipment: Equipment) => void;
  onOpenAddModal: () => void;
  brokenOnly?: boolean;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  onSelectEquipment,
  onOpenAddModal,
  brokenOnly = false
}) => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(brokenOnly ? 'ishdan_chiqqan' : '');
  const [typeId, setTypeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'code' | 'year' | 'status'>('newest');

  const loadData = async () => {
    setLoading(true);
    const filters: EquipmentFilterOptions = {
      search,
      status: brokenOnly ? 'ishdan_chiqqan' : status || undefined,
      typeId: typeId || undefined,
      departmentId: departmentId || undefined,
      isBrokenOnly: brokenOnly,
      sortBy
    };

    const list = await getEquipmentList(filters, user || undefined);
    setEquipmentList(list);
    setLoading(false);
  };

  useEffect(() => {
    async function init() {
      const depts = await getDepartments();
      const types = await getEquipmentTypes();
      setDepartments(depts);
      setEquipmentTypes(types);
    }
    init();
  }, []);

  useEffect(() => {
    loadData();
  }, [search, status, typeId, departmentId, sortBy, brokenOnly, user]);

  // Extract unique responsible officers and their assigned equipment count (Requirement 2)
  const responsibleOfficers = useMemo(() => {
    const map = new Map<string, { name: string; photoUrl?: string; position?: string; count: number }>();
    equipmentList.forEach((eq) => {
      const name = eq.currentUserName?.trim();
      if (name) {
        const existing = map.get(name);
        if (existing) {
          existing.count += 1;
          if (!existing.photoUrl && eq.userPhotoUrl) existing.photoUrl = eq.userPhotoUrl;
          if (!existing.position && eq.userPosition) existing.position = eq.userPosition;
        } else {
          map.set(name, {
            name,
            photoUrl: eq.userPhotoUrl,
            position: eq.userPosition,
            count: 1
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [equipmentList]);

  // Filter list by selected officer if active
  const displayedEquipment = useMemo(() => {
    if (!selectedOfficer) return equipmentList;
    return equipmentList.filter(eq => eq.currentUserName?.trim() === selectedOfficer);
  }, [equipmentList, selectedOfficer]);

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Header */}
      <div className="p-3 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-3 shadow-sm">
        
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          
          {/* Realtime Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidiruv: kod, nom, F.I.Sh..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500 text-slate-900 dark:text-[#E2E8F0] placeholder:text-slate-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
            {!brokenOnly && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-[#E2E8F0] font-mono text-[11px]"
              >
                <option value="">Barcha Holatlar</option>
                <option value="ishlayapti">Ishlayapti</option>
                <option value="tamirda">Ta'mirda</option>
                <option value="ishdan_chiqqan">Ishdan chiqqan</option>
                <option value="omborda">Omborda</option>
              </select>
            )}

            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-[#E2E8F0] font-mono text-[11px]"
            >
              <option value="">Barcha Turlar</option>
              {equipmentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none text-slate-900 dark:text-[#E2E8F0] font-mono text-[11px]"
            >
              <option value="newest">Yangi qo'shilgan</option>
              <option value="oldest">Eski qo'shilgan</option>
              <option value="code">Kodi bo'yicha</option>
              <option value="year">Yil bo'yicha</option>
            </select>
          </div>

        </div>

        {/* REQUIREMENT 2: Responsible Officers List (Biriktirilgan Mas'ullar F.I.Sh) */}
        {responsibleOfficers.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <UserCheck className="w-4 h-4 text-blue-500" />
                <span>Biriktirilgan Mas'ul Xodimlar (F.I.Sh):</span>
              </div>
              {selectedOfficer && (
                <button
                  onClick={() => setSelectedOfficer('')}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Filtrni tozalash</span>
                </button>
              )}
            </div>

            {/* Horizontal Scrollable Officer Cards */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              <button
                onClick={() => setSelectedOfficer('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                  !selectedOfficer
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Barcha mas'ullar</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${!selectedOfficer ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {equipmentList.length}
                </span>
              </button>

              {responsibleOfficers.map((officer) => {
                const isSelected = selectedOfficer === officer.name;
                return (
                  <button
                    key={officer.name}
                    onClick={() => setSelectedOfficer(isSelected ? '' : officer.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/25 ring-2 ring-blue-400/50'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {officer.photoUrl ? (
                      <img src={officer.photoUrl} alt={officer.name} className="w-5 h-5 rounded-full object-cover border border-white/40" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300'}`}>
                        {officer.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span>{officer.name}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-white/25 text-white font-bold' : 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {officer.count} ta jihoz
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Selected Officer Filter Banner */}
      {selectedOfficer && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Mas'ul xodim: <strong className="font-bold underline">{selectedOfficer}</strong> ga biriktirilgan jihozlar (<strong>{displayedEquipment.length} ta</strong>)
            </span>
          </div>
          <button
            onClick={() => setSelectedOfficer('')}
            className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Equipment Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-200 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] animate-pulse" />
          ))}
        </div>
      ) : displayedEquipment.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#161B22] text-slate-400 flex items-center justify-center mx-auto border border-slate-200 dark:border-[#30363D]">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {selectedOfficer ? `${selectedOfficer} ga biriktirilgan jihoz topilmadi` : brokenOnly ? "Nosoz jihozlar topilmadi 🎉" : "Jihozlar mavjud emas"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-mono">
            {selectedOfficer ? "Ushbu xodimga hozircha hech qanday jihoz biriktirilmagan." : brokenOnly ? "Tizimda hozircha ishdan chiqqan jihozlar qayd etilmagan." : "Yangi jihoz qo'shish tugmasini bosib inventarizatsiyani boshlang."}
          </p>
          {!brokenOnly && (
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs inline-flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Yangi Jihoz Qo'shish</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onClick={() => onSelectEquipment(item)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
