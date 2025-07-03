import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export function useSimpleAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const user = JSON.parse(userData);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            token
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password
      });
      
      const result = await response.json();

      if (result.success && result.token && result.user) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          token: result.token
        });
        
        return { success: true, message: 'Login berhasil', user: result.user };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: result.message || 'Login gagal' };
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Terjadi kesalahan saat login' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const result = await response.json();

      if (result.success && result.token && result.user) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          token: result.token
        });
        
        return { success: true, message: 'Registrasi berhasil', user: result.user };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: result.message || 'Registrasi gagal' };
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Terjadi kesalahan saat registrasi' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    });
  };

  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin_umum':
      case 'admin_perusahaan':
        return '/admin/dashboard';
      case 'worker':
        return '/worker/dashboard';
      case 'customer':
      default:
        return '/dashboard';
    }
  };

  const sendWhatsAppOTP = async (phoneNumber: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await apiRequest('POST', '/api/auth/whatsapp/send-otp', { phoneNumber });
      const result = await response.json();
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Send WhatsApp OTP error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Gagal mengirim OTP WhatsApp' };
    }
  };

  const verifyWhatsAppOTP = async (phoneNumber: string, otp: string, userData?: any) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await apiRequest('POST', '/api/auth/whatsapp/verify-otp', {
        phoneNumber,
        otp,
        userData
      });
      const result = await response.json();

      if (result.success && result.token && result.user) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          token: result.token
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }

      return result;
    } catch (error) {
      console.error('Verify WhatsApp OTP error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Gagal memverifikasi OTP WhatsApp' };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    getRedirectPath,
    sendWhatsAppOTP,
    verifyWhatsAppOTP
  };
}