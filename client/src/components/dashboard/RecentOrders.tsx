'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const orders = [
  {
    id: '#ORD-001',
    customer: 'John Doe',
    amount: '$234.50',
    status: 'completed',
    avatar: 'JD',
  },
  {
    id: '#ORD-002',
    customer: 'Jane Smith',
    amount: '$123.00',
    status: 'processing',
    avatar: 'JS',
  },
  {
    id: '#ORD-003',
    customer: 'Bob Johnson',
    amount: '$456.75',
    status: 'pending',
    avatar: 'BJ',
  },
  {
    id: '#ORD-004',
    customer: 'Alice Brown',
    amount: '$89.99',
    status: 'completed',
    avatar: 'AB',
  },
];

const statusMap = {
  pending: { label: 'Gözlənir', variant: 'warning' },
  processing: { label: 'Emal edilir', variant: 'info' },
  completed: { label: 'Tamamlandı', variant: 'success' },
  cancelled: { label: 'Ləğv edildi', variant: 'destructive' },
} as const;

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Sifarişlər</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{order.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant={statusMap[order.status].variant as any}>
                  {statusMap[order.status].label}
                </Badge>
                <span className="font-medium">{order.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}