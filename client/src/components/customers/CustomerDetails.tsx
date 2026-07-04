'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  date: string;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  lastPurchase: string;
  segment: string;
  orders: OrderItem[];
  coupons: string[];
}

interface CustomerDetailsProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetails({ customer, open, onOpenChange }: CustomerDetailsProps) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer.name} - Profil</DialogTitle>
          <DialogDescription>
            Bu səhifədə müştərinin alış tarixçəsi, loyalty xalları və kuponları görünür.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted p-4">
              <h3 className="text-sm font-semibold">Profil məlumatları</h3>
              <p className="mt-3 text-sm">Ad: {customer.name}</p>
              <p className="text-sm">Telefon: {customer.phone}</p>
              <p className="text-sm">Email: {customer.email}</p>
              <p className="text-sm">Segment: {customer.segment}</p>
            </div>

            <div className="rounded-lg border bg-muted p-4">
              <h3 className="text-sm font-semibold">Loyalty xalları</h3>
              <p className="mt-3 text-3xl font-semibold">{customer.points}</p>
              <p className="text-sm text-muted-foreground">Son alış: {customer.lastPurchase}</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted p-4">
            <h3 className="text-sm font-semibold">Satın alma tarixçəsi</h3>
            <div className="mt-3 space-y-3 text-sm">
              {customer.orders.map((order) => (
                <div key={order.id} className="flex justify-between">
                  <span>{order.id} · {order.date}</span>
                  <span>₼{order.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-muted p-4">
            <h3 className="text-sm font-semibold">Endirim kuponları</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {customer.coupons.map((coupon) => (
                <span key={coupon} className="rounded-full border px-3 py-1 text-sm">
                  {coupon}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bağla
          </Button>
          <Button>Redaktə et</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}