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
  store_id?: string | null;
  storeName?: string | null;
  store_name?: string | null;
  permissions?: string[];
  mustChangePassword?: boolean;
  must_change_password?: boolean;
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
  login: (email: string, password: string) => Promise<any>;
  verify2FA: (tempToken: string, otp: string) => Promise<LoginResponse>;
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
      login: async (email: string, password: string): Promise<any> => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const data = response.data.data;

          if (data.requires2FA) {
            set({ isLoading: false });
            return data; // Return tempToken and requires2FA
          }

          const { user: rawUser, token, refreshToken } = data as LoginResponse;

          const user = {
            ...rawUser,
            storeId: (rawUser as any).store_id || rawUser.storeId || null,
            storeName: (rawUser as any).store_name || rawUser.storeName || null,
          };

          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          set({ user, token, isLoading: false });
          return { user, token, refreshToken };
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.message || 'Login failed');
        }
      },

      // ==================== VERIFY 2FA ====================
      verify2FA: async (tempToken: string, otp: string): Promise<LoginResponse> => {
        set({ isLoading: true });
        try {
          const response = await authApi.verify2FA({ tempToken, otp });
          const { user: rawUser, token, refreshToken } = response.data.data as LoginResponse;

          const user = {
            ...rawUser,
            storeId: (rawUser as any).store_id || rawUser.storeId || null,
            storeName: (rawUser as any).store_name || rawUser.storeName || null,
          };

          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          set({ user, token, isLoading: false });
          return { user, token, refreshToken };
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.message || error?.message || '2FA Verification failed');
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

        // Mövcud user varsa yükləmə ekranı göstərmə — fon rejimdə yenilə
        const currentUser = get().user;
        if (!currentUser) {
          set({ isLoading: true });
        }

        try {
          const response = await authApi.getMe();
          if (response?.data?.success) {
            const rawUser = response.data.data;
            const normalizedUser = {
              ...rawUser,
              storeId: rawUser.store_id || rawUser.storeId || null,
              storeName: rawUser.store_name || rawUser.storeName || null,
            };
            set({
              user: normalizedUser,
              token,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          // Yalnız 401 və ya 403 aldıqda logout et
          // Digər xətalarda (şəbəkə xətası, 404 və s.) user-i saxla
          const status =
            error?.status ||
            error?.statusCode ||
            error?.code;
          if (status === 401 || status === 403) {
            // refresh token cəhd et
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              try {
                const refreshResp = await authApi.refreshToken(refreshToken);
                if (refreshResp?.data?.success) {
                  const { token: newToken, user: rawUser } = refreshResp.data.data;
                  const updatedUser = {
                    ...rawUser,
                    storeId: rawUser.store_id || rawUser.storeId || null,
                    storeName: rawUser.store_name || rawUser.storeName || null,
                  };
                  localStorage.setItem('token', newToken);
                  set({ user: updatedUser, token: newToken, isLoading: false });
                  return;
                }
              } catch {
                // refresh da uğursuz oldu - logout et
              }
            }
            get().logout();
          }
          set({ isLoading: false });
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