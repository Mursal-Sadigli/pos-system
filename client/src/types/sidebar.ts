import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  subItems?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  isCollapsed: boolean;
  onToggle: () => void;
}