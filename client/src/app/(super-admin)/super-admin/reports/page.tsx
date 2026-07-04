'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  FileText,
  Printer,
  Mail,
  RefreshCw,
  Store,
  Users,
  DollarSign,
  Package,
  Activity,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useToast } from '@/hooks/useToast';

// Mock Data
const systemRevenueData = [
  { name: 'Yan', revenue: 45000, orders: 320, stores: 8 },
  { name: 'Fev', revenue: 52000, orders: 380, stores: 9 },
  { name: 'Mar', revenue: 48000, orders: 350, stores: 9 },
  { name: 'Apr', revenue: 61000, orders: 420, stores: 10 },
  { name: 'May', revenue: 72000, orders: 480, stores: 11 },
  { name: 'İyn', revenue: 85000, orders: 520, stores: 12 },
];

const storeRevenueData = [
  { name: 'Elektronika Dünyası', revenue: 45600, orders: 320, growth: 15.2 },
  { name: 'Moda Mərkəzi', revenue: 32400, orders: 280, growth: 8.7 },
  { name: 'Qida Supermarket', revenue: 28500, orders: 450, growth: 12.3 },
  { name: 'Texno Store', revenue: 21500, orders: 190, growth: -2.1 },
  { name: 'Gözəllik Salonu', revenue: 18000, orders: 150, growth: 5.6 },
];

const userGrowthData = [
  { name: 'Yan', users: 45, admins: 3 },
  { name: 'Fev', users: 58, admins: 4 },
  { name: 'Mar', users: 72, admins: 4 },
  { name: 'Apr', users: 89, admins: 5 },
  { name: 'May', users: 110, admins: 5 },
  { name: 'İyn', users: 156, admins: 5 },
];

const topStores = [
  { name: 'Elektronika Dünyası', revenue: 45600, growth: 15.2, color: '#4F46E5' },
  { name: 'Moda Mərkəzi', revenue: 32400, growth: 8.7, color: '#7C3AED' },
  { name: 'Qida Supermarket', revenue: 28500, growth: 12.3, color: '#10B981' },
  { name: 'Texno Store', revenue: 21500, growth: -2.1, color: '#F59E0B' },
  { name: 'Gözəllik Salonu', revenue: 18000, growth: 5.6, color: '#EC4899' },
];

export default function SuperAdminReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('system');
  const [period, setPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = (format: string) => {
    toast({
      title: `📥 ${format.toUpperCase()} ixrac edilir`,
      description: 'Hesabat yüklənir...',
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
            <BarChart3 className="h-7 w-7 text-red-600" />
            Sistem Hesabatları
          </h1>
          <p className="text-muted-foreground">
            Bütün sistem üzrə hesabatları təhlil edin
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

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ümumi Gəlir</p>
                <p className="text-2xl font-bold text-red-600">₼284,500</p>
                <p className="text-xs text-green-600">+12.5% artım</p>
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
                <p className="text-2xl font-bold">2,420</p>
                <p className="text-xs text-green-600">+8.3% artım</p>
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
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-green-600">+2 yeni</p>
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
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-green-600">+8 bu həftə</p>
              </div>
              <Users className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orta Sifariş</p>
                <p className="text-2xl font-bold">₼117.56</p>
                <p className="text-xs text-green-600">+4.2% artım</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sistem Gəlir Trendi</CardTitle>
                <CardDescription>Aylıq gəlir, sifariş və mağaza sayı</CardDescription>
              </div>
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList>
                  <TabsTrigger value="monthly">Aylıq</TabsTrigger>
                  <TabsTrigger value="quarterly">Rüblük</TabsTrigger>
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
                  <LineChart data={systemRevenueData}>
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
                      dataKey="revenue"
                      stroke="#DC2626"
                      strokeWidth={2}
                      name="Gəlir (₼)"
                      dot={{ fill: '#DC2626', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      name="Sifarişlər"
                      dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="stores"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Mağazalar"
                      dot={{ fill: '#10B981', strokeWidth: 2 }}
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
                  <BarChart data={topStores} layout="vertical">
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
                      {topStores.map((entry, index) => (
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

      {/* User Growth & Store Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İstifadəçi Artımı</CardTitle>
            <CardDescription>Aylıq istifadəçi və admin artımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData}>
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
                  <Bar dataKey="users" fill="#4F46E5" name="İstifadəçilər" />
                  <Bar dataKey="admins" fill="#DC2626" name="Adminlər" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mağaza Statistikası</CardTitle>
            <CardDescription>Hər mağazanın performansı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storeRevenueData.map((store, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-muted-foreground">{store.orders} sifariş</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">₼{store.revenue.toLocaleString()}</p>
                    <Badge variant={store.growth > 0 ? 'success' : 'destructive'}>
                      {store.growth > 0 ? '+' : ''}{store.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}