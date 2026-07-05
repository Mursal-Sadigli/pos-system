'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { printOrderReceipt } from '@/lib/printUtils';

interface OrderItem {
  id: string;
  customer: string;
  amount: number;
  status: string;
  payment: string;
  time: string;
  date: string;
  cashier: string;
  items: Array<{ name: string; qty: number; price: number }>;
}

interface OrderTableProps {
  orders: OrderItem[];
}

const statusMap = {
  pending: { label: 'Gözləmədə', variant: 'warning' },
  preparing: { label: 'Hazırlanır', variant: 'secondary' },
  completed: { label: 'Tamamlandı', variant: 'success' },
  cancelled: { label: 'Ləğv', variant: 'destructive' },
} as const;

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Sifariş №</th>
            <th className="px-4 py-3">Müştəri</th>
            <th className="px-4 py-3">Məbləğ</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Ödəniş</th>
            <th className="px-4 py-3">Vaxt</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3">#{order.id}</td>
              <td className="px-4 py-3">{order.customer}</td>
              <td className="px-4 py-3">₼{order.amount.toFixed(2)}</td>
              <td className="px-4 py-3">
                <Badge variant={(statusMap[order.status as keyof typeof statusMap]?.variant as any) ?? 'secondary'}>
                  {statusMap[order.status as keyof typeof statusMap]?.label ?? order.status}
                </Badge>
              </td>
              <td className="px-4 py-3">{order.payment}</td>
              <td className="px-4 py-3">{order.time}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => printOrderReceipt(order)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}