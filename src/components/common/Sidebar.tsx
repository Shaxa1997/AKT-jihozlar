import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  AlertTriangle, 
  Users, 
  Building2, 
  Grid, 
  FileSpreadsheet, 
  History, 
  User, 
  ShieldCheck,
  QrCode,
  FileCheck,
  Wrench,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './BottomNav';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenQRScanner: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenQRScanner
}) => {
  const { user } = useAuth();

  const mainNav = [
    { id: 'home', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'equipment', label: 'Barcha Jihozlar', icon: Package },
    { id: 'broken', label: 'Nosoz Jihozlar', icon: AlertTriangle, badgeColor: 'bg-rose-500' },
    { id: 'warranty', label: 'Kafolat xati', icon: FileCheck },
    { id: 'support', label: 'Texnik yordam', icon: Wrench },
    { id: 'statistics', label: 'Statistika (Raqamli)', icon: BarChart3 }
  ];

  const adminNav = [
    { id: 'admin', label: 'Admin Statistika', icon: ShieldCheck },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'departments', label: 'Bo\'limlar', icon: Building2 },
    { id: 'types', label: 'Jihoz turlari', icon: Grid },
    { id: 'reports', label: 'Hisobot & Export', icon: FileSpreadsheet },
    { id: 'audit', label: 'Audit Loglar', icon: History }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-[#1E293B]/80 p-3.5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto space-y-4">
      
      {/* Primary Action Button */}
      <button
        onClick={onOpenAddModal}
        className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20 group"
      >
        <PlusCircle className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
        <span>Yangi Jihoz Qo'shish</span>
      </button>

      {/* Main Navigation */}
      <div className="space-y-1">
        <div className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-blue-500" /> Asosiy Bo'limlar
        </div>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161B22] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Admin Section (If admin role) */}
      {user?.role === 'admin' && (
        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
          <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest px-3 mb-1 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3 h-3 text-blue-500" /> Admin Boshqaruvi
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161B22] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Tools Section */}
      <div className="mt-auto pt-3 border-t border-slate-200/80 dark:border-[#1E293B] space-y-1.5">
        <button
          onClick={onOpenQRScanner}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161B22] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
        >
          <QrCode className="w-4 h-4 text-blue-500" />
          <span>QR Skanerlash</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-slate-100 dark:bg-[#161B22] text-slate-900 dark:text-white border border-slate-300 dark:border-[#30363D]'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161B22]'
          }`}
        >
          <User className="w-4 h-4 text-indigo-500" />
          <span>Mening Profilim</span>
        </button>
      </div>

    </aside>
  );
};
