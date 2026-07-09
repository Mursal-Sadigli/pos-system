'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  Store,
  TrendingUp,
  FileText,
  BarChart3,
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
  Legend,
  Cell,
} from 'recharts';
import { useToast } from '@/hooks/useToast';
import { reportsApi } from '@/lib/api';

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  suspended: 'bg-yellow-500',
};

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  inactive: 'Deaktiv',
  suspended: 'Dayandırılıb',
};

export default function StoresReportsPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [period, setPeriod] = useState('monthly');
  const [sortBy, setSortBy] = useState('revenue');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (showToast = false) => {
    setIsLoading(true);
    try {
      const [perfRes, trendsRes] = await Promise.all([
        reportsApi.getStorePerformance(),
        reportsApi.getStoreTrends()
      ]);

      setStores(perfRes.data.data);
      setMonthlyData(trendsRes.data.data);

      if (showToast) {
        toast({
          title: '✅ Hesabat yeniləndi',
          description: 'Mağazaların ən son performansı yükləndi',
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Xəta',
        description: error.response?.data?.message || 'Mağazaları yükləmək mümkün olmadı',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

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
    averageGrowth: stores.length > 0 ? stores.reduce((sum, s) => sum + s.growth, 0) / stores.length : 0,
  };

  const handleExport = (format: string) => {
    if (format === 'csv') {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Magaza Adi,Status,Qazanc,Sifarisler,Mehsullar,Musteriler\n";
      
      sortedStores.forEach(store => {
        csvContent += `${store.name},${store.status},${store.revenue},${store.orders},${store.products},${store.customers}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "magazalar_hesabati.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: `📥 CSV ixrac edildi`,
        description: 'Mağaza hesabatı uğurla yükləndi',
      });
    } else {
      toast({
        title: `📥 ${format.toUpperCase()} ixrac edilir`,
        description: 'Bu format tezliklə əlavə ediləcək',
      });
    }
  };

  // Get dynamic keys for line chart (all unique store names present in trends data)
  const storeNamesForChart = Array.from(new Set(
    monthlyData.flatMap(month => Object.keys(month).filter(key => key !== 'name'))
  ));

  const lineColors = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];

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
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="gap-2" disabled={isLoading}>
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
            <p className="text-xl font-bold">{stats.totalOrders.toLocaleString()}</p>
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
                  <TabsTrigger value="monthly">Aylıq</TabsTrigger>
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
                    {storeNamesForChart.map((storeName, idx) => (
                      <Line
                        key={storeName}
                        type="monotone"
                        dataKey={storeName}
                        stroke={lineColors[idx % lineColors.length]}
                        strokeWidth={2}
                        name={storeName}
                      />
                    ))}
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
                  <BarChart data={sortedStores.slice(0, 5)} layout="vertical">
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
                      {sortedStores.slice(0, 5).map((entry, index) => (
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
                <SelectItem value="customers">Müştərilər</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Mağaza</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Qazanc</th>
                <th className="px-4 py-3 font-medium text-right">Sifarişlər</th>
                <th className="px-4 py-3 font-medium text-right">Məhsullar</th>
                <th className="px-4 py-3 font-medium text-right">Müştərilər</th>
                <th className="px-4 py-3 font-medium text-right">Artım</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Yüklənir...
                  </td>
                </tr>
              ) : sortedStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Heç bir mağaza tapılmadı
                  </td>
                </tr>
              ) : (
                sortedStores.map((store) => (
                  <tr key={store.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{store.name}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[store.status]}>
                        {statusLabels[store.status] || store.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ₼{store.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">{store.orders.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{store.products}</td>
                    <td className="px-4 py-3 text-right">{store.customers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className={`flex items-center justify-end gap-1 ${store.growth > 0 ? 'text-green-600' : store.growth < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {store.growth > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : store.growth < 0 ? (
                          <TrendingUp className="h-3 w-3 rotate-180" />
                        ) : null}
                        {Math.abs(store.growth)}%
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}