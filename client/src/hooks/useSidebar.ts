'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from '@/types/sidebar';

export const useSidebar = (items: SidebarItem[]) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    // Auto expand current path
    items.forEach((item) => {
      if (pathname.startsWith(item.href) && !expandedItems.includes(item.href)) {
        setExpandedItems((prev) => [...prev, item.href]);
      }
    });
  }, [pathname, items]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isSubActive = (subItems?: SidebarItem[]) => {
    if (!subItems) return false;
    return subItems.some((sub) => isActive(sub.href));
  };

  return {
    expandedItems,
    toggleExpand,
    isActive,
    isSubActive,
  };
};