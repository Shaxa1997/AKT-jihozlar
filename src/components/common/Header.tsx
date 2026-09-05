import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Bell, 
  QrCode, 
  Search, 
  Smartphone,
  Sparkles,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, markNotificationAsRead } from '../../services/db';
import { AppNotification } from '../../types';

interface HeaderProps {
  onOpenQRScanner: () => void;
  onSearchChange?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQRScanner, onSearchChange }) => {
  const { user, loginAs, isTelegram } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadNotifs() {
      if (user) {
        const notifs = await getNotifications(user.uid, user.role);
        setNotifications(notifs);
      }
    }
    loadNotifs();
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#1E293B]/80 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-blue-500/25 border border-white/20">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-none bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-300 bg-clip-text text-transparent">
                Jihozlar Nazorati
              </h1>
              {isTelegram && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5" /> TG App
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1 font-mono mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v2.5.0 • Realtime System
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-sm hidden md:block relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Qidiruv: kod, nom, F.I.O..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-[#E2E8F0] font-medium transition-all"
          />
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* QR Scanner Trigger Button */}
          <button
            onClick={onOpenQRScanner}
            title="QR Skanerlash"
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold border border-white/10 shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Skaner</span>
          </button>

          {/* Quick Role Switcher Pill */}
          <div className="bg-slate-100 dark:bg-[#0B0F13] p-1 border border-slate-200 dark:border-[#30363D] rounded-xl flex items-center text-xs shadow-inner">
            <button
              onClick={() => loginAs('admin')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                user?.role === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => loginAs('user')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                user?.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Xodim
            </button>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 active:scale-90"
            title="Mavzuni o'zgartirish"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 active:scale-90 relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#30363D] p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    Xabarnomalar ({notifications.length})
                  </h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6 font-mono">
                      Yangi xabarnoma mavjud emas
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.isRead 
                            ? 'bg-slate-50 dark:bg-[#0B0F13]/50 border-slate-200/60 dark:border-[#1E293B] text-slate-500' 
                            : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/80 text-slate-900 dark:text-white font-medium shadow-sm'
                        }`}
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100">{n.title}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1.5 flex justify-end">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          {user && (
            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-[#1E293B]">
              <div className="relative">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {user.role === 'admin' ? 'Administrator' : 'Xodim'}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
