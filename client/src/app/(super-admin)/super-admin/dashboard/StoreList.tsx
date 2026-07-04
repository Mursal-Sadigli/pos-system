'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Users, TrendingUp, Eye } from 'lucide-react';

interface StoreListProps {
  stores: Array<{
    id: string;
    name: string;
    users: number;
    revenue: number;
    orders: number;
    status: 'active' | 'inactive' | 'suspended';
  }>;
}

export function StoreList({ stores }: StoreListProps) {
  const statusLabels = {
    active: 'Aktiv',
    inactive: 'Deaktiv',
    suspended: 'Dayandırılıb',
  };

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    suspended: 'bg-yellow-500',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mağazalar</CardTitle>
            <CardDescription>Bütün mağazaların ümumi vəziyyəti</CardDescription>
          </div>
          <Link href="/super-admin/stores">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Bütün Mağazalar
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stores.map((store) => (
            <div key={store.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Store className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{store.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {store.users}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      ₼{store.revenue.toLocaleString()}
                    </span>
                    <span>{store.orders} sifariş</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={store.status === 'active' ? 'success' : store.status === 'suspended' ? 'warning' : 'secondary'}>
                  <span className={`mr-1 inline-block h-2 w-2 rounded-full ${statusColors[store.status]}`} />
                  {statusLabels[store.status]}
                </Badge>
                <Link href={`/super-admin/stores/${store.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}