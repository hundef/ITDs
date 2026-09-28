import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  demoLogin: (role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (permissionKey: string) => boolean;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { hasPermission as checkPermission } from '../utils/permissions';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      // Add 5-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch('/api/auth/me', {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      clearTimeout(timeoutId);
      
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn('API returned non-JSON response when fetching current user session.');
        logout();
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        // Token invalid or user suspended/locked
        logout();
      }
    } catch (err) {
      console.error('Failed to verify session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, message: 'Server is temporarily unavailable. Please verify API backend is running.' };
      }
      const data = await res.json();
      
      // Handle both success and error responses
      if (res.ok && data.success && data.token) {
        localStorage.setItem('nexora_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      
      // Return error message from API
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Network error during login' };
    }
  };

  const demoLogin = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, message: 'Server is temporarily unavailable. Please verify API backend is running.' };
      }
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('nexora_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message || 'Demo login failed' };
    } catch (err) {
      return { success: false, message: 'Network error during demo login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('nexora_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const hasPermission = (permissionKey: string) => {
    return checkPermission(user, permissionKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        logout,
        hasPermission,
        updateUser,
        refreshUser
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
