'use client';

import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  LineChart,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Pie,
  Cell,
} from 'recharts';
import { Printer, Download, RefreshCw } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const reportTabs = [
  { value: 'sales', label: '📊 Satış' },
  { value: 'analytics', label: '📈 Analitika' },
];

const dateRanges = ['Bugün', 'Həftə', 'Ay', 'İl', 'Custom'];
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [activeRange, setActiveRange] = useState('Bugün');
  const [register, setRegister] = useState('Hamısı');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total_sales: 0, total_orders: 0, total_profit: 0 });
  const [chartData, setChartData] = useState([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let start = '';
      let end = format(new Date(), 'yyyy-MM-dd');
      
      const today = new Date();
      if (activeRange === 'Bugün') {
        start = format(today, 'yyyy-MM-dd');
      } else if (activeRange === 'Həftə') {
        start = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else if (activeRange === 'Ay') {
        start = format(startOfMonth(today), 'yyyy-MM-dd');
      } else if (activeRange === 'İl') {
        start = format(startOfYear(today), 'yyyy-MM-dd');
      } else if (activeRange === 'Custom') {
        start = fromDate;
        end = toDate || end;
      }

      const params = start ? { startDate: start, endDate: end } : {};
      
      const [summaryRes, topProductsRes] = await Promise.all([
        reportsApi.getSalesSummary(params),
        reportsApi.getTopProducts({ ...params, limit: 5 })
      ]);
      
      const data = summaryRes.data.data;
      setSummary(data.summary || { total_sales: 0, total_orders: 0, total_profit: 0 });
      setChartData(data.chartData || []);
      setDailyReports(data.dailyReports || []);
      setTopProducts(topProductsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Məlumatların yüklənməsində xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRange !== 'Custom') {
      fetchData();
    }
  }, [activeRange]);

  const handleCustomSearch = () => {
    if (!fromDate) {
      toast.error('Başlanğıc tarixini daxil edin');
      return;
    }
    fetchData();
  };

  const filteredReports = useMemo(() => {
    return dailyReports.filter((row) => {
      return register === 'Hamısı' || row.cashier === register;
    });
  }, [dailyReports, register]);
  
  // Format top products for pie chart
  const pieData = topProducts.map((p, index) => ({
    name: p.name,
    value: Number(p.total_qty),
    color: COLORS[index % COLORS.length]
  }));

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(filteredReports.map(r => ({
        'Tarix': r.date,
        'Kassir': r.cashier,
        'Sifariş Sayı': r.total_orders,
        'Toplam Satış (₼)': r.total_sales.toFixed(2)
      })));
      XLSX.utils.book_append_sheet(wb, ws, 'Gündəlik Satış');
      XLSX.writeFile(wb, `POS-User-Satis-Hesabati-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Excel faylı uğurla yükləndi');
    } catch (err) {
      toast.error('İxrac zamanı xəta baş verdi');
    }
  };

  // Get unique cashiers for filter dropdown
  const uniqueCashiers = useMemo(() => {
    const list = dailyReports.map(r => r.cashier);
    return ['Hamısı', ...Array.from(new Set(list))];
  }, [dailyReports]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kassa Hesabatları</h1>
            <p className="text-sm text-muted-foreground">
              Yalnız POS (Kassa) satışları, mənfəət və analitik məlumatlar.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              Yenilə
            </Button>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="gap-2">
                {reportTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrlər</CardTitle>
          <CardDescription>Tarix və kassa üzrə hesabatları daralt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {dateRanges.map((range) => (
              <Button
                key={range}
                variant={activeRange === range ? 'secondary' : 'outline'}
                onClick={() => setActiveRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>

          {activeRange === 'Custom' && (
            <div className="flex items-end gap-4 p-4 border rounded-lg bg-muted/40">
              <div className="grid gap-2">
                <Label htmlFor="from-date">Başlanğıc</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to-date">Son</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
              <Button onClick={handleCustomSearch} disabled={loading}>Araşdır</Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <Label htmlFor="register-select">Kassir / Kassa</Label>
              <select
                id="register-select"
                value={register}
                onChange={(event) => setRegister(event.target.value)}
                className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                {uniqueCashiers.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Yüklənir...</div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Ümumi Satış</p>
                <h3 className="text-3xl font-bold mt-2">₼{Number(summary.total_sales).toFixed(2)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200 dark:bg-green-950/20">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Mənfəət (Xalis Qazanc)</p>
                <h3 className="text-3xl font-bold mt-2 text-green-600">₼{Number(summary.total_profit).toFixed(2)}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Sifariş Sayı</p>
                <h3 className="text-3xl font-bold mt-2">{summary.total_orders}</h3>
              </CardContent>
            </Card>
          </div>

          {activeTab === 'sales' && (
            <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
              <Card className="xl:col-span-1">
                <CardHeader>
                  <CardTitle>Satış qrafiki (Günlük)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          name="Satış (₼)"
                          dataKey="sales"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ən çox satılan məhsullar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px]">
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          Məlumat yoxdur
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Günlük Kassa Xülasəsi (Daily Summary)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Çap et
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Excel yüklə
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tarix</th>
                      <th className="px-4 py-3 font-medium">Kassir</th>
                      <th className="px-4 py-3 font-medium text-right">Sifariş Sayı</th>
                      <th className="px-4 py-3 font-medium text-right">Ümumi Satış (₼)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredReports.map((row, index) => (
                      <tr key={index} className="transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3 font-medium">{row.cashier}</td>
                        <td className="px-4 py-3 text-right">{row.total_orders}</td>
                        <td className="px-4 py-3 text-right font-bold text-primary">
                          ₼{Number(row.total_sales).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {filteredReports.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          Seçilmiş tarix üçün məlumat tapılmadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}