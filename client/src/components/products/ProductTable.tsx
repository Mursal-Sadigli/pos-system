'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ProductItem {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

interface ProductTableProps {
  products: ProductItem[];
  onEdit: (product: ProductItem) => void;
  onDelete: (productId: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="min-w-full divide-y border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Şəkil</th>
            <th className="px-4 py-3">Ad</th>
            <th className="px-4 py-3">Kateqoriya</th>
            <th className="px-4 py-3">Qiymət</th>
            <th className="px-4 py-3">Stok</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product, index) => (
            <tr key={product.id}>
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 text-2xl">{product.image}</td>
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3">{product.category}</td>
              <td className="px-4 py-3">₼{Number(product.price).toFixed(2)}</td>
              <td className="px-4 py-3">{product.stock}</td>
              <td className="px-4 py-3">
                <Badge variant={product.status === 'active' ? 'success' : 'destructive'}>
                  {product.status === 'active' ? 'Aktiv' : 'Passiv'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}