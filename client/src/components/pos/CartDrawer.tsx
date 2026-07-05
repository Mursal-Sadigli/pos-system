'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export function CartDrawer() {
  const { items, total, subtotal, tax, discount, removeItem, updateQuantity, clearCart, setDiscount } =
    useCartStore();
  const [showPayment, setShowPayment] = useState(false);

  const isEmpty = items.length === 0;

  return (
    <>
      <Card className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Səbət</h3>
              <p className="text-sm text-muted-foreground">{items.length} məhsul</p>
            </div>
          </div>
          {!isEmpty && (
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={clearCart}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Səbətiniz boşdur</p>
              <p className="text-sm text-muted-foreground/70">Sol paneldən məhsul seçin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x ₼{item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cəmi</span>
              <span>₼{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Endirim</span>
              <span className="text-green-500">-₼{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vergi</span>
              <span>+₼{tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Ödəniləcək</span>
              <span className="text-primary">₼{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={() => setDiscount(5)} disabled={isEmpty}>
              Endirim
            </Button>
            <Button variant="outline" onClick={() => {}} disabled={isEmpty}>
              Qeyd
            </Button>
          </div>

          <Button className="w-full text-base font-medium" size="lg" disabled={isEmpty} onClick={() => setShowPayment(true)}>
            Ödəniş et
          </Button>
        </div>
      </Card>

      <PaymentModal open={showPayment} onOpenChange={setShowPayment} />
    </>
  );
}