'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const products = [
  { name: 'Espresso', sold: 124, revenue: '$620' },
  { name: 'Cappuccino', sold: 98, revenue: '$588' },
  { name: 'Croissant', sold: 76, revenue: '$228' },
  { name: 'Latte', sold: 65, revenue: '$390' },
];

export function TopProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.name} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.sold} sold</p>
              </div>
              <span className="font-medium">{product.revenue}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
