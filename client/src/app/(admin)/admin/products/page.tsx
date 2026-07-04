'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';

// Mock Data
const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    sku: 'IP-001',
    price: 1299.00,
    stock: 5,
    minStock: 3,
    category: 'Elektronika',
    status: 'active',
    image: '📱',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    sku: 'SG-002',
    price: 999.00,
    stock: 8,
    minStock: 3,
    category: 'Elektronika',
    status: 'active',
    image: '📱',
  },
  {
    id: '3',
    name: 'MacBook Pro 14"',
    sku: 'MB-003',
    price: 1999.00,
    stock: 2,
    minStock: 2,
    category: 'Kompüterlər',
    status: 'active',
    image: '💻',
  },
  {
    id: '4',
    name: 'AirPods Pro',
    sku: 'AP-004',
    price: 249.00,
    stock: 0,
    minStock: 5,
    category: 'Aksesuarlar',
    status: 'inactive',
    image: '🎧',
  },
  {
    id: '5',
    name: 'iPad Air',
    sku: 'IP-005',
    price: 599.00,
    stock: 3,
    minStock: 3,
    category: 'Kompüterlər',
    status: 'active',
    image: '📱',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    setProducts(products.filter((p) => p.id !== selectedProduct.id));
    setDeleteDialogOpen(false);
    toast({
      title: 'Məhsul silindi',
      description: `${selectedProduct.name} məhsulu uğurla silindi`,
    });
    setSelectedProduct(null);
  };

  const handleToggleStatus = (product: any) => {
    setProducts(
      products.map((p) =>
        p.id === product.id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
    toast({
      title: `Məhsul ${product.status === 'active' ? 'deaktiv' : 'aktiv'} edildi`,
      description: `${product.name} məhsulu ${product.status === 'active' ? 'deaktiv' : 'aktiv'} edildi`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
          <p className="text-muted-foreground">
            Mağaza məhsullarını idarə edin
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Yeni Məhsul
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi Məhsul</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter((p) => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stokda</p>
                <p className="text-2xl font-bold text-blue-600">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Az Stok</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter((p) => p.stock < p.minStock).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Məhsul axtar (ad, SKU)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery((e.target as { value?: string }).value ?? "")}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kateqoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Kateqoriyalar</SelectItem>
                {categories.filter(c => c !== 'all').map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Statuslar</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Deaktiv</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Məhsul</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Kateqoriya</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Qiymət</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stok</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir məhsul tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.image}</span>
                          <div>
                            <p className="font-medium">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.sku}</td>
                      <td className="px-4 py-3 text-sm">{product.category}</td>
                      <td className="px-4 py-3 font-medium">₼{product.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={product.stock < product.minStock ? 'text-red-600 font-medium' : ''}>
                            {product.stock}
                          </span>
                          {product.stock < product.minStock && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                          {product.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              Bax
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Redaktə et
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleToggleStatus(product)}
                            >
                              {product.status === 'active' ? (
                                <>
                                  <AlertCircle className="h-4 w-4" />
                                  Deaktiv et
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Aktiv et
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-red-600"
                              onClick={() => {
                                setSelectedProduct(product);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Məhsulu Sil</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} məhsulunu silmək istədiyinizə əminsiniz?
              Bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Ləğv Et
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}