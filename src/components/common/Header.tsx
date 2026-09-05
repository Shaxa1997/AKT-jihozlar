import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Sun, 
  Moon, 
  Bell, 
  QrCode, 
  Search, 
  LogOut, 
  UserCheck, 
  Smartphone,
  Sparkles,
  X
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
  const { user, loginAs, logout, isTelegram } = useAuth();
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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A] backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-slate-900 dark:text-[#E2E8F0] tracking-tight leading-none">
                Jihozlar Nazorati
              </h1>
              {isTelegram && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> TG Mini App
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-mono">
              v2.4.0 • Realtime Control
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm hidden md:block relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Qidiruv: kod, nom, F.I.O..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-slate-100 dark:bg-[#0B0F13] border border-slate-200 dark:border-[#30363D] focus:border-blue-500 outline-none text-slate-900 dark:text-[#E2E8F0] font-mono placeholder:text-slate-500"
          />
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-2">
          
          {/* QR Scanner Trigger */}
          <button
            onClick={onOpenQRScanner}
            title="QR Skaner"
            className="px-2.5 py-1.5 rounded bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Tekshiruv</span>
          </button>

          {/* Role Switcher Pill (Quick Test / Role Select) */}
          <div className="bg-slate-100 dark:bg-[#0B0F13] p-0.5 border border-slate-200 dark:border-[#30363D] rounded flex items-center text-xs">
            <button
              onClick={() => loginAs('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                user?.role === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => loginAs('user')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                user?.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Xodim
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Mavzuni o'zgartirish"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F172A] rounded-lg shadow-2xl border border-slate-200 dark:border-[#30363D] p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                  <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Xabarnomalar ({notifications.length})
                  </h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 font-mono">
                      Yangi xabarlar yo'q
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`p-2 rounded border text-xs cursor-pointer transition-all ${
                          n.isRead 
                            ? 'bg-slate-50 dark:bg-[#0B0F13]/50 border-slate-100 dark:border-[#1E293B] text-slate-500' 
                            : 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/30 text-slate-900 dark:text-white font-medium'
                        }`}
                      >
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{n.title}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
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
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#1E293B]">
              <div className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs uppercase overflow-hidden border border-slate-300 dark:border-slate-700">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.substring(0, 2)
                )}
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-900 dark:text-[#E2E8F0] truncate max-w-[110px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize font-mono">
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
