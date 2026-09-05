import React from 'react';
import { Home, Package, Plus, AlertTriangle, User, LayoutDashboard } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 lg:hidden px-3 py-2 shadow-2xl safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-between min-h-[52px]">
        
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all relative ${
            activeTab === 'home'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] leading-none font-bold">Bosh sahifa</span>
          {activeTab === 'home' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 absolute bottom-1" />
          )}
        </button>

        {/* Equipment List */}
        <button
          onClick={() => onSelectTab('equipment')}
          className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all relative ${
            activeTab === 'equipment'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] leading-none font-bold">Jihozlar</span>
          {activeTab === 'equipment' && (
            <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 absolute bottom-1" />
          )}
        </button>

        {/* Central Creative Floating Add Button */}
        <div className="flex-1 flex justify-center -mt-7">
          <button
            onClick={onOpenAddModal}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 active:scale-90 transition-all border-4 border-white dark:border-[#0F172A] flex items-center justify-center relative group"
            title="Yangi jihoz qo'shish"
          >
            <Plus className="w-7 h-7 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            <span className="w-full h-full rounded-2xl bg-blue-400 opacity-0 group-hover:opacity-20 animate-ping absolute" />
          </button>
        </div>

        {/* Broken Equipment */}
        <button
          onClick={() => onSelectTab('broken')}
          className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all relative ${
            activeTab === 'broken'
              ? 'text-rose-600 dark:text-rose-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px] leading-none font-bold">Nosozlar</span>
          {activeTab === 'broken' && (
            <span className="w-1 h-1 rounded-full bg-rose-600 dark:bg-rose-400 absolute bottom-1" />
          )}
        </button>

        {/* Profile / Admin */}
        <button
          onClick={() => onSelectTab(user?.role === 'admin' ? 'admin' : 'profile')}
          className={`flex-1 min-h-[46px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all relative ${
            activeTab === 'profile' || activeTab === 'admin'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {user?.role === 'admin' ? (
            <LayoutDashboard className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] leading-none font-bold">
            {user?.role === 'admin' ? 'Admin' : 'Profil'}
          </span>
          {(activeTab === 'profile' || activeTab === 'admin') && (
            <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 absolute bottom-1" />
          )}
        </button>

      </div>
    </nav>
  );
};
