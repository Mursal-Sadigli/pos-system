'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Store, Users, UserCog, DollarSign, Activity } from 'lucide-react';

interface SystemStatsProps {
  stats: {
    totalStores: number;
    totalUsers: number;
    totalAdmins: number;
    totalRevenue: number;
    activeStores: number;
    growth: number;
    newUsersThisWeek: number;
  };
}

export function SystemStats({ stats }: SystemStatsProps) {
  const statItems = [
    {
      title: 'Mağazalar',
      value: stats.totalStores,
      icon: Store,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      detail: `${stats.activeStores} aktiv`,
    },
    {
      title: 'İstifadəçilər',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      detail: `+${stats.newUsersThisWeek} bu həftə`,
    },
    {
      title: 'Adminlər',
      value: stats.totalAdmins,
      icon: UserCog,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      detail: 'Aktiv',
    },
    {
      title: 'Ümumi Gəlir',
      value: `₼${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      detail: (
        <span className="flex items-center gap-1">
          {stats.growth > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={stats.growth > 0 ? 'text-green-500' : 'text-red-500'}>
            {stats.growth}%
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
              </div>
              <div className={`rounded-lg ${item.bg} p-3`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}