"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminNavbar } from './layout/AdminNavbar';
import { AdminSidebar } from './layout/AdminSidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function AdminLayout({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { user, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace('/login');
		}
		if (!isLoading && user && user.role !== 'ADMIN') {
			router.replace('/dashboard');
		}
	}, [user, isLoading, router]);

	if (isLoading) return <LoadingSpinner />;
	if (!user || user.role !== 'ADMIN') return null;

	return (
		<div className="flex h-screen overflow-hidden">
			<AdminSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<AdminNavbar />
				<main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
					<div className="mx-auto max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}
