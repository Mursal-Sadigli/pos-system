'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { printOrderReceipt } from '@/lib/printUtils';

interface OrderItem {
  id: string;
  order_number?: string;
  customer_name?: string;
  amount: number;
  status: string;
  payment: string;
  created_at: string;
  cashier: string;
  source?: string;
  items: Array<{ name: string; qty: number; price: number }>;
}

interface OrderTableProps {
  orders: OrderItem[];
  onStatusChange?: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
}

const statusMap = {
  pending: { label: 'Gözləmədə', variant: 'warning' },
  processing: { label: 'Hazırlanır', variant: 'secondary' },
  completed: { label: 'Tamamlandı', variant: 'success' },
  cancelled: { label: 'Ləğv', variant: 'destructive' },
} as const;

import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';

export function OrderTable({ orders, onStatusChange, onDelete }: OrderTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Sifariş №</th>
            <th className="px-4 py-3">Müştəri</th>
            <th className="px-4 py-3">Mənbə</th>
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
              <td className="px-4 py-3">#{order.order_number || order.id.slice(0, 8)}</td>
              <td className="px-4 py-3">{order.customer_name || 'Gündəlik Müştəri'}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className={order.source === 'ONLINE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50'}>
                  {order.source === 'ONLINE' ? 'Sayt' : 'Kassa'}
                </Badge>
              </td>
              <td className="px-4 py-3">₼{Number(order.amount || 0).toFixed(2)}</td>
              <td className="px-4 py-3">
                <Badge variant={(statusMap[order.status as keyof typeof statusMap]?.variant as any) ?? 'secondary'}>
                  {statusMap[order.status as keyof typeof statusMap]?.label ?? order.status}
                </Badge>
              </td>
              <td className="px-4 py-3">{order.payment}</td>
              <td className="px-4 py-3">{order.created_at ? format(new Date(order.created_at), 'dd.MM.yyyy HH:mm') : '-'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => printOrderReceipt(order as any)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  {(onStatusChange || onDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onStatusChange && (
                          <>
                            <DropdownMenuItem onClick={() => onStatusChange(order.id, 'pending')}>Gözləmədə</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(order.id, 'processing')}>Hazırlanır</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(order.id, 'completed')}>Tamamlandı</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange(order.id, 'cancelled')} className="text-red-600">Ləğv et</DropdownMenuItem>
                          </>
                        )}
                        {onStatusChange && onDelete && <DropdownMenuSeparator />}
                        {onDelete && (
                          <DropdownMenuItem onClick={() => onDelete(order.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}