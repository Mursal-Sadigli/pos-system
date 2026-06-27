'use client';

import { useEffect, useRef, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, toggleMobileMenu } = useUIStore();
  const breadcrumbs = useBreadcrumb();

  const [notifications] = useState(3);
  const [messages] = useState(2);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('az-AZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = currentTime.toLocaleDateString('az-AZ', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

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

        {/* Orta tərəf — Global axtarış */}
        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              className="pl-10"
              placeholder="Axtar... (Ctrl + K)"
              aria-label="Global axtarış"
            />
          </div>
        </div>

        {/* Sağ tərəf */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasiyalar">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
                {notifications}
              </span>
            )}
          </Button>

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
              <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card p-2 shadow-lg">
                <div className="mb-2 rounded-lg bg-muted p-3">
                  <p className="text-sm font-semibold">{user?.name ?? 'İstifadəçi'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
                </div>
                <Link
                  href="/settings/profile"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  href="/settings"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Parametrlər
                </Link>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
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