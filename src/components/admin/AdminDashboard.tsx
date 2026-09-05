import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Package, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  Users, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  PieChart 
} from 'lucide-react';
import { getDashboardStats } from '../../services/db';
import { Equipment } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E293B]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            Admin Boshqaruv Statistikalari
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Database realtime ko'rsatkichlar monitoringi
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Equipment */}
        <div className="p-3.5 bg-blue-600 text-white rounded-lg shadow relative overflow-hidden border border-blue-500/30">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-100">Jami Jihozlar</span>
            <Package className="w-4 h-4 opacity-80" />
          </div>
          <div className="text-2xl font-extrabold font-mono mt-2 relative z-10">
            {stats.total} <span className="text-xs font-normal text-blue-200">ta</span>
          </div>
          <p className="text-[10px] text-blue-100 mt-0.5 relative z-10 font-mono">
            Ro'yxatdagi jami balans
          </p>
        </div>

        {/* Working Equipment */}
        <div className="p-3.5 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Ishlayapti</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-[#E2E8F0] mt-2">
            {stats.working} <span className="text-xs font-normal text-slate-400">ta</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Faol foydalanilayotganlar
          </p>
        </div>

        {/* In Repair */}
        <div className="p-3.5 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Ta'mirda</span>
            <Wrench className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-[#E2E8F0] mt-2">
            {stats.inRepair} <span className="text-xs font-normal text-slate-400">ta</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Ta'mirlash xizmatida
          </p>
        </div>

        {/* Broken Equipment */}
        <div className="p-3.5 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Ishdan Chiqqan</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-[#E2E8F0] mt-2">
            {stats.broken} <span className="text-xs font-normal text-slate-400">ta</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Nosoz deb topilganlar
          </p>
        </div>

      </div>

      {/* Analytics Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Equipment Types Distribution */}
        <div className="p-4 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E293B]">
            <h3 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
              <PieChart className="w-3.5 h-3.5 text-blue-500" />
              Jihoz Turlari Bo'yicha Taqsimot
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Turlari ({Object.keys(stats.typeCounts).length})</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(stats.typeCounts).map(([typeName, count]: [string, any]) => {
              const percentage = Math.round((count / (stats.total || 1)) * 100);
              return (
                <div key={typeName} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{typeName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{count} ta ({percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-slate-100 dark:bg-[#0B0F13] overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Registered Equipment */}
        <div className="p-4 bg-white dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E293B]">
            <h3 className="text-xs font-bold text-slate-900 dark:text-[#E2E8F0] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Oxirgi Qo'shilgan Jihozlar
            </h3>
          </div>

          <div className="space-y-1.5">
            {stats.recentEquipment.map((eq: Equipment) => (
              <div
                key={eq.id}
                className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-[#0B0F13] border border-slate-100 dark:border-[#1E293B] text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-blue-500 mr-2 text-[11px]">{eq.code}</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-[11px]">{eq.name}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Biriktirilgan: <b>{eq.currentUserName}</b>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-300 dark:border-slate-700">
                  {eq.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
