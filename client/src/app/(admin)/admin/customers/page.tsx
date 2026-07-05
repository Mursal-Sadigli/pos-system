'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Users, Star, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const mockCustomers = [
  { id: '1', name: 'Elçin Məmmədov', phone: '+994 50 123 45 67', email: 'elcin@example.com', totalOrders: 12, totalSpent: 450.50, status: 'active' },
  { id: '2', name: 'Günel Həsənova', phone: '+994 55 987 65 43', email: 'gunel@example.com', totalOrders: 5, totalSpent: 120.00, status: 'active' },
  { id: '3', name: 'Rəşad Əliyev', phone: '+994 70 555 44 33', email: 'reshad@example.com', totalOrders: 24, totalSpent: 1250.75, status: 'vip' },
  { id: '4', name: 'Aygün Quliyeva', phone: '+994 51 222 33 44', email: 'aygun@example.com', totalOrders: 1, totalSpent: 45.00, status: 'inactive' },
  { id: '5', name: 'Tural Hüseynov', phone: '+994 77 888 99 00', email: 'tural@example.com', totalOrders: 8, totalSpent: 340.20, status: 'active' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();

  const filteredCustomers = customers.filter((cust) =>
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.phone.includes(searchQuery) ||
    cust.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (!selectedCustomer) return;
    setCustomers(customers.filter((c) => c.id !== selectedCustomer.id));
    setDeleteDialogOpen(false);
    toast({
      title: 'Müştəri silindi',
      description: `${selectedCustomer.name} uğurla silindi`,
    });
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müştərilər</h1>
          <p className="text-muted-foreground">Müştəri bazasını idarə edin</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Yeni Müştəri
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi Müştəri</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Müştərilər</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {customers.filter((c) => c.status === 'vip').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
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
                placeholder="Müştəri axtar (ad, telefon, email)..."
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
                  <th className="px-4 py-3 text-left text-sm font-medium">Müştəri</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Əlaqə</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Sifarişlər</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Xərclənən</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir müştəri tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col gap-1 text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {customer.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3"/> {customer.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{customer.totalOrders}</td>
                      <td className="px-4 py-3 font-medium text-green-600">₼{customer.totalSpent.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={customer.status === 'vip' ? 'default' : customer.status === 'active' ? 'success' : 'secondary'}>
                          {customer.status === 'vip' ? 'VIP' : customer.status === 'active' ? 'Aktiv' : 'Passiv'}
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
                            <DropdownMenuItem className="gap-2 text-red-600" onClick={() => { setSelectedCustomer(customer); setDeleteDialogOpen(true); }}>
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
            <DialogTitle>Müştərini Sil</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.name} adlı müştərini silmək istədiyinizə əminsiniz?
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
