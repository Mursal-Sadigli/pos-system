import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'viewer';
  storeId: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Mock login - replace with actual API call
          const mockUser = {
            id: '1',
            name: 'John Doe',
            email: email,
            role: 'admin' as const,
            storeId: '1',
          };
          const mockToken = 'mock-jwt-token';

          set({ user: mockUser, token: mockToken, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
    }
  )
);