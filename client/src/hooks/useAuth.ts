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

  // Hər mount-da bir dəfə checkAuth çağır - user localStorage-dən gəlsə belə
  // store_name kimi məlumatların aktuallığını təmin edir
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkAuth(); // həmişə yoxla — user varsa belə fon rejimdə yenilə
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