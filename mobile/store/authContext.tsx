import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { Storage } from '../utils/storage';
import { authService } from '../services/authService';
import { setOnUnauthorizedCallback } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Register 401 callback to clear state on unauthorized responses
    setOnUnauthorizedCallback(() => {
      setUser(null);
      setToken(null);
    });

    // Hydrate existing session from SecureStore and refresh from backend
    const loadSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          Storage.getToken(),
          Storage.getUser(),
        ]);

        if (storedToken && storedUser) {
          // Set initial cached state so app can open immediately
          setToken(storedToken);
          setUser(storedUser);
          
          // Fetch fresh user data from backend
          try {
             const { apiClient } = require('../services/api');
             const res = await apiClient.get('/auth/me');
             const userData = res.data?.user || res.data?.data;
             if (userData) {
                setUser(userData);
                await Storage.setUser(userData);
             }
          } catch (apiErr) {
             console.warn('Failed to fetch fresh user data from backend:', apiErr);
          }
        } else if (storedToken && !storedUser) {
          setToken(storedToken);
          try {
             const { apiClient } = require('../services/api');
             const res = await apiClient.get('/auth/me');
             const userData = res.data?.user || res.data?.data;
             if (userData) {
                setUser(userData);
                await Storage.setUser(userData);
             }
          } catch (apiErr) {
             console.warn('Failed to restore user from token:', apiErr);
          }
        }
      } catch (err) {
        console.warn('Failed to restore session from SecureStore:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: import('../types/auth').RegisterCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      // Cancel patient local notifications on this device
      const { NotificationService } = require('../utils/notifications');
      await NotificationService.cancelAllMedicineReminders();
    } catch (e) {
      console.warn('Error during logout:', e);
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    Storage.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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
