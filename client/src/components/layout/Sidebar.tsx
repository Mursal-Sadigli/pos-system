'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tag,
  BarChart3,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'İdarə paneli', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Məhsullar', href: '/products', icon: Package },
  { name: 'Kateqoriyalar', href: '/categories', icon: Tag },
  { name: 'Sifarişlər', href: '/orders', icon: FileText },
  { name: 'Müştərilər', href: '/customers', icon: Users },
  { name: 'Hesabatlar', href: '/reports', icon: BarChart3 },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useUIStore();
  const { logout } = useAuth();

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-[70px]' : 'w-[240px]'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-semibold">POS System</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground',
                  isCollapsed && 'justify-center px-0'
                )}
              >
                <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-foreground',
            isCollapsed && 'justify-center px-0'
          )}
          onClick={logout}
        >
          <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
          {!isCollapsed && 'Çıxış'}
        </Button>
      </div>
    </div>
  );
}