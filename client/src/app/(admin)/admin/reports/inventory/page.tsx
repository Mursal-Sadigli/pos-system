'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, AlertTriangle, Package, CheckCircle, Mail } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export default function InventoryReportPage() {
  const [loading, setLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [outOfStock, setOutOfStock] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total_products: 0, total_items: 0, total_cost_value: 0, total_retail_value: 0 });
  const [byCategory, setByCategory] = useState<any[]>([]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getInventoryReport();
      const data = res.data.data;
      setLowStock(data.lowStock || []);
      setOutOfStock(data.outOfStock || []);
      setSummary(data.summary || { total_products: 0, total_items: 0, total_cost_value: 0, total_retail_value: 0 });
      setByCategory(data.byCategory || []);
    } catch (err) {
      toast.error('İnventar hesabatı yüklənə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Category Summary Sheet
      const catWS = XLSX.utils.json_to_sheet(byCategory.map(c => ({
        'Kateqoriya': c.category,
        'Məhsul Çeşidi': c.product_count,
        'Toplam Məhsul (Ədəd)': c.total_stock,
        'Toplam Maya Qiyməti (₼)': c.total_cost_value.toFixed(2)
      })));
      XLSX.utils.book_append_sheet(wb, catWS, 'Kateqoriya Üzrə Xülasə');

      // Low Stock Sheet
      if (lowStock.length > 0) {
        const lowWS = XLSX.utils.json_to_sheet(lowStock.map(p => ({
          'Məhsul': p.name,
          'SKU': p.sku,
          'Kateqoriya': p.category,
          'Mövcud Stok': p.stock,
          'Kritik Limit': p.min_stock,
          'Qiymət (₼)': p.price.toFixed(2)
        })));
        XLSX.utils.book_append_sheet(wb, lowWS, 'Kritik Stok');
      }

      // Out of Stock Sheet
      if (outOfStock.length > 0) {
        const outWS = XLSX.utils.json_to_sheet(outOfStock.map(p => ({
          'Məhsul': p.name,
          'SKU': p.sku,
          'Kateqoriya': p.category,
          'Qiymət (₼)': p.price.toFixed(2)
        })));
        XLSX.utils.book_append_sheet(wb, outWS, 'Tükənmiş Məhsullar');
      }

      XLSX.writeFile(wb, `POS-Inventar-Hesabati-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('İnventar hesabatı Excel formatında yükləndi');
    } catch (err) {
      toast.error('İxrac zamanı xəta baş verdi');
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await reportsApi.sendReportEmail({ type: 'inventory' });
      toast.success('Stok hesabatı email ünvanınıza göndərildi');
    } catch (err: any) {
      toast.error('Email göndərilərkən xəta baş verdi');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İnventar və Stok Hesabatı</h1>
          <p className="text-muted-foreground">Məhsul ehtiyatı, kritik səviyyə və ümumi anbar dəyəri</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchInventoryData} disabled={loading}>
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Yenilə
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={isSendingEmail}>
            <Mail className="h-4 w-4 mr-2" />
            {isSendingEmail ? 'Göndərilir...' : 'Email Göndər'}
          </Button>
          <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4 mr-2" />
            Excel Yüklə
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Məhsul Çeşidi</p>
              <p className="text-2xl font-bold mt-1">{summary.total_products}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Toplam Stok (Ədəd)</p>
              <p className="text-2xl font-bold mt-1">{summary.total_items}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stok Maya Dəyəri</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">₼{summary.total_cost_value.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stok Satış Dəyəri</p>
              <p className="text-2xl font-bold mt-1 text-green-600">₼{summary.total_retail_value.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Low Stock Alert */}
          <Card className={lowStock.length > 0 ? 'border-amber-200 bg-amber-50/10' : ''}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle>Kritik Ehtiyat (Az Qalanlar)</CardTitle>
              </div>
              <CardDescription>Minimum stok limitinə çatmış məhsullar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-2">Məhsul</th>
                      <th className="pb-2 text-right">Mövcud</th>
                      <th className="pb-2 text-right">Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2.5 font-medium">{p.name}</td>
                        <td className="py-2.5 text-right font-semibold text-amber-600">{p.stock}</td>
                        <td className="py-2.5 text-right text-muted-foreground">{p.min_stock}</td>
                      </tr>
                    ))}
                    {lowStock.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-60" />
                          Bütün məhsulların ehtiyatı kifayətdir.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Out of Stock Alert */}
          <Card className={outOfStock.length > 0 ? 'border-rose-200 bg-rose-50/10' : ''}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <CardTitle>Bitmiş Ehtiyat (0 Stok)</CardTitle>
              </div>
              <CardDescription>Tamamilə tükənmiş məhsullar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-2">Məhsul</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2 text-right">Qiymət</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outOfStock.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2.5 font-medium">{p.name}</td>
                        <td className="py-2.5 text-muted-foreground">{p.sku}</td>
                        <td className="py-2.5 text-right text-rose-500 font-bold">₼{p.price.toFixed(2)}</td>
                      </tr>
                    ))}
                    {outOfStock.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-60" />
                          Hazırda stoku bitən məhsul yoxdur.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
