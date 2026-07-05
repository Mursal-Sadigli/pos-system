'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/useToast';

const mockCategories = [
  { id: '1', name: 'Elektronika', description: 'Smartfonlar, noutbuklar və digər elektronik cihazlar', productCount: 45, status: 'active' },
  { id: '2', name: 'Geyim', description: 'Kişi və qadın geyimləri', productCount: 120, status: 'active' },
  { id: '3', name: 'Ayaqqabı', description: 'Müxtəlif növ ayaqqabılar', productCount: 85, status: 'active' },
  { id: '4', name: 'Aksesuarlar', description: 'Saat, eynək və digər aksesuarlar', productCount: 230, status: 'inactive' },
  { id: '5', name: 'Məişət texnikası', description: 'Ev üçün kiçik və böyük məişət cihazları', productCount: 30, status: 'active' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const { toast } = useToast();

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (!selectedCategory) return;
    setCategories(categories.filter((c) => c.id !== selectedCategory.id));
    setDeleteDialogOpen(false);
    toast({
      title: 'Kateqoriya silindi',
      description: `${selectedCategory.name} uğurla silindi`,
    });
    setSelectedCategory(null);
  };

  const handleToggleStatus = (category: any) => {
    setCategories(categories.map((c) =>
      c.id === category.id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
    toast({
      title: `Status yeniləndi`,
      description: `${category.name} kateqoriyasının statusu dəyişdirildi`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kateqoriyalar</h1>
          <p className="text-muted-foreground">Məhsul kateqoriyalarını idarə edin</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Yeni Kateqoriya
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Tag className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold text-green-600">
                  {categories.filter((c) => c.status === 'active').length}
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
                <p className="text-sm text-muted-foreground">Deaktiv</p>
                <p className="text-2xl font-bold text-red-600">
                  {categories.filter((c) => c.status === 'inactive').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kateqoriya axtar..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Ad</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Təsvir</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Məhsul Sayı</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir kateqoriya tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{category.description}</td>
                      <td className="px-4 py-3 font-medium">{category.productCount}</td>
                      <td className="px-4 py-3">
                        <Badge variant={category.status === 'active' ? 'success' : 'secondary'}>
                          {category.status === 'active' ? 'Aktiv' : 'Deaktiv'}
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
                              <Edit className="h-4 w-4" />
                              Redaktə et
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => handleToggleStatus(category)}>
                              {category.status === 'active' ? (
                                <><AlertCircle className="h-4 w-4" /> Deaktiv et</>
                              ) : (
                                <><CheckCircle className="h-4 w-4" /> Aktiv et</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600" onClick={() => { setSelectedCategory(category); setDeleteDialogOpen(true); }}>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kateqoriyanı Sil</DialogTitle>
            <DialogDescription>
              {selectedCategory?.name} kateqoriyasını silmək istədiyinizə əminsiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Ləğv Et</Button>
            <Button variant="destructive" onClick={handleDelete}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
