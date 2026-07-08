'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  MessageCircle,
  User,
  Menu,
  Sun,
  Moon,
  Store,
  X,
  CheckCheck,
  Info,
  AlertTriangle,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { useSocket } from '@/hooks/useSocket';
import { initSocket } from '@/lib/socket';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'order' | 'stock';
  isRead: boolean;
  createdAt: Date;
}

// ─── Icon helper ──────────────────────────────────────────────────────────────
function NotifIcon({ type }: { type: NotificationItem['type'] }) {
  const cls = 'h-4 w-4 shrink-0 mt-0.5';
  switch (type) {
    case 'warning':  return <AlertTriangle className={`${cls} text-yellow-500`} />;
    case 'success':  return <CheckCheck    className={`${cls} text-green-500`} />;
    case 'order':    return <ShoppingCart  className={`${cls} text-blue-500`} />;
    case 'stock':    return <Package       className={`${cls} text-purple-500`} />;
    default:         return <Info          className={`${cls} text-primary`} />;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, toggleMobileMenu } = useUIStore();
  const breadcrumbs = useBreadcrumb();

  const [notifList, setNotifList] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [messages]  = useState(2);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const searchRef   = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  const unreadCount = notifList.filter((n) => !n.isRead).length;

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Keyboard shortcut (Ctrl+K) ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Close menus on outside click ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Start socket connection on mount ───────────────────────────────────────
  useEffect(() => {
    initSocket(); // connects and joins room
  }, []);

  // ── Real-time notification listener ───────────────────────────────────────
  const handleNotification = useCallback((data: Omit<NotificationItem, 'isRead' | 'createdAt'> & { createdAt?: string }) => {
    const newNotif: NotificationItem = {
      id: data.id || `notif-${Date.now()}`,
      title: data.title || 'Bildiriş',
      message: data.message || '',
      type: (data.type as NotificationItem['type']) || 'info',
      isRead: false,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    };

    setNotifList((prev) => [newNotif, ...prev].slice(0, 50)); // max 50

    // Show toast
    toast(newNotif.title + (newNotif.message ? ` — ${newNotif.message}` : ''), {
      icon: '🔔',
      duration: 4000,
    });
  }, []);

  useSocket('notification', handleNotification);

  // ── Actions ────────────────────────────────────────────────────────────────
  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const remove = (id: string) => {
    setNotifList((prev) => prev.filter((n) => n.id !== id));
  };

  // ── Formatting ─────────────────────────────────────────────────────────────
  const formattedTime = currentTime.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('az-AZ', { weekday: 'short', month: 'short', day: 'numeric' });

  function timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60)  return 'İndicə';
    if (diff < 3600) return `${Math.floor(diff / 60)} dəq əvvəl`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`;
    return date.toLocaleDateString('az-AZ');
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 items-center gap-4 px-4 md:px-6">

        {/* Sol tərəf */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Menyunu aç"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="hidden text-lg font-semibold sm:inline">POS sistemi</span>
          </Link>

          <nav className="hidden text-sm text-muted-foreground lg:flex gap-2">
            {breadcrumbs.map((item, index) => (
              <span key={item.href} className="flex items-center gap-2">
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        </div>

        {/* Orta hissə boş qala bilər və ya logo mərkəzə çəkilə bilər, amma hələki boş buraxırıq */}
        <div className="hidden flex-1 md:flex"></div>

        {/* Sağ tərəf */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">

          {/* ─── Bell button + dropdown ──────────────────────────────── */}
          <div className="relative" ref={notifRef}>
            <Button
              id="navbar-notifications-btn"
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Bildirişlər"
              onClick={() => setNotifOpen((v) => !v)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Dropdown panel */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-xl z-50">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Bildirişlər</span>
                    {unreadCount > 0 && (
                      <span className="inline-flex h-5 items-center rounded-full bg-destructive/10 px-2 text-xs font-medium text-destructive">
                        {unreadCount} yeni
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Hamısını oxu
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifList.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 opacity-30" />
                      <p className="text-sm">Bildiriş yoxdur</p>
                    </div>
                  ) : (
                    notifList.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`flex gap-3 border-b px-4 py-3 cursor-pointer transition-colors last:border-0
                          ${n.isRead ? 'opacity-60 hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}
                      >
                        <NotifIcon type={n.type} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight ${n.isRead ? '' : 'font-semibold'}`}>
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {n.message}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] text-muted-foreground/70">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                          className="shrink-0 rounded p-0.5 hover:bg-muted"
                          aria-label="Sil"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {/* ─────────────────────────────────────────────────────────── */}

          <Button variant="ghost" size="icon" className="relative" aria-label="Mesajlar">
            <MessageCircle className="h-5 w-5" />
            {messages > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                {messages}
              </span>
            )}
          </Button>

          <div className="hidden flex-col items-end text-right sm:flex">
            <span className="text-sm font-medium">{formattedTime}</span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              className="h-10 w-10 rounded-full"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="İstifadəçi menyusu"
            >
              <User className="h-5 w-5" />
            </Button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card p-2 shadow-lg z-50">
                <div className="mb-2 rounded-lg bg-muted p-3">
                  <p className="text-sm font-semibold">{user?.name ?? 'İstifadəçi'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
                  {(user?.store_name || user?.storeName) && (
                    <p className="mt-1 text-xs font-medium text-primary flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {user.store_name || user.storeName}
                    </p>
                  )}
                </div>
                <Link
                  href={user?.role === 'super-admin' ? '/super-admin/settings/general' : '/user/settings/profile'}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  href={user?.role === 'super-admin' ? '/super-admin/settings' : '/user/settings'}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Parametrlər
                </Link>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => { setIsMenuOpen(false); logout(); }}
                >
                  Çıxış
                </button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Tema dəyiş"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}