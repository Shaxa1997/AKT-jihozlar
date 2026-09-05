import React from 'react';
import { Home, Package, Plus, AlertTriangle, User, LayoutDashboard, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab = 
  | 'home' 
  | 'equipment' 
  | 'add' 
  | 'broken' 
  | 'profile' 
  | 'admin' 
  | 'users' 
  | 'departments' 
  | 'types' 
  | 'reports' 
  | 'audit'
  | 'warranty'
  | 'support'
  | 'statistics';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal
}) => {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 lg:hidden px-3 py-1.5 shadow-2xl safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-between min-h-[52px]">
        
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] leading-none font-medium">Bosh sahifa</span>
        </button>

        {/* Equipment List */}
        <button
          onClick={() => onSelectTab('equipment')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
            activeTab === 'equipment'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] leading-none font-medium">Jihozlar</span>
        </button>

        {/* Central Floating Add Equipment Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenAddModal}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 active:scale-90 transition-all border-2 border-white dark:border-[#0F172A] flex items-center justify-center"
            title="Yangi jihoz qo'shish"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Broken Equipment */}
        <button
          onClick={() => onSelectTab('broken')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
            activeTab === 'broken'
              ? 'text-rose-600 dark:text-rose-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px] leading-none font-medium">Nosozlar</span>
        </button>

        {/* Profile / Admin */}
        <button
          onClick={() => onSelectTab(user?.role === 'admin' ? 'admin' : 'profile')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
            activeTab === 'profile' || activeTab === 'admin'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {user?.role === 'admin' ? (
            <LayoutDashboard className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] leading-none font-medium">
            {user?.role === 'admin' ? 'Admin' : 'Profil'}
          </span>
        </button>

      </div>
    </nav>
  );
};
