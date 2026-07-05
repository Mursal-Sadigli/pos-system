'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { productApi } from '@/lib/api';
import type { Product } from '@/types/product';

interface ProductGridProps {
  searchQuery: string;
  category: string;
  products: Product[];
  loading: boolean;
}

export function ProductGrid({ searchQuery, category, products, loading }: ProductGridProps) {
  const { items: cartItems, addItem } = useCartStore();

  const getRemainingStock = (product: Product) => {
    const cartItem = cartItems.find((i) => i.id === product.id);
    return product.stock - (cartItem?.quantity || 0);
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (product.name || '').toLowerCase().includes(searchLower) ||
      (product.sku || '').toLowerCase().includes(searchLower);
      
    // Categorization logic - in pos screen category comes as string
    const matchesCategory = category === 'all' || product.category === category;
    const remainingStock = getRemainingStock(product);
    
    return matchesSearch && matchesCategory && remainingStock > 0 && product.status !== 'inactive';
  });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Məhsullar yüklənir...</div>;
  }

  if (filteredProducts.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Məhsul tapılmadı.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {filteredProducts.map((product) => {
        const remainingStock = getRemainingStock(product);
        // Use placeholder image if no image provided
        const imageSrc = product.image && product.image.startsWith('http') ? product.image : '📦';

        return (
          <Card
            key={product.id}
            className="p-3 transition-all hover:shadow-lg cursor-pointer hover:border-primary/50"
            onClick={() => addItem(product as any)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-2 h-12 flex items-center justify-center">
                {product.image && product.image.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                ) : (
                  <span>{imageSrc}</span>
                )}
              </div>
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              <p className="text-lg font-bold text-primary">₼{Number(product.price).toFixed(2)}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {`Stok: ${remainingStock}`}
              </Badge>
              <Button
                size="sm"
                variant="default"
                className="mt-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(product as any);
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