import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { getUsers, getUserById, saveUser, seedInitialDataIfEmpty } from '../services/db';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginAs: (role: UserRole) => Promise<void>;
  loginWithUid: (uid: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  isTelegram: boolean;
  telegramUserData: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTelegram, setIsTelegram] = useState<boolean>(false);
  const [telegramUserData, setTelegramUserData] = useState<any | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        await seedInitialDataIfEmpty();

        // Telegram WebApp detection
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
          setIsTelegram(true);
          const tgUser = tg.initDataUnsafe.user;
          setTelegramUserData(tgUser);

          // Check if user exists with tgUser.id
          const tgUid = `tg_${tgUser.id}`;
          let existing = await getUserById(tgUid);
          if (!existing) {
            existing = {
              uid: tgUid,
              name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'Telegram User',
              phone: '',
              role: 'user',
              telegramId: String(tgUser.id),
              status: 'active',
              createdAt: new Date().toISOString(),
              equipmentCount: 0
            };
            await saveUser(existing);
          }
          setUser(existing);
          setLoading(false);
          return;
        }

        // Standard saved user session
        const savedUid = localStorage.getItem('active_user_uid');
        if (savedUid) {
          const profile = await getUserById(savedUid);
          if (profile && profile.status === 'active') {
            setUser(profile);
            setLoading(false);
            return;
          }
        }

        // Default login as Admin for seamless initial testing
        const users = await getUsers();
        const adminUser = users.find((u) => u.role === 'admin') || users[0];
        if (adminUser) {
          setUser(adminUser);
          localStorage.setItem('active_user_uid', adminUser.uid);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const loginAs = async (role: UserRole) => {
    setLoading(true);
    try {
      const users = await getUsers();
      let targetUser = users.find((u) => u.role === role);
      if (!targetUser) {
        targetUser = {
          uid: role === 'admin' ? 'admin_default_id' : 'user_default_id',
          name: role === 'admin' ? 'Shaxzodbek Xolmatov' : 'Jasur Toshmatov',
          phone: '+998 90 123 45 67',
          role: role,
          position: role === 'admin' ? 'Bosh Administrator' : 'Aparaturachi Muhandis',
          status: 'active',
          createdAt: new Date().toISOString(),
          equipmentCount: 0
        };
        await saveUser(targetUser);
      }
      setUser(targetUser);
      localStorage.setItem('active_user_uid', targetUser.uid);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loginWithUid = async (uid: string): Promise<boolean> => {
    setLoading(true);
    try {
      const profile = await getUserById(uid);
      if (profile) {
        if (profile.status === 'blocked') {
          alert('Sizning hisobingiz bloklangan!');
          setLoading(false);
          return false;
        }
        setUser(profile);
        localStorage.setItem('active_user_uid', profile.uid);
        setLoading(false);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('active_user_uid');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await saveUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAs,
        loginWithUid,
        logout,
        updateProfile,
        isTelegram,
        telegramUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
