import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

const isBrowser = typeof window !== 'undefined';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string | null;
  permissions?: string[];
  mustChangePassword?: boolean;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      // ==================== LOGIN ====================
      login: async (email: string, password: string): Promise<LoginResponse> => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { user, token, refreshToken } = response.data.data as LoginResponse;

          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          set({ user, token, isLoading: false });
          return { user, token, refreshToken };
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || 'Login failed');
        }
      },

      // ==================== REGISTER ====================
      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          if (response.data.success) {
            // Auto login after register
            await get().login(data.email, data.password);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || 'Registration failed');
        }
      },

      // ==================== LOGOUT ====================
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },

      // ==================== CHECK AUTH ====================
      checkAuth: async () => {
        if (!isBrowser) return;

        const token = localStorage.getItem('token');
        if (!token) {
          set({ user: null, token: null, isLoading: false });
          return;
        }

        try {
          const response = await authApi.getMe();
          if (response?.data?.success) {
            set({
              user: response.data.data,
              token,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          const status = error?.status || error?.response?.status || error?.statusCode;
          if (status === 401 || status === 403) {
            get().logout();
          } else {
            set({ isLoading: false });
          }
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
    }
  )
);