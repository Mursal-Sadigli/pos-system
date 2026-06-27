import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  isCollapsed: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isDarkMode: false,

      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'ui-storage',
    }
  )
);