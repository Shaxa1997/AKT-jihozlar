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
  BarChart3
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
    <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-[#1E293B] p-3 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      
      {/* Primary Action Button */}
      <button
        onClick={onOpenAddModal}
        className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow transition-all flex items-center justify-center gap-2 mb-4 border border-blue-500/30"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Jihoz Qo'shish</span>
      </button>

      {/* Main Navigation */}
      <div className="space-y-1 mb-5">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 mb-1.5 font-mono">
          Asosiy Menu
        </div>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161B22]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Admin Section (If admin role) */}
      {user?.role === 'admin' && (
        <div className="space-y-1 mb-5">
          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest px-2.5 mb-1.5 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3" /> Admin Boshqaruvi
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161B22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tools Section */}
      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-[#1E293B] space-y-1">
        <button
          onClick={onOpenQRScanner}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161B22] transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-blue-500" />
          <span>QR Skanerlash</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-slate-100 dark:bg-[#161B22] text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-[#30363D]'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161B22]'
          }`}
        >
          <User className="w-3.5 h-3.5 text-indigo-500" />
          <span>Mening Profilim</span>
        </button>
      </div>

    </aside>
  );
};
