'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  MoreVertical,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  Calendar,
  Download,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { orderApi } from '@/lib/api';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { format } from 'date-fns';

const statusColors = {
  completed: 'bg-green-500',
  processing: 'bg-blue-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
};

const statusLabels = {
  completed: 'Tamamlandı',
  processing: 'Hazırlanır',
  pending: 'Gözləmədə',
  cancelled: 'Ləğv olundu',
};

const statusIcons = {
  completed: CheckCircle,
  processing: Truck,
  pending: Clock,
  cancelled: XCircle,
};

const paymentLabels = {
  cash: 'Nağd',
  card: 'Kart',
  qr: 'QR',
  'Nağd': 'Nağd',
  'Kart': 'Kart'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getOrders();
      setOrders(res.data || []);
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Sifarişləri yükləmək mümkün olmadı',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const idString = (order.order_number || order.id || '').toLowerCase();
    const customerString = (order.customer_name || '').toLowerCase();
    
    const matchesSearch = idString.includes(searchQuery.toLowerCase()) || customerString.includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPayment = selectedPayment === 'all' || order.payment === selectedPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    totalAmount: orders.reduce((sum, o) => sum + Number(o.amount || 0), 0),
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, status);
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        )
      );
      toast({
        title: 'Status yeniləndi',
        description: `Sifariş statusu "${statusLabels[status as keyof typeof statusLabels]}" olaraq dəyişdirildi`,
      });
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Statusu yeniləmək mümkün olmadı',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Bu sifarişi silmək istədiyinizə əminsiniz?')) return;
    try {
      await orderApi.deleteOrder(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
      toast({
        title: 'Sifariş silindi',
        description: 'Sifariş uğurla silindi və məhsullar stoka qaytarıldı.',
      });
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Sifarişi silmək mümkün olmadı',
        variant: 'destructive',
      });
    }
  };
  
  const handlePrint = (order: any) => {
    const receiptData = {
      items: order.items || [],
      subtotal: Number(order.amount),
      tax: 0,
      discount: 0,
      total: Number(order.amount),
      paymentMethod: order.payment === 'Nağd' ? 'cash' as const : 'card' as const,
      date: new Date(order.created_at)
    };
    setSelectedOrder(receiptData);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sifarişlər</h1>
          <p className="text-muted-foreground">
            Bütün sifarişləri idarə edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            İxrac
          </Button>
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Package className="h-4 w-4" />
            Yeni Sifariş
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ümumi</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 border-l-4 border-green-500">
            <p className="text-sm text-muted-foreground">Tamamlandı</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 border-l-4 border-blue-500">
            <p className="text-sm text-muted-foreground">Hazırlanır</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-muted-foreground">Gözləmədə</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 border-l-4 border-red-500">
            <p className="text-sm text-muted-foreground">Ləğv</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ümumi Məbləğ</p>
            <p className="text-2xl font-bold text-indigo-600">₼{stats.totalAmount.toFixed(2)}</p>
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
                placeholder="Sifariş axtar (ID, müştəri)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  const target = e.currentTarget as { value?: string };
                  setSearchQuery(target.value ?? "");
                }}
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Statuslar</SelectItem>
                <SelectItem value="pending">Gözləmədə</SelectItem>
                <SelectItem value="processing">Hazırlanır</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">Ləğv</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPayment} onValueChange={setSelectedPayment}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ödəniş" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Ödənişlər</SelectItem>
                <SelectItem value="cash">Nağd</SelectItem>
                <SelectItem value="card">Kart</SelectItem>
                <SelectItem value="qr">QR</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tarix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Həftə</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
                <SelectItem value="custom">Xüsusi</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Sifariş №</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Müştəri</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Mənbə</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Məbləğ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Ödəniş</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tarix</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Yüklənir...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir sifariş tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                    return (
                      <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <span className="font-medium">{order.order_number || order.id.slice(0, 8)}</span>
                        </td>
                        <td className="px-4 py-3">{order.customer_name || 'Gündəlik Müştəri'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={order.source === 'ONLINE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50'}>
                            {order.source === 'ONLINE' ? 'Sayt' : 'Kassa'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">₼{Number(order.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {paymentLabels[order.payment as keyof typeof paymentLabels]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'default'}>
                            {statusLabels[order.status as keyof typeof statusLabels]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {order.created_at ? format(new Date(order.created_at), 'dd.MM.yyyy HH:mm') : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handlePrint(order)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Statusu dəyiş</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'pending')}>
                                  <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                  Gözləmədə
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>
                                  <Truck className="mr-2 h-4 w-4 text-blue-500" />
                                  Hazırlanır
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Tamamlandı
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Ləğv et
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <ReceiptModal 
        open={isReceiptOpen} 
        onOpenChange={setIsReceiptOpen}
        orderData={selectedOrder}
      />
    </div>
  );
}