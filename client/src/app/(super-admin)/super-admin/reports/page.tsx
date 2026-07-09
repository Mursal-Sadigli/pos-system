'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  BarChart3,
  RefreshCw,
  Store,
  Users,
  DollarSign,
  Package,
  Activity,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useToast } from '@/hooks/useToast';
import { reportsApi } from '@/lib/api';

export default function SuperAdminReportsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);

  const [summary, setSummary] = useState<any>({
    total_sales: 0,
    total_orders: 0,
    total_users: 0,
    total_stores: 0,
    avg_order: 0,
    sales_growth: 0,
    orders_growth: 0,
    stores_growth: 0,
    users_growth: 0,
    avg_order_growth: 0
  });

  const [trends, setTrends] = useState<any[]>([]);
  const [topStores, setTopStores] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);

  const fetchData = async (showToast = false) => {
    setIsLoading(true);
    try {
      const [sumRes, trendRes, storesRes, usersRes] = await Promise.all([
        reportsApi.getSystemSummary(),
        reportsApi.getSystemTrends(period),
        reportsApi.getTopStores(),
        reportsApi.getUserGrowth()
      ]);

      setSummary(sumRes.data.data);
      setTrends(trendRes.data.data);
      setTopStores(storesRes.data.data);
      setUserGrowth(usersRes.data.data);

      if (showToast) {
        toast({
          title: '✅ Hesabat yeniləndi',
          description: 'Ən son məlumatlar yükləndi',
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Xəta',
        description: error.response?.data?.message || 'Məlumatları yükləmək mümkün olmadı',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [period]);

  const handleExport = (format: string) => {
    if (format === 'csv') {
      // Basic CSV export
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Magaza Adi,Gelir,Sifarisler\n";
      topStores.forEach(store => {
        csvContent += `${store.name},${store.revenue},${store.orders}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "top_stores.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: `📥 CSV ixrac edildi`,
        description: 'Hesabat uğurla yükləndi.',
      });
    } else {
      toast({
        title: `📥 ${format.toUpperCase()} ixrac edilir`,
        description: 'Bu format tezliklə əlavə ediləcək.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-red-600" />
            Sistem Hesabatları
          </h1>
          <p className="text-muted-foreground">
            Bütün sistem üzrə hesabatları təhlil edin
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

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi Gəlir</p>
                <p className="text-2xl font-bold text-red-600">₼{summary.total_sales.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{summary.sales_growth}% artım</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi Sifarişlər</p>
                <p className="text-2xl font-bold">{summary.total_orders.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{summary.orders_growth}% artım</p>
              </div>
              <Package className="h-8 w-8 text-blue-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mağazalar</p>
                <p className="text-2xl font-bold">{summary.total_stores}</p>
                <p className="text-xs text-green-600">+{summary.stores_growth} yeni</p>
              </div>
              <Store className="h-8 w-8 text-purple-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">İstifadəçilər</p>
                <p className="text-2xl font-bold">{summary.total_users}</p>
                <p className="text-xs text-green-600">+{summary.users_growth}% artım</p>
              </div>
              <Users className="h-8 w-8 text-orange-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orta Sifariş</p>
                <p className="text-2xl font-bold">₼{summary.avg_order.toFixed(2)}</p>
                <p className="text-xs text-green-600">+{summary.avg_order_growth}% artım</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-600/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Ümumi Baxış</TabsTrigger>
          <TabsTrigger value="stores">Mağaza Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Sistem Gəlir Trendi</CardTitle>
                <CardDescription>Bütün mağazalar üzrə aylıq gəlir və sifariş qrafiki</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" name="Gəlir (₼)" stroke="#DC2626" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="orders" name="Sifarişlər" stroke="#2563EB" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>İstifadəçi Artımı</CardTitle>
                <CardDescription>Sistemə qoşulan yeni istifadəçilərin dinamikası</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" name="İstifadəçilər" fill="#F59E0B" stackId="a" />
                      <Bar dataKey="admins" name="Adminlər" fill="#8B5CF6" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Mağaza Performansı</CardTitle>
                <CardDescription>Ən çox gəlir gətirən mağazalar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topStores} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="revenue" name="Gəlir (₼)" fill="#DC2626" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mağaza Statistikası</CardTitle>
                <CardDescription>Əsas göstəricilər</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {topStores.map((store, index) => (
                    <div key={index} className="flex items-center">
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{store.name}</p>
                        <p className="text-sm text-muted-foreground">{store.orders} sifariş</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₼{store.revenue.toLocaleString()}</div>
                        <div className="text-xs text-green-500">
                          <TrendingUp className="inline h-3 w-3 mr-1" />
                          {store.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}