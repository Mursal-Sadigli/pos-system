export interface Product{
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    categoryId: string;
    storeId: string;
    description?: string;
    price: number;
    cost: number;
    taxRate: number;
    stock: number;
    minStock: number;
    unit: 'piece' | 'kg' | 'gram' | 'liter' | 'meter';
    images: string[];
    image?: string;
    isActive: boolean;
    status?: string;
    isFeatured: boolean;
    tags: string[];
    supplier?: string;
    category?: string;
    createdAt: Date;
    updateAt: Date;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  unit: 'piece' | 'kg' | 'gram' | 'liter' | 'meter';
  description?: string;
  taxRate?: number;
  minStock?: number;
}