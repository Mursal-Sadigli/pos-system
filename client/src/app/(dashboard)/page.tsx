'use client';

import { StatsCards } from '@/components/dashboard/StatsCards';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityLog } from '@/components/dashboard/ActivityLog';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <QuickActions />
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <SalesChart />
        </div>
        <div className="col-span-3">
          <TopProducts />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentOrders />
        <ActivityLog />
      </div>
    </div>
  );
}