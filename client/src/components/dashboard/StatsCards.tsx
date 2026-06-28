'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ShoppingBag, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  {
    title: 'Günün Satışları',
    value: '$1,234.50',
    icon: DollarSign,
    change: '+12.5%',
    trend: 'up',
    color: 'text-primary',
  },
  {
    title: 'Sifarişlər',
    value: '45',
    icon: ShoppingBag,
    change: '+8.2%',
    trend: 'up',
    color: 'text-green-500',
  },
  {
    title: 'Müştərilər',
    value: '128',
    icon: Users,
    change: '+3.1%',
    trend: 'up',
    color: 'text-blue-500',
  },
  {
    title: 'Məhsullar',
    value: '342',
    icon: Package,
    change: '-2.4%',
    trend: 'down',
    color: 'text-orange-500',
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={cn('h-4 w-4', stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={cn(
                  'font-medium',
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                )}
              >
                {stat.change}
              </span>{' '}
              keçən həftədən
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}