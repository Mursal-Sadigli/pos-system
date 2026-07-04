'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  Store,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Package,
  Calendar,
  Filter,
  Eye,
  Printer,
  Mail,
  FileText,
  BarChart3,
  PieChart,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useToast } from '@/hooks/useToast';

// Mock Data
const storePerformanceData = [
  {
    id: 'store-1',
    name: 'Elektronika Dünyası',
    revenue: 45600,
    orders: 320,
    customers: 128,
    products: 342,
    growth: 15.2,
    status: 'active',
    color: '#4F46E5',
  },
  {
    id: 'store-2',
    name: 'Moda Mərkəzi',
    revenue: 32400,
    orders: 280,
    customers: 96,
    products: 215,
    growth: 8.7,
    status: 'active',
    color: '#7C3AED',
  },
  {
    id: 'store-3',
    name: 'Qida Supermarket',
    revenue: 28500,
    orders: 450,
    customers: 245,
    products: 156,
    growth: 12.3,
    status: 'active',
    color: '#10B981',
  },
  {
    id: 'store-4',
    name: 'Texno Store',
    revenue: 21500,
    orders: 190,
    customers: 67,
    products: 89,
    growth: -2.1,
    status: 'inactive',
    color: '#F59E0B',
  },
  {
    id: 'store-5',
    name: 'Gözəllik Salonu',
    revenue: 18000,
    orders: 150,
    customers: 54,
    products: 45,
    growth: 5.6,
    status: 'suspended',
    color: '#EC4899',
  },
];

const monthlyData = [
  { name: 'Yan', total: 45000, elektronika: 15000, moda: 12000, qida: 18000 },
  { name: 'Fev', total: 52000, elektronika: 18000, moda: 14000, qida: 20000 },
  { name: 'Mar', total: 48000, elektronika: 16000, moda: 13000, qida: 19000 },
  { name: 'Apr', total: 61000, elektronika: 22000, moda: 16000, qida: 23000 },
  { name: 'May', total: 72000, elektronika: 26000, moda: 19000, qida: 27000 },
  { name: 'İyn', total: 85000, elektronika: 31000, moda: 22000, qida: 32000 },
];

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  suspended: 'bg-yellow-500',
};

const statusLabels = {
  active: 'Aktiv',
  inactive: 'Deaktiv',
  suspended: 'Dayandırılıb',
};

export default function StoresReportsPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState(storePerformanceData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [period, setPeriod] = useState('monthly');
  const [sortBy, setSortBy] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);

  const filteredStores = stores.filter((store) => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || store.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'orders') return b.orders - a.orders;
    if (sortBy === 'customers') return b.customers - a.customers;
    if (sortBy === 'growth') return b.growth - a.growth;
    return 0;
  });

  const stats = {
    totalStores: stores.length,
    activeStores: stores.filter((s) => s.status === 'active').length,
    totalRevenue: stores.reduce((sum, s) => sum + s.revenue, 0),
    totalOrders: stores.reduce((sum, s) => sum + s.orders, 0),
    totalCustomers: stores.reduce((sum, s) => sum + s.customers, 0),
    averageGrowth: stores.reduce((sum, s) => sum + s.growth, 0) / stores.length,
  };

  const handleExport = (format: string) => {
    toast({
      title: `📥 ${format.toUpperCase()} ixrac edilir`,
      description: 'Mağaza hesabatı yüklənir...',
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: '✅ Hesabat yeniləndi',
        description: 'Ən son məlumatlar yükləndi',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-7 w-7 text-red-600" />
            Mağaza Hesabatları
          </h1>
          <p className="text-muted-foreground">
            Bütün mağazaların performansını təhlil edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Yenilə
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 bg-red-600 hover:bg-red-700">
                <Download className="h-4 w-4" />
                İxrac et
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ümumi Mağaza</p>
            <p className="text-xl font-bold">{stats.totalStores}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-green-500">
            <p className="text-xs text-muted-foreground">Aktiv</p>
            <p className="text-xl font-bold text-green-600">{stats.activeStores}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ümumi Gəlir</p>
            <p className="text-xl font-bold text-red-600">₼{stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Sifarişlər</p>
            <p className="text-xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Orta Artım</p>
            <p className={`text-xl font-bold ${stats.averageGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.averageGrowth > 0 ? '+' : ''}{stats.averageGrowth.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mağaza Gəlir Trendi</CardTitle>
                <CardDescription>Aylıq mağaza gəlirləri</CardDescription>
              </div>
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList>
                  <TabsTrigger value="weekly">Həftəlik</TabsTrigger>
                  <TabsTrigger value="monthly">Aylıq</TabsTrigger>
                  <TabsTrigger value="yearly">İllik</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="elektronika"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      name="Elektronika Dünyası"
                    />
                    <Line
                      type="monotone"
                      dataKey="moda"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      name="Moda Mərkəzi"
                    />
                    <Line
                      type="monotone"
                      dataKey="qida"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Qida Supermarket"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Mağaza Performansı</CardTitle>
            <CardDescription>Gəlirə görə mağazalar</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedStores} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Bar dataKey="revenue" name="Gəlir (₼)">
                      {sortedStores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
                placeholder="Mağaza axtar..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Statuslar</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Deaktiv</SelectItem>
                <SelectItem value="suspended">Dayandırılıb</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Gəlir</SelectItem>
                <SelectItem value="orders">Sifariş</SelectItem>
                <SelectItem value="customers">Müştəri</SelectItem>
                <SelectItem value="growth">Artım</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Mağaza</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Gəlir</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Sifariş</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Müştəri</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Məhsul</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Artım</th>
                </tr>
              </thead>
              <tbody>
                {sortedStores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir mağaza tapılmadı
                    </td>
                  </tr>
                ) : (
                  sortedStores.map((store) => (
                    <tr key={store.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: `${store.color}20` }}>
                            <Store className="h-4 w-4" style={{ color: store.color }} />
                          </div>
                          <span className="font-medium">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={store.status === 'active' ? 'success' : store.status === 'suspended' ? 'warning' : 'secondary'}>
                          {statusLabels[store.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">₼{store.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{store.orders}</td>
                      <td className="px-4 py-3 text-right">{store.customers}</td>
                      <td className="px-4 py-3 text-right">{store.products}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={store.growth > 0 ? 'success' : 'destructive'}>
                          {store.growth > 0 ? '+' : ''}{store.growth}%
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}