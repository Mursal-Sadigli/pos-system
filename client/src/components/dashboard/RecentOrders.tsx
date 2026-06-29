'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const orders = [
  { id: '#ORD-001', customer: 'Nərmin Əliyeva', amount: '₼234.50', status: 'Tamamlandı' },
  { id: '#ORD-002', customer: 'Rəşad Hacıyev', amount: '₼123.00', status: 'Hazırlanır' },
  { id: '#ORD-003', customer: 'Aysel Quliyeva', amount: '₼456.75', status: 'Gözlənir' },
  { id: '#ORD-004', customer: 'Elvin Məmmədov', amount: '₼89.99', status: 'Tamamlandı' },
];

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son sifarişlər</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Sifariş №</th>
                <th className="py-2">Müştəri</th>
                <th className="py-2">Məbləğ</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3">{order.id}</td>
                  <td className="py-3">{order.customer}</td>
                  <td className="py-3 font-medium">{order.amount}</td>
                  <td className="py-3">
                    <Badge variant="outline">{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}