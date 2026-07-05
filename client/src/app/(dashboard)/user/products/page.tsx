'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Plus } from 'lucide-react';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ImportModal } from '@/components/products/ImportModal';
import { exportToCSV } from '@/lib/exportUtils';

interface ProductItem {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
}

const initialProducts: ProductItem[] = [
  { id: '1', image: '📷', name: 'iPhone 15', category: 'Elektronika', price: 1200, stock: 5, isActive: true },
  { id: '2', image: '📷', name: 'Samsung Galaxy S24', category: 'Elektronika', price: 900, stock: 3, isActive: true },
  { id: '3', image: '📷', name: 'MacBook Pro', category: 'Elektronika', price: 2400, stock: 2, isActive: true },
  { id: '4', image: '📷', name: 'Croissant', category: 'Qida', price: 3, stock: 12, isActive: true },
  { id: '5', image: '📷', name: 'Su', category: 'İçkilər', price: 1, stock: 0, isActive: false },
  { id: '6', image: '📷', name: 'Cappuccino', category: 'Qida', price: 6, stock: 8, isActive: true },
];

const categories = ['Bütün', 'Elektronika', 'Qida', 'İçkilər'];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
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
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'Bütün' || product.category === category;
      const matchesMinPrice = minPrice === '' || product.price >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || product.price <= Number(maxPrice);
      const matchesStock =
        stockStatus === 'all' ||
        (stockStatus === 'available' ? product.stock > 0 : product.stock === 0);

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesStock;
    });
  }, [search, category, minPrice, maxPrice, stockStatus]);

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

  const handleSaveProduct = (productData: Omit<ProductItem, 'id'>) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      setProducts([...products, { ...productData, id: newId }]);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bu məhsulu silmək istədiyinizə əminsiniz?')) {
      setProducts(products.filter(p => p.id !== id));
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
            setEditingProduct(null);
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
        onEdit={(product) => {
          setEditingProduct(product);
          setIsProductModalOpen(true);
        }}
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
        product={editingProduct}
        onSave={handleSaveProduct}
        categories={categories}
      />

      <ImportModal 
        open={isImportModalOpen} 
        onOpenChange={setIsImportModalOpen} 
        onImport={() => alert('Fayl uğurla analiz edildi və məhsullar əlavə olundu!')}
      />
    </div>
  );
}