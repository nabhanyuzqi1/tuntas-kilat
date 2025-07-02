// Authentication state management and utilities
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from './queryClient';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan';
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true
  };
  private listeners: Array<(state: AuthState) => void> = [];

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        
        // Verify token is still valid
        const response = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          this.setAuthState({
            isAuthenticated: true,
            user,
            token,
            loading: false
          });
          return;
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }

    // Clear invalid auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    this.setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false
    });
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.authState);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private setAuthState(newState: AuthState) {
    this.authState = newState;
    this.listeners.forEach(listener => listener(newState));
  }

  async login(credentials: { email: string; password: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        this.setAuthState({
          isAuthenticated: true,
          user: result.user,
          token: result.token,
          loading: false
        });

        return { success: true, message: 'Login berhasil' };
      } else {
        return { success: false, message: result.message || 'Login gagal' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Terjadi kesalahan saat login' };
    }
  }

  async register(userData: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        this.setAuthState({
          isAuthenticated: true,
          user: result.user,
          token: result.token,
          loading: false
        });

        return { success: true, message: 'Registrasi berhasil' };
      } else {
        return { success: false, message: result.message || 'Registrasi gagal' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Terjadi kesalahan saat registrasi' };
    }
  }

  async sendWhatsAppOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest('POST', '/api/auth/whatsapp/send-otp', { phoneNumber });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Send WhatsApp OTP error:', error);
      return { success: false, message: 'Gagal mengirim OTP WhatsApp' };
    }
  }

  async verifyWhatsAppOTP(phoneNumber: string, otp: string, userData?: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest('POST', '/api/auth/whatsapp/verify-otp', {
        phoneNumber,
        otp,
        userData
      });
      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        this.setAuthState({
          isAuthenticated: true,
          user: result.user,
          token: result.token,
          loading: false
        });
      }

      return result;
    } catch (error) {
      console.error('Verify WhatsApp OTP error:', error);
      return { success: false, message: 'Gagal memverifikasi OTP WhatsApp' };
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    this.setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false
    });
  }

  clearAuth() {
    this.logout();
  }

  getRedirectPath(role: string): string {
    switch (role) {
      case 'admin_umum':
      case 'admin_perusahaan':
        return '/admin';
      case 'worker':
        return '/worker';
      case 'customer':
      default:
        return '/';
    }
  }
}

export const authManager = AuthManager.getInstance();

// React Context for Authentication
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  sendWhatsAppOTP: (phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyWhatsAppOTP: (phoneNumber: string, otp: string, userData?: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  getRedirectPath: (role: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authManager.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    sendWhatsAppOTP: authManager.sendWhatsAppOTP.bind(authManager),
    verifyWhatsAppOTP: authManager.verifyWhatsAppOTP.bind(authManager),
    logout: authManager.logout.bind(authManager),
    getRedirectPath: authManager.getRedirectPath.bind(authManager),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}