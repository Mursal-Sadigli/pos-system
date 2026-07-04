import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const { 
    user, 
    token, 
    isLoading, 
    login, 
    register,
    logout, 
    setUser, 
    setToken,
    checkAuth 
  } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout: () => {
      logout();
      router.push('/login');
    },
    setUser,
    setToken,
    checkAuth,
  };
}