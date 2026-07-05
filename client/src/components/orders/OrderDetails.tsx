'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { printOrderReceipt } from '@/lib/printUtils';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: string;
  payment: string;
  time: string;
  date: string;
  cashier: string;
  items: OrderItem[];
}

interface OrderDetailsProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetails({ order, open, onOpenChange }: OrderDetailsProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sifariş #{order.id}</DialogTitle>
          <DialogDescription>
            Müştəri və ödəniş məlumatlarını buradan yoxlaya bilərsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-muted p-4">
              <h3 className="text-sm font-semibold">Müştəri məlumatları</h3>
              <p className="mt-2 text-sm">Ad: {order.customer}</p>
              <p className="text-sm">Sifariş: #{order.id}</p>
              <p className="text-sm">Kassa: {order.cashier}</p>
              <p className="text-sm">Tarix: {order.date} {order.time}</p>
            </div>
            <div className="rounded-lg border bg-muted p-4">
              <h3 className="text-sm font-semibold">Ödəniş detalları</h3>
              <p className="mt-2 text-sm">Ödəniş üsulu: {order.payment}</p>
              <p className="text-sm">Cəmi: ₼{order.amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted p-4">
            <h3 className="text-sm font-semibold">Məhsul siyahısı</h3>
            <div className="mt-3 space-y-2">
              {order.items.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span>{item.name} x{item.qty}</span>
                  <span>₼{(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ləğv et
          </Button>
          <Button onClick={() => printOrderReceipt(order)}>
            Çap et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}