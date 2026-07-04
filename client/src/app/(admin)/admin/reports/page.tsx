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
const salesData = [
  { name: 'B.e', sales: 1200, profit: 480 },
  { name: 'Ç.a', sales: 1800, profit: 720 },
  { name: 'Ç', sales: 1500, profit: 600 },
  { name: 'C.a', sales: 2100, profit: 840 },
  { name: 'C', sales: 2400, profit: 960 },
  { name: 'Ş', sales: 2800, profit: 1120 },
  { name: 'B', sales: 1900, profit: 760 },
];

const categoryData = [
  { name: 'Elektronika', value: 45, color: '#4F46E5' },
  { name: 'Geyim', value: 25, color: '#7C3AED' },
  { name: 'Qida', value: 20, color: '#10B981' },
  { name: 'Aksesuarlar', value: 10, color: '#F59E0B' },
];

const topProducts = [
  { name: 'iPhone 15 Pro', sales: 45, revenue: 58455, profit: 17536 },
  { name: 'Samsung S24', sales: 32, revenue: 31968, profit: 9590 },
  { name: 'MacBook Pro', sales: 18, revenue: 35982, profit: 10794 },
  { name: 'AirPods Pro', sales: 56, revenue: 13944, profit: 4183 },
  { name: 'iPad Air', sales: 24, revenue: 14376, profit: 4312 },
];

const monthlyData = [
  { name: 'Yan', sales: 15000, profit: 6000 },
  { name: 'Fev', sales: 18000, profit: 7200 },
  { name: 'Mar', sales: 16500, profit: 6600 },
  { name: 'Apr', sales: 21000, profit: 8400 },
  { name: 'May', sales: 24000, profit: 9600 },
  { name: 'İyn', sales: 28000, profit: 11200 },
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(false);

  const stats = {
    totalSales: 13700,
    totalOrders: 89,
    totalProfit: 5480,
    averageOrder: 154,
    growth: 12.5,
  };

  const handleExport = (format: string) => {
    toast({
      title: `📥 ${format.toUpperCase()} ixrac edilir`,
      description: 'Hesabat yüklənir...',
    });
  };

  const handleSendEmail = () => {
    toast({
      title: '📧 Email göndərildi',
      description: 'Hesabat email ünvanınıza göndərildi',
    });
  };

  const handlePrint = () => {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as { print?: () => void }).print === 'function') {
      (globalThis as { print?: () => void }).print?.();
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: '✅ Hesabat yeniləndi',
        description: 'Ən son məlumatlar yükləndi',
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hesabatlar</h1>
          <p className="text-muted-foreground">
            Mağaza performansını təhlil edin
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Yenilə
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Çap et
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail} className="gap-2">
            <Mail className="h-4 w-4" />
            Göndər
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ümumi Satış</p>
            <p className="text-2xl font-bold">₼{stats.totalSales.toFixed(2)}</p>
            <p className="text-xs text-green-600">+{stats.growth}% əvvəlki həftə</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sifarişlər</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-green-600">+8.2% əvvəlki həftə</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Mənfəət</p>
            <p className="text-2xl font-bold text-green-600">₼{stats.totalProfit.toFixed(2)}</p>
            <p className="text-xs text-green-600">+15.3% əvvəlki həftə</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Orta Sifariş</p>
            <p className="text-2xl font-bold">₼{stats.averageOrder.toFixed(2)}</p>
            <p className="text-xs text-blue-600">+3.1% əvvəlki həftə</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Böyümə</p>
            <p className="text-2xl font-bold text-green-600">+{stats.growth}%</p>
            <p className="text-xs text-muted-foreground">Həftəlik artım</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Tabs value={reportType} onValueChange={setReportType} className="flex-1">
              <TabsList>
                <TabsTrigger value="sales" className="gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  Satış
                </TabsTrigger>
                <TabsTrigger value="category" className="gap-2">
                  <PieChart className="h-4 w-4" />
                  Kateqoriyalar
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Məhsullar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Dövr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Həftəlik</SelectItem>
                  <SelectItem value="monthly">Aylıq</SelectItem>
                  <SelectItem value="yearly">İllik</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Satış Trendi</CardTitle>
            <CardDescription>
              {period === 'weekly' ? 'Həftəlik' : period === 'monthly' ? 'Aylıq' : 'İllik'} satış və mənfəət
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={period === 'weekly' ? salesData : monthlyData}>
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
                      dataKey="sales"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      name="Satış"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Mənfəət"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Kateqoriyalar</CardTitle>
            <CardDescription>Məhsul kateqoriyalarına görə pay</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Ən Çox Satılan Məhsullar</CardTitle>
          <CardDescription>Bu dövrdə ən çox satılan 5 məhsul</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Məhsul</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Satış</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Gəlir</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Mənfəət</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Marja</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => {
                  const margin = ((product.profit / product.revenue) * 100).toFixed(1);
                  return (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-right">{product.sales}</td>
                      <td className="px-4 py-3 text-right font-medium">₼{product.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-green-600">₼{product.profit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={parseFloat(margin) > 30 ? 'success' : 'default'}>
                          {margin}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}