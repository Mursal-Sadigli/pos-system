'use client';

import { Card } from '@/components/ui/card';

interface CustomerLoyaltyProps {
  title: string;
  value: string;
  description: string;
}

export function CustomerLoyalty({ title, value, description }: CustomerLoyaltyProps) {
  return (
    <Card className="rounded-3xl border p-5">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}