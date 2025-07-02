import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: 'customer' | 'worker' | 'admin_umum' | 'admin_perusahaan';
  profileImageUrl?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export function useTokenAuth() {
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

  // Login function
  const login = (token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      token
    });
  };

  // Logout function
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

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  // Check if user has specific role
  const hasRole = (role: string | string[]): boolean => {
    if (!authState.user?.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(authState.user.role);
    }
    
    return authState.user.role === role;
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return hasRole(['admin_umum', 'admin_perusahaan']);
  };

  // Check if user is worker
  const isWorker = (): boolean => {
    return hasRole('worker');
  };

  // Check if user is customer
  const isCustomer = (): boolean => {
    return hasRole('customer');
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isWorker,
    isCustomer
  };
}