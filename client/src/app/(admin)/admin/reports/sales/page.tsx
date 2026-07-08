'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export default function SalesReportPage() {
  const [loading, setLoading] = useState(true);
  const [dailyReports, setDailyReports] = useState<any[]>([]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getSalesSummary();
      setDailyReports(res.data.data.dailyReports || []);
    } catch (err) {
      toast.error('Gündəlik kassa hesabatını yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dailyReports.map(r => ({
        'Tarix': r.date,
        'Kassir': r.cashier,
        'Sifariş Sayı': r.total_orders,
        'Toplam Satış (₼)': r.total_sales.toFixed(2)
      })));
      XLSX.utils.book_append_sheet(wb, ws, 'Satış Hesabatı');
      XLSX.writeFile(wb, `POS-Satis-Hesabati-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Excel faylı uğurla yükləndi');
    } catch (err) {
      toast.error('İxrac zamanı xəta baş verdi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detallı Satış Hesabatı</h1>
          <p className="text-muted-foreground">Kassirlər üzrə gündəlik kassa və sifariş statistikası</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSalesData} disabled={loading}>
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Yenilə
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Çap et
          </Button>
          <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="h-4 w-4 mr-2" />
            Excel Yüklə
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gündəlik Satış Cədvəli</CardTitle>
          <CardDescription>Hər gün üçün kassir satış dövriyyəsi xülasəsi</CardDescription>
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
                    <th className="px-4 py-3">Tarix</th>
                    <th className="px-4 py-3">Kassir</th>
                    <th className="px-4 py-3 text-right">Sifariş Sayı</th>
                    <th className="px-4 py-3 text-right">Ümumi Satış</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dailyReports.map((row, index) => (
                    <tr key={index} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3 font-medium">{row.cashier}</td>
                      <td className="px-4 py-3 text-right">{row.total_orders}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">₼{row.total_sales.toFixed(2)}</td>
                    </tr>
                  ))}
                  {dailyReports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Hesabat məlumatı tapılmadı.</td>
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
