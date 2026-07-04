'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminNavbar } from './layout/SuperAdminNavbar';
import { SuperAdminSidebar } from './layout/SuperAdminSidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
    if (!isLoading && user && user.role !== 'SUPER_ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SuperAdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminNavbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}