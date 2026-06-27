'use client';

import { useCartStore } from '@/store/cartStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

// Mock data - will be replaced with API call
const mockProducts = [
  { id: '1', name: 'iPhone 15 Pro', price: 1299, stock: 5, category: 'electronics', image: '📱' },
  { id: '2', name: 'Samsung Galaxy S24', price: 999, stock: 3, category: 'electronics', image: '📱' },
  { id: '3', name: 'Apple AirPods Pro', price: 249, stock: 10, category: 'electronics', image: '🎧' },
  { id: '4', name: 'MacBook Pro 14"', price: 1999, stock: 2, category: 'electronics', image: '💻' },
  { id: '5', name: 'Pizza Margherita', price: 15, stock: 20, category: 'food', image: '🍕' },
  { id: '6', name: 'Sushi Set', price: 45, stock: 8, category: 'food', image: '🍣' },
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
    <div className="grid grid-cols-3 gap-3">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="p-3 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
          onClick={() => addItem(product)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl mb-2">{product.image}</div>
            <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
            <p className="text-lg font-bold text-primary">${product.price}</p>
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
              Add
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}