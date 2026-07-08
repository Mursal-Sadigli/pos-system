'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Printer,
  Mail,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Percent,
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { reportsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import * as XLSX from 'xlsx';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // States for data
  const [summary, setSummary] = useState({ total_sales: 0, total_orders: 0, total_profit: 0, avg_order: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Custom date inputs
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      let start = '';
      let end = format(new Date(), 'yyyy-MM-dd');
      const today = new Date();

      if (period === 'weekly') {
        start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else if (period === 'monthly') {
        start = format(startOfMonth(today), 'yyyy-MM-dd');
      } else if (period === 'yearly') {
        start = format(startOfYear(today), 'yyyy-MM-dd');
      } else if (period === 'custom') {
        start = startDate;
        end = endDate || end;
      }

      const params = start ? { startDate: start, endDate: end } : {};

      const [summaryRes, categoryRes, topProductsRes] = await Promise.all([
        reportsApi.getSalesSummary(params),
        reportsApi.getByCategory(params),
        reportsApi.getTopProducts(params),
      ]);

      setSummary(summaryRes.data.data.summary);
      setChartData(summaryRes.data.data.chartData);
      
      // Category data mapping for PieChart
      const categories = categoryRes.data.data.map((c: any, index: number) => ({
        name: c.category,
        value: Number(c.total_sales),
        color: COLORS[index % COLORS.length]
      }));
      setCategoryData(categories);

      setTopProducts(topProductsRes.data.data);
    } catch (error: any) {
      console.error('Failed to fetch reports:', error);
      toast.error('Məlumatların gətirilməsində xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (period !== 'custom') {
      setShowCustomDates(false);
      fetchReportData();
    } else {
      setShowCustomDates(true);
    }
  }, [period]);

  const handleCustomDateSearch = () => {
    if (!startDate) {
      toast.error('Başlanğıc tarixini daxil edin');
      return;
    }
    fetchReportData();
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryWS = XLSX.utils.json_to_sheet([
        { 'Göstərici': 'Ümumi Satış (₼)', 'Qiymət': summary.total_sales.toFixed(2) },
        { 'Göstərici': 'Xalis Mənfəət (₼)', 'Qiymət': summary.total_profit.toFixed(2) },
        { 'Göstərici': 'Sifariş Sayı', 'Qiymət': summary.total_orders },
        { 'Göstərici': 'Orta Sifariş (₼)', 'Qiymət': summary.avg_order.toFixed(2) }
      ]);
      XLSX.utils.book_append_sheet(wb, summaryWS, 'Xülasə');

      // Top Products Sheet
      if (topProducts.length > 0) {
        const productsWS = XLSX.utils.json_to_sheet(topProducts.map(p => ({
          'Məhsul': p.name,
          'Kateqoriya': p.category,
          'Satış Sayı': p.total_qty,
          'Gəlir (₼)': p.total_revenue.toFixed(2),
          'Mənfəət (₼)': p.total_profit.toFixed(2),
          'Marja (%)': p.margin_pct.toFixed(1)
        })));
        XLSX.utils.book_append_sheet(wb, productsWS, 'Ən Çox Satılanlar');
      }

      XLSX.writeFile(wb, `POS-Hesabat-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Excel faylı uğurla yükləndi');
    } catch (err) {
      toast.error('Excel faylı yaradıla bilmədi');
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      let start = '';
      let end = format(new Date(), 'yyyy-MM-dd');
      const today = new Date();

      if (period === 'weekly') {
        start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else if (period === 'monthly') {
        start = format(startOfMonth(today), 'yyyy-MM-dd');
      } else if (period === 'yearly') {
        start = format(startOfYear(today), 'yyyy-MM-dd');
      } else if (period === 'custom') {
        start = startDate;
        end = endDate || end;
      }

      await reportsApi.sendReportEmail({
        type: 'sales',
        startDate: start,
        endDate: end
      });
      toast.success('Hesabat email ünvanınıza göndərildi');
    } catch (err: any) {
      toast.error('Email göndərilərkən xəta baş verdi');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hesabatlar</h1>
          <p className="text-muted-foreground">Mağaza performansını real vaxtda təhlil edin</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchReportData} className="gap-2" disabled={isLoading}>
            <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Yenilə
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Çap et
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail} className="gap-2" disabled={isSendingEmail}>
            <Mail className="h-4 w-4" />
            {isSendingEmail ? 'Göndərilir...' : 'Göndər'}
          </Button>
          <Button variant="default" size="sm" onClick={handleExportExcel} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4" />
            İxrac et (Excel)
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ümumi Satış</p>
              <p className="text-2xl font-bold mt-1">₼{summary.total_sales.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Xalis Mənfəət</p>
              <p className="text-2xl font-bold mt-1 text-green-600">₼{summary.total_profit.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sifarişlər</p>
              <p className="text-2xl font-bold mt-1">{summary.total_orders}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orta Sifariş Məbləği</p>
              <p className="text-2xl font-bold mt-1">₼{summary.avg_order.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selection & Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
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
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Dövr seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Bu Həftə</SelectItem>
                  <SelectItem value="monthly">Bu Ay</SelectItem>
                  <SelectItem value="yearly">Bu İl</SelectItem>
                  <SelectItem value="custom">Xüsusi Tarix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showCustomDates && (
            <div className="flex items-end gap-4 p-4 border rounded-lg bg-muted/40">
              <div className="grid gap-2">
                <label className="text-xs font-semibold">Başlanğıc Tarixi</label>
                <input
                  type="date"
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold">Son Tarix</label>
                <input
                  type="date"
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleCustomDateSearch} disabled={isLoading}>Araşdır</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Content Based on Tabs */}
      {isLoading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {reportType === 'sales' && (
            <Card>
              <CardHeader>
                <CardTitle>Satış və Mənfəət Qrafiki (Günlük)</CardTitle>
                <CardDescription>Seçilmiş dövrdəki günlük gəlir və qazanc dinamikası</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" name="Satış (₼)" dataKey="sales" stroke="#4F46E5" strokeWidth={3} dot={false} />
                        <Line type="monotone" name="Mənfəət (₼)" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">Məlumat yoxdur</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === 'category' && (
            <Card>
              <CardHeader>
                <CardTitle>Kateqoriyalar üzrə Satış</CardTitle>
                <CardDescription>Kateqoriyaların ümumi dövriyyədəki payı</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-full max-w-md">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₼${Number(value).toFixed(2)}`} />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">Məlumat yoxdur</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === 'products' && (
            <Card>
              <CardHeader>
                <CardTitle>Ən Çox Satılan 5 Məhsul</CardTitle>
                <CardDescription>Seçilmiş dövrdə ən çox satılan məhsulların siyahısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="px-4 py-3">Məhsul</th>
                        <th className="px-4 py-3">Kateqoriya</th>
                        <th className="px-4 py-3 text-right">Satış Sayı</th>
                        <th className="px-4 py-3 text-right">Ümumi Gəlir</th>
                        <th className="px-4 py-3 text-right">Mənfəət</th>
                        <th className="px-4 py-3 text-right">Marja (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={index} className="border-b transition-colors hover:bg-muted/50 text-sm">
                          <td className="px-4 py-3 font-medium">{product.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                          <td className="px-4 py-3 text-right">{product.total_qty}</td>
                          <td className="px-4 py-3 text-right">₼{product.total_revenue.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">₼{product.total_profit.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={product.margin_pct > 30 ? 'success' : 'secondary'}>
                              {product.margin_pct.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {topProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Məlumat tapılmadı.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}