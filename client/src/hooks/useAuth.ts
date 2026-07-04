import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function useAuth() {
  const router = useRouter();
  const hasChecked = useRef(false);
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

  // Yalnız bir dəfə yoxla, artıq user varsa checkAuth çağırma
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      if (!user) {
        checkAuth();
      }
    }
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