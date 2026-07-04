'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  stockStatus: string;
  onStockStatusChange: (value: string) => void;
  onClear: () => void;
  categories: string[];
}

export function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  stockStatus,
  onStockStatusChange,
  onClear,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="grid gap-3 lg:grid-cols-[2fr_1.2fr_1fr_1fr_auto]">
        <div>
          <label className="mb-2 block text-sm font-medium">Axtarış</label>
          <Input
            placeholder="Məhsul adı və ya kateqoriya..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Kateqoriya</label>
          <select
            className="h-10 w-full rounded-lg border px-3 text-sm"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Qiymət min</label>
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Qiymət max</label>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </div>

        <div className="flex items-end justify-end">
          <Button variant="outline" onClick={onClear}>
            Təmizlə
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.9fr]">
        <div>
          <label className="mb-2 block text-sm font-medium">Stok statusu</label>
          <select
            className="h-10 w-full rounded-lg border px-3 text-sm"
            value={stockStatus}
            onChange={(e) => onStockStatusChange(e.target.value)}
          >
            <option value="all">Hamısı</option>
            <option value="available">Var</option>
            <option value="out">Yox</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Qiymət aralığı</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}