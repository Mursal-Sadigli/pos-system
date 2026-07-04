'use client';

import { useCartStore } from '@/store/cartStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const mockProducts = [
  { id: '1', name: 'Espresso', price: 5, stock: 24, category: 'coffee', image: '☕' },
  { id: '2', name: 'Cappuccino', price: 6, stock: 18, category: 'coffee', image: '☕' },
  { id: '3', name: 'Latte', price: 7, stock: 12, category: 'coffee', image: '☕' },
  { id: '4', name: 'Croissant', price: 3, stock: 32, category: 'food', image: '🥐' },
  { id: '5', name: 'Sandviç', price: 4, stock: 20, category: 'food', image: '🥪' },
  { id: '6', name: 'Su', price: 1, stock: 50, category: 'drinks', image: '💧' },
];

interface ProductGridProps {
  searchQuery: string;
  category: string;
}

export function ProductGrid({ searchQuery, category }: ProductGridProps) {
  const { addItem } = useCartStore();

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="p-3 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
          onClick={() => addItem(product)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl mb-2">{product.image}</div>
            <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
            <p className="text-lg font-bold text-primary">₼{product.price.toFixed(2)}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              Stock: {product.stock}
            </Badge>
            <Button
              size="sm"
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
      ))}
    </div>
  );
}