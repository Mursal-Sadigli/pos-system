'use client';

import Link from 'next/link';
import { Heart, Globe, Send, Briefcase, Mail, Shield, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SuperAdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left Section - Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-red-600" />
            <span>© {currentYear} Super Admin Panel</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">v2.0.0</span>
            <span className="hidden md:inline">·</span>
            <span className="flex items-center gap-1 text-xs">
              Made with
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              by POS Team
            </span>
          </div>

          {/* Center - Quick Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link href="/super-admin" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/super-admin/stores" className="text-muted-foreground hover:text-foreground transition-colors">
              Mağazalar
            </Link>
            <Link href="/super-admin/admins" className="text-muted-foreground hover:text-foreground transition-colors">
              Adminlər
            </Link>
            <Link href="/super-admin/reports" className="text-muted-foreground hover:text-foreground transition-colors">
              Hesabatlar
            </Link>
            <Link href="/super-admin/settings" className="text-muted-foreground hover:text-foreground transition-colors">
              Parametrlər
            </Link>
          </div>

          {/* Right Section - Social & Status */}
          <div className="flex items-center gap-4">
            {/* System Status */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-green-500">
                  <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75" />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Sistem aktivdir</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-1">
              <Link
                href="#"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Globe className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Send className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Briefcase className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>

            {/* Version Badge */}
            <Badge variant="outline" className="hidden lg:flex items-center gap-1 text-[10px]">
              <Zap className="h-3 w-3" />
              v2.0.0
            </Badge>
          </div>
        </div>

        {/* Bottom Bar - Additional Info */}
        <div className="mt-4 border-t pt-4 text-center text-xs text-muted-foreground md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-center gap-4">
            <Link href="#" className="hover:underline">
              Şərtlər
            </Link>
            <Link href="#" className="hover:underline">
              Məxfilik
            </Link>
            <Link href="#" className="hover:underline">
              Dəstək
            </Link>
          </div>
          <div className="mt-2 md:mt-0">
            <span>
              Bu sistem{" "}
              <span className="font-medium text-foreground">POS System</span>{" "}
              tərəfindən təmin edilir
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}