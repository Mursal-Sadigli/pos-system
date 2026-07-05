'use client';

import { useCartStore } from '@/store/cartStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const mockProducts = [
  { id: '1', name: 'Espresso', price: 5, stock: 5, category: 'coffee', image: '☕' },
  { id: '2', name: 'Latte', price: 7, stock: 3, category: 'coffee', image: '☕' },
];

interface ProductGridProps {
  searchQuery: string;
  category: string;
}

export function ProductGrid({ searchQuery, category }: ProductGridProps) {
  const { items: cartItems, addItem } = useCartStore();

  const getRemainingStock = (product: typeof mockProducts[0]) => {
    const cartItem = cartItems.find((i) => i.id === product.id);
    return product.stock - (cartItem?.quantity || 0);
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    const remainingStock = getRemainingStock(product);
    return matchesSearch && matchesCategory && remainingStock > 0;
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {filteredProducts.map((product) => {
        const remainingStock = getRemainingStock(product);

        return (
          <Card
            key={product.id}
            className="p-3 transition-all hover:shadow-lg cursor-pointer hover:border-primary/50"
            onClick={() => addItem(product)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-2">{product.image}</div>
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              <p className="text-lg font-bold text-primary">₼{product.price.toFixed(2)}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {`Stok: ${remainingStock}`}
              </Badge>
              <Button
                size="sm"
                variant="default"
                className="mt-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(product);
                }}
              >
                <Plus className="mr-1 h-3 w-3" />
                Əlavə et
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}