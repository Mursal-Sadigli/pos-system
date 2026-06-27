'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ProductGrid } from './ProductGrid';
import { CartDrawer } from './CartDrawer';
import { PosToolbar } from './PosToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Barcode, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { items, total, clearCart } = useCartStore();

  return (
    <div className="flex h-full gap-4">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="icon">
            <Barcode className="h-4 w-4" />
          </Button>
        </div>

        {/* Categories */}
        <Tabs defaultValue="all" className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="electronics">Electronics</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="clothing">Clothing</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid searchQuery={searchQuery} category={selectedCategory} />
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 flex-shrink-0">
        <CartDrawer />
      </div>
    </div>
  );
}