'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Plus } from 'lucide-react';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ImportModal } from '@/components/products/ImportModal';
import { exportToCSV } from '@/lib/exportUtils';
import { useToast } from '@/hooks/useToast';

interface ProductItem {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

import { useEffect } from 'react';
import { productApi } from '@/lib/api';

const categories = ['Bütün', 'Elektronika', 'Qida', 'İçkilər'];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Bütün');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        (product.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'Bütün' || product.category === category;
      const matchesMinPrice = minPrice === '' || Number(product.price) >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || Number(product.price) <= Number(maxPrice);
      const matchesStock =
        stockStatus === 'all' ||
        (stockStatus === 'available' ? product.stock > 0 : product.stock === 0);

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
    });
  }, [search, category, minPrice, maxPrice, stockStatus, products]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, page, perPage]);

  const resetFilters = () => {
    setSearch('');
    setCategory('Bütün');
    setMinPrice('');
    setMaxPrice('');
    setStockStatus('all');
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await productApi.getProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productData: any) => {
    try {
      await productApi.createProduct(productData);
      toast({ title: 'Uğurlu', description: 'Məhsul əlavə edildi' });
      fetchProducts();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Xəta', description: 'Məhsulu yadda saxlamaq mümkün olmadı', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) {
      try {
        await productApi.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        toast({ title: 'Uğurlu', description: 'Məhsul silindi' });
      } catch (error) {
        console.error('Delete error:', error);
        toast({ title: 'Xəta', description: 'Məhsulu silmək mümkün olmadı', variant: 'destructive' });
      }
    }
  };

  const handleImportProducts = async (importedProducts: any[]) => {
    try {
      const res = await productApi.bulkImportProducts({ products: importedProducts });
      toast({ title: 'Uğurlu', description: `${res.data?.count || importedProducts.length} məhsul idxal edildi` });
      fetchProducts();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Xəta', description: 'İdxal zamanı xəta baş verdi', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    exportToCSV(products, 'mehsullar');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
          <p className="text-sm text-muted-foreground">Bütün məhsulları burada idarə edin.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => {
            setIsProductModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Məhsul
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            İxrac
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            İdxal
          </Button>
        </div>
      </div>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        stockStatus={stockStatus}
        onStockStatusChange={setStockStatus}
        onClear={resetFilters}
        categories={categories}
      />

      <ProductTable 
        products={paginatedProducts} 
        onDelete={handleDeleteProduct}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Göstərilir {paginatedProducts.length} / {filteredProducts.length} məhsul
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted-foreground">Səhifədə:</label>
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Əvvəlki
            </Button>
            <span className="text-sm">
              {page} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pageCount}
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            >
              Növbəti
            </Button>
          </div>
        </div>
      </div>

      <ProductFormModal 
        open={isProductModalOpen} 
        onOpenChange={setIsProductModalOpen} 
        product={null}
        onSave={handleSaveProduct}
        categories={categories}
      />

      <ImportModal 
        open={isImportModalOpen} 
        onOpenChange={setIsImportModalOpen} 
        onImport={handleImportProducts}
      />
    </div>
  );
}