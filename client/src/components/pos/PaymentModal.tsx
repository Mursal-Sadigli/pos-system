'use client';

import { useState } from 'react';
import { Banknote, CreditCard } from 'lucide-react';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods = [
  { id: 'cash' as const, label: 'Nağd', icon: Banknote },
  { id: 'card' as const, label: 'Kart', icon: CreditCard },
];

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { total, clearCart } = useCartStore();
  const [method, setMethod] = useState<'cash' | 'card'>('cash');

  const handlePayment = () => {
    clearCart();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ödəniş</DialogTitle>
          <DialogDescription>
            Ödəniş üsulunu seçin və satışı tamamlayın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMethod(item.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  method === item.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Ödəniləcək məbləğ</p>
            <p className="text-3xl font-bold text-primary">₼{total.toFixed(2)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ləğv et
          </Button>
          <Button onClick={handlePayment}>Ödənişi tamamla</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
