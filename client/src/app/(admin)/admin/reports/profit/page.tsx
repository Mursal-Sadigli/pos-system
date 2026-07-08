'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Printer } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export default function ProfitReportPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total_sales: 0, total_profit: 0 });

  const fetchProfitData = async () => {
    setLoading(true);
    try {
      const [productsRes, summaryRes] = await Promise.all([
        reportsApi.getTopProducts({ limit: 50 }),
        reportsApi.getSalesSummary()
      ]);
      setProducts(productsRes.data.data || []);
      setSummary(summaryRes.data.data.summary || { total_sales: 0, total_profit: 0 });
    } catch (err) {
      toast.error('Mənfəət hesabatı yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitData();
  }, []);

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(products.map(p => ({
        'Məhsul': p.name,
        'Kateqoriya': p.category,
        'Satış Sayı': p.total_qty,
        'Gəlir (₼)': p.total_revenue.toFixed(2),
        'Mənfəət (₼)': p.total_profit.toFixed(2),
        'Marja (%)': p.margin_pct.toFixed(1)
      })));
      XLSX.utils.book_append_sheet(wb, ws, 'Mənfəət Hesabatı');
      XLSX.writeFile(wb, `POS-Menfeet-Hesabati-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Mənfəət hesabatı Excel formatında yükləndi');
    } catch (err) {
      toast.error('İxrac zamanı xəta baş verdi');
    }
  };

  const avgMargin = summary.total_sales > 0 ? (summary.total_profit / summary.total_sales) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mənfəət və Marja Hesabatı</h1>
          <p className="text-muted-foreground">Məhsulların maya dəyərinə (cost) əsasən mənfəət analizi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProfitData} disabled={loading}>
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Yenilə
          </Button>
          <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4 mr-2" />
            Excel Yüklə
          </Button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ümumi Gəlir (Satış)</p>
            <p className="text-2xl font-bold mt-1">₼{summary.total_sales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Xalis Mənfəət</p>
            <p className="text-2xl font-bold mt-1 text-green-600">₼{summary.total_profit.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Orta Marja</p>
            <p className="text-2xl font-bold mt-1">{avgMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Məhsul Mənfəətliliyi</CardTitle>
          <CardDescription>Hər bir məhsulun gətirdiyi ümumi mənfəət və marja payı</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground font-medium">
                    <th className="px-4 py-3">Məhsul</th>
                    <th className="px-4 py-3">Kateqoriya</th>
                    <th className="px-4 py-3 text-right">Satış Sayı</th>
                    <th className="px-4 py-3 text-right">Gəlir</th>
                    <th className="px-4 py-3 text-right">Mənfəət</th>
                    <th className="px-4 py-3 text-right">Marja</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((row, index) => (
                    <tr key={index} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                      <td className="px-4 py-3 text-right">{row.total_qty}</td>
                      <td className="px-4 py-3 text-right">₼{row.total_revenue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-bold">₼{row.total_profit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={row.margin_pct > 30 ? 'success' : 'secondary'}>
                          {row.margin_pct.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Məlumat tapılmadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
