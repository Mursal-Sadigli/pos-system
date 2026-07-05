'use client';

import { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { CartDrawer } from './CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Barcode, CreditCard, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRef, useEffect } from 'react';
import { productApi } from '@/lib/api';
import type { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useToast } from '@/hooks/useToast';

const categories = [
  { value: 'all', label: 'Bütün' },
  { value: 'coffee', label: 'Qəhvə' },
  { value: 'food', label: 'Qida' },
  { value: 'drinks', label: 'İçkilər' },
];

export function PosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getProducts();
        setProducts(res.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useBarcodeScanner((barcode) => {
    // Skan edilən barkodu (sku) məhsulların içində axtar
    const product = products.find(p => p.sku === barcode);
    if (product) {
      if (product.stock > 0 && product.status !== 'inactive') {
        addItem(product as any);
        toast({
          title: "Məhsul əlavə edildi",
          description: `${product.name} səbətə əlavə olundu.`,
        });
      } else {
        toast({
          title: "Məhsul bitib",
          description: "Bu məhsuldan stokda qalmayıb.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Tapılmadı",
        description: `Barkod: ${barcode} sistemdə mövcud deyil.`,
        variant: "destructive"
      });
    }
  });

  const handleBarcodeScan = () => {
    searchInputRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">🛒 POS - Mağaza Adı</h1>
            <p className="text-sm text-muted-foreground">
              Buradan sürətli satışları və ödənişləri idarə edə bilərsiniz.
            </p>
          </div>

          <div className="grid w-full gap-2 sm:grid-cols-[1fr_auto_auto] xl:w-auto xl:grid-cols-[minmax(320px,_420px)_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Barkod və ya məhsul axtarışı..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button variant="outline" className="min-w-[44px]" onClick={handleBarcodeScan}>
              <Barcode className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value} className="whitespace-nowrap">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-[1.8fr_1.05fr]">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">Məhsul kataloqu</h2>
          <div className="overflow-y-auto">
            <ProductGrid searchQuery={searchQuery} category={selectedCategory} products={products} loading={loading} />
          </div>
        </div>

        <CartDrawer />
      </div>
    </div>
  );
}