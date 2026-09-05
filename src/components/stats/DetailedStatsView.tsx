import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Package, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Building2, 
  UserCheck, 
  Grid, 
  Layers, 
  Sparkles,
  PieChart,
  HardDrive
} from 'lucide-react';
import { Equipment, Department, EquipmentTypeItem } from '../../types';
import { getEquipmentList, getDepartments, getEquipmentTypes } from '../../services/db';

export const DetailedStatsView: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeSearch, setTypeSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eqData, deptData, typeData] = await Promise.all([
        getEquipmentList(),
        getDepartments(),
        getEquipmentTypes()
      ]);
      setEquipmentList(eqData);
      setDepartments(deptData);
      setEquipmentTypes(typeData);
    } catch (err) {
      console.error("Error loading stats data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Overall totals
  const totalCount = equipmentList.length;
  const workingCount = equipmentList.filter(e => e.status === 'ishlayapti' || e.status === 'ishlatilmoqda' || e.status === 'yangi').length;
  const brokenCount = equipmentList.filter(e => e.status === 'ishdan_chiqqan' || e.isBroken).length;
  const repairCount = equipmentList.filter(e => e.status === 'tamirda').length;
  const stockCount = equipmentList.filter(e => e.status === 'omborda').length;

  // 1. Equipment Type Breakdown Map with exact numbers (Kompyuter 10 ta, Monitor 20 ta, Wi-Fi 20 ta)
  const typeStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; working: number; broken: number; stock: number }>();
    
    // First initialize with all known type categories from database
    equipmentTypes.forEach(t => {
      map.set(t.name.toLowerCase(), {
        name: t.name,
        count: 0,
        working: 0,
        broken: 0,
        stock: 0
      });
    });

    // Count equipment items
    equipmentList.forEach(eq => {
      const tName = eq.typeName?.trim() || 'Boshqa';
      const key = tName.toLowerCase();
      
      const existing = map.get(key) || { name: tName, count: 0, working: 0, broken: 0, stock: 0 };
      existing.count += 1;
      
      if (eq.status === 'ishdan_chiqqan' || eq.isBroken) {
        existing.broken += 1;
      } else if (eq.status === 'omborda') {
        existing.stock += 1;
      } else {
        existing.working += 1;
      }
      
      map.set(key, existing);
    });

    return Array.from(map.values())
      .filter(item => item.count > 0 || !typeSearch) // Keep items
      .sort((a, b) => b.count - a.count);
  }, [equipmentList, equipmentTypes, typeSearch]);

  // Filter type stats by user search
  const filteredTypeStats = useMemo(() => {
    if (!typeSearch) return typeStats;
    return typeStats.filter(s => s.name.toLowerCase().includes(typeSearch.toLowerCase()));
  }, [typeStats, typeSearch]);

  // 2. Department Breakdown Map
  const departmentStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; working: number; broken: number }>();

    departments.forEach(d => {
      map.set(d.id, { name: d.name, count: 0, working: 0, broken: 0 });
    });

    equipmentList.forEach(eq => {
      const deptId = eq.departmentId || 'unassigned';
      const deptName = eq.departmentName || 'Bo\'limsiz / Umumiy';
      
      const existing = map.get(deptId) || { name: deptName, count: 0, working: 0, broken: 0 };
      existing.count += 1;
      if (eq.status === 'ishdan_chiqqan' || eq.isBroken) {
        existing.broken += 1;
      } else {
        existing.working += 1;
      }
      map.set(deptId, existing);
    });

    return Array.from(map.values()).filter(d => d.count > 0).sort((a, b) => b.count - a.count);
  }, [equipmentList, departments]);

  // 3. Officer Breakdown Map (Mas'ullar bo'yicha)
  const officerStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; position?: string }>();
    equipmentList.forEach(eq => {
      const name = eq.currentUserName?.trim();
      if (name) {
        const existing = map.get(name) || { name, count: 0, position: eq.userPosition };
        existing.count += 1;
        map.set(name, existing);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [equipmentList]);

  const handlePrintStats = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-800/40">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-blue-400" /> Raqamli Hisobot va Analitika
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            📊 Jihozlar Raqamli Statistikasi
          </h1>
          <p className="text-xs text-blue-200 max-w-xl leading-relaxed">
            Tashkilotdagi barcha kompyuter, monitor, Wi-Fi router, printer va aparaturalarning aniq soni (raqamlarda) va taqsimoti.
          </p>
        </div>

        <button
          onClick={handlePrintStats}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-2 transition-all shrink-0 backdrop-blur-md active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Statistikani Chop Etish</span>
        </button>
      </div>

      {/* Main Highlights Hero Number Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
          <div className="text-xs font-semibold text-blue-100 flex items-center gap-1">
            <Package className="w-4 h-4" /> Jami Jihozlar
          </div>
          <div className="text-3xl font-black font-mono my-1 tracking-tight">{totalCount} <span className="text-sm font-sans font-normal opacity-80">ta</span></div>
          <div className="text-[10px] text-blue-100/80">Tizimdagi barcha jihozlar</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Ishlayotgan
          </div>
          <div className="text-3xl font-black font-mono my-1 text-slate-900 dark:text-white">{workingCount} <span className="text-sm font-sans font-normal text-slate-500">ta</span></div>
          <div className="text-[10px] text-slate-500">Soz va foydalanishda</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-rose-200 dark:border-rose-900/50 shadow-sm">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Nosoz / Ishdan chiqqan
          </div>
          <div className="text-3xl font-black font-mono my-1 text-rose-600 dark:text-rose-400">{brokenCount} <span className="text-sm font-sans font-normal text-slate-500">ta</span></div>
          <div className="text-[10px] text-slate-500">Ta'mirga muhtoj jihozlar</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <HardDrive className="w-4 h-4" /> Omborda Saqlanmoqda
          </div>
          <div className="text-3xl font-black font-mono my-1 text-slate-900 dark:text-white">{stockCount} <span className="text-sm font-sans font-normal text-slate-500">ta</span></div>
          <div className="text-[10px] text-slate-500">Ehtiyot zaxirada</div>
        </div>
      </div>

      {/* SECTION 1: EQUIPMENT TYPES NUMERICAL BREAKDOWN (Kompyuter 10 ta, Monitor 20 ta, Wi-Fi 20 ta) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                1. Jihoz Turlari Bo'yicha Raqamli Statistika
              </h2>
              <p className="text-xs text-slate-500">
                Har bir jihoz turining (Kompyuter, Monitor, Wi-Fi, Printer) aniq miqdori
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              placeholder="Jihoz turini qidirish..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Large Counter Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredTypeStats.map((item) => {
            const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
            
            return (
              <div 
                key={item.name}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200/80 dark:border-[#1F293D] flex flex-col justify-between gap-2.5 hover:border-blue-400 transition-all group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-black font-mono bg-blue-600 text-white shadow-sm shadow-blue-500/20 shrink-0">
                    {item.count} ta
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full" 
                      style={{ width: item.count > 0 ? `${(item.working / item.count) * 100}%` : '0%' }}
                      title={`Ishlayotgan: ${item.working} ta`}
                    />
                    <div 
                      className="bg-rose-500 h-full" 
                      style={{ width: item.count > 0 ? `${(item.broken / item.count) * 100}%` : '0%' }}
                      title={`Nosoz: ${item.broken} ta`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Soz: {item.working} ta</span>
                    {item.broken > 0 && <span className="text-rose-600 dark:text-rose-400 font-medium">Nosoz: {item.broken} ta</span>}
                    <span>{percentage}% jami</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: DEPARTMENT BREAKDOWN IN NUMBERS */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              2. Bo'limlar Bo'yicha Raqamli Statistika
            </h2>
            <p className="text-xs text-slate-500">
              Tashkilot bo'limlariga biriktirilgan jihozlarning aniq soni
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {departmentStats.map((dept) => (
            <div 
              key={dept.name}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#1F293D] flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {dept.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  Soz: <strong className="text-emerald-600">{dept.working}</strong> • Nosoz: <strong className="text-rose-600">{dept.broken}</strong>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-mono font-black text-sm shadow">
                {dept.count} ta
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: RESPONSIBLE OFFICERS IN NUMBERS */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              3. Mas'ul Xodimlar Bo'yicha Jihozlar Soni
            </h2>
            <p className="text-xs text-slate-500">
              Xodimlarga shaxsan topshirilgan va biriktirilgan jihozlar miqdori
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {officerStats.map((off) => (
            <div 
              key={off.name}
              className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#1F293D] flex items-center justify-between gap-2"
            >
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {off.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {off.position || 'Mas\'ul xodim'}
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs border border-purple-200 dark:border-purple-800 shrink-0">
                {off.count} ta
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
