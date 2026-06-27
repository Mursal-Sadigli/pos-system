import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  isCollapsed: boolean;
  isDarkMode: boolean;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isDarkMode: false,
      isMobileMenuOpen: false,

      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);