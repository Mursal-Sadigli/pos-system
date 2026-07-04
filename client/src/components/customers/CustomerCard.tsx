'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Star, CalendarDays } from 'lucide-react';

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    points: number;
    lastPurchase: string;
    segment: string;
  };
  onView: () => void;
}

export function CustomerCard({ customer, onView }: CustomerCardProps) {
  return (
    <Card className="border p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{customer.name}</h3>
          <p className="text-sm text-muted-foreground">{customer.segment}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <p>
          <span className="font-medium">Tel:</span> {customer.phone}
        </p>
        <p>
          <span className="font-medium">Email:</span> {customer.email}
        </p>
        <p className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          {customer.points} xallar
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Son aliş: {customer.lastPurchase}
        </p>
      </div>

      <div className="mt-6">
        <Button variant="outline" className="w-full" onClick={onView}>
          Profili aç
        </Button>
      </div>
    </Card>
  );
}