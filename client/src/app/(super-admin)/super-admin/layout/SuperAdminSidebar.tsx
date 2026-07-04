'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  LayoutDashboard,
  Store,
  Users,
  UserCog,
  FileText,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Plus,
  TrendingUp,
  Activity,
  Database,
  Server,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  subItems?: NavItem[];
}

const navigationBase: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Mağazalar',
    href: '/super-admin/stores',
    icon: Store,
    subItems: [
      { name: 'Bütün Mağazalar', href: '/super-admin/stores', icon: Store },
      { name: 'Yeni Mağaza', href: '/super-admin/stores/new', icon: Plus },
    ],
  },
  {
    name: 'İstifadəçilər',
    href: '/super-admin/users',
    icon: Users,
    subItems: [
      { name: 'Bütün İstifadəçilər', href: '/super-admin/users', icon: Users },
      { name: 'Aktiv İstifadəçilər', href: '/super-admin/users?status=active', icon: Activity },
      { name: 'Deaktiv İstifadəçilər', href: '/super-admin/users?status=inactive', icon: AlertCircle },
    ],
  },
  {
    name: 'Adminlər',
    href: '/super-admin/admins',
    icon: UserCog,
    subItems: [
      { name: 'Bütün Adminlər', href: '/super-admin/admins', icon: UserCog },
      { name: 'Yeni Admin', href: '/super-admin/admins/new', icon: Plus },
    ],
  },
  {
    name: 'Hesabatlar',
    href: '/super-admin/reports',
    icon: FileText,
    subItems: [
      { name: 'Sistem Hesabatı', href: '/super-admin/reports/system', icon: Server },
      { name: 'Mağaza Hesabatları', href: '/super-admin/reports/stores', icon: Store },
      { name: 'İstifadəçi Hesabatları', href: '/super-admin/reports/users', icon: Users },
    ],
  },
  {
    name: 'Loglar',
    href: '/super-admin/logs',
    icon: ScrollText,
    subItems: [
      { name: 'Sistem Logları', href: '/super-admin/logs/system', icon: Server },
      { name: 'Təhlükəsizlik Logları', href: '/super-admin/logs/security', icon: Shield },
      { name: 'İstifadəçi Logları', href: '/super-admin/logs/users', icon: Users },
    ],
  },
  {
    name: 'Parametrlər',
    href: '/super-admin/settings',
    icon: Settings,
    subItems: [
      { name: 'Ümumi', href: '/super-admin/settings/general', icon: Settings },
      { name: 'Təhlükəsizlik', href: '/super-admin/settings/security', icon: Shield },
      { name: 'Backup', href: '/super-admin/settings/backup', icon: Database },
    ],
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useUIStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/super-admin/stores', '/super-admin/users']);
  const [navigation, setNavigation] = useState<NavItem[]>(navigationBase);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [usersRes, storesRes] = await Promise.all([
          api.get('/users', { params: { limit: 1, page: 1 } }),
          api.get('/stores', { params: { limit: 1, page: 1 } }),
        ]);

        const usersTotal = usersRes.data?.data?.pagination?.total ?? 0;
        const storesTotal = storesRes.data?.data?.pagination?.total ?? 0;

        setNavigation((prev) => prev.map((item) => {
          if (item.href === '/super-admin/users') {
            return { ...item, badge: usersTotal };
          }
          if (item.href === '/super-admin/stores') {
            return { ...item, badge: storesTotal };
          }
          return item;
        }));
      } catch {
        setNavigation((prev) => prev.map((item) => ({ ...item, badge: undefined })));
      }
    };

    loadCounts();
  }, []);

  useEffect(() => {
    navigation.forEach((item) => {
      if (pathname.startsWith(item.href) && !expandedItems.includes(item.href)) {
        setExpandedItems((prev) => [...prev, item.href]);
      }
    });
  }, [pathname]);

  const toggleExpand = (href: string) => {
    if (isCollapsed) return;
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isSubActive = (subItems?: NavItem[]) => {
    if (!subItems) return false;
    return subItems.some((sub) => isActive(sub.href));
  };

  return (
    <div
      className={cn(
        'relative flex h-full min-w-0 flex-col overflow-hidden border-r bg-white dark:bg-gray-900 transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/super-admin" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-red-600 dark:text-red-400">Super Admin</span>
              <span className="ml-1 text-xs text-gray-400">v2.0</span>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 mx-auto">
            <Shield className="h-5 w-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('h-8 w-8', isCollapsed && 'absolute -right-3 top-3')}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isItemActive = isActive(item.href);
              const isItemExpanded = expandedItems.includes(item.href);
              const isSubItemActive = isSubActive(item.subItems);

              // If collapsed, show only tooltip
              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger>
                      <Link
                        href={item.href}
                        className={cn(
                          'relative flex h-11 min-w-0 items-center justify-center rounded-lg px-0 py-2 text-sm transition-all',
                          isItemActive || isSubItemActive
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={item.href} className="space-y-1">
                  {/* Main Item */}
                  <button
                    onClick={() => hasSubItems && toggleExpand(item.href)}
                    className={cn(
                      'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all',
                      isItemActive || isSubItemActive
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3 flex-1 min-w-0 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-red-500 text-white hover:bg-red-600">
                        {item.badge}
                      </Badge>
                    )}
                    {hasSubItems && (
                      <ChevronRight
                        className={cn(
                          'ml-2 h-4 w-4 transition-transform',
                          isItemExpanded && 'rotate-90'
                        )}
                      />
                    )}
                  </button>

                  {/* Sub Items */}
                  {hasSubItems && isItemExpanded && (
                    <div className="ml-6 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                      {item.subItems!.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            'flex items-center rounded-lg px-3 py-2 text-sm transition-all',
                            isActive(sub.href)
                              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                          )}
                        >
                          <sub.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="ml-3">{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </nav>
      </ScrollArea>

      {/* Bottom Section - User Info & Logout */}
      <div className="border-t p-3">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white">
                <span className="text-sm font-bold">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SA'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.name || 'Super Admin'}</p>
                <p className="truncate text-xs text-gray-500">{user?.email || 'admin@pos.com'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıxış
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white transition-all hover:scale-105">
                  <span className="text-sm font-bold">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SA'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user?.name || 'Super Admin'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Çıxış</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}