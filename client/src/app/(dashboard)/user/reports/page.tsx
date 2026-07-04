'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  LineChart,
  PieChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Pie,
  Cell,
  Bar,
} from 'recharts';
import { FileText, Printer, Mail } from 'lucide-react';

const reportTabs = [
  { value: 'sales', label: '📊 Satış' },
  { value: 'stock', label: '📦 Stok' },
  { value: 'profit', label: '💰 Mənfəət' },
  { value: 'tax', label: '🧾 Vergi' },
  { value: 'analytics', label: '📈 Analitika' },
];

const dateRanges = ['Bugün', 'Həftə', 'Ay', 'İl', 'Custom'];

const salesData = [
  { name: 'Mon', sales: 6200 },
  { name: 'Tue', sales: 5400 },
  { name: 'Wed', sales: 6800 },
  { name: 'Thu', sales: 7200 },
  { name: 'Fri', sales: 8100 },
  { name: 'Sat', sales: 9000 },
  { name: 'Sun', sales: 7600 },
];

const categoryData = [
  { name: 'Qida', value: 42 },
  { name: 'İçki', value: 26 },
  { name: 'Aksesuar', value: 16 },
  { name: 'Kənd təsərrüfatı', value: 16 },
];

const dailyCompareData = [
  { name: 'Mon', thisWeek: 6200, lastWeek: 5400 },
  { name: 'Tue', thisWeek: 5400, lastWeek: 5000 },
  { name: 'Wed', thisWeek: 6800, lastWeek: 6200 },
  { name: 'Thu', thisWeek: 7200, lastWeek: 6900 },
  { name: 'Fri', thisWeek: 8100, lastWeek: 7700 },
  { name: 'Sat', thisWeek: 9000, lastWeek: 8500 },
];

const reportRows = [
  {
    id: 'RPT-001',
    date: '30.06.2026',
    store: 'Mağaza 1',
    register: 'Kassa 1',
    sales: 12450,
    profit: 2980,
    tax: 520,
    status: 'Tamamlandı',
  },
  {
    id: 'RPT-002',
    date: '30.06.2026',
    store: 'Mağaza 2',
    register: 'Kassa 3',
    sales: 8450,
    profit: 1720,
    tax: 320,
    status: 'İşlənir',
  },
  {
    id: 'RPT-003',
    date: '29.06.2026',
    store: 'Mağaza 1',
    register: 'Kassa 2',
    sales: 10150,
    profit: 2430,
    tax: 430,
    status: 'Gözləmədə',
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [activeRange, setActiveRange] = useState('Bugün');
  const [store, setStore] = useState('Hamısı');
  const [register, setRegister] = useState('Hamısı');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredReports = useMemo(() => {
    return reportRows.filter((row) => {
      const matchesStore = store === 'Hamısı' || row.store === store;
      const matchesRegister = register === 'Hamısı' || row.register === register;
      return matchesStore && matchesRegister;
    });
  }, [store, register]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hesabatlar</h1>
            <p className="text-sm text-muted-foreground">
              Satış, stok, mənfəət və vergi hesabatlarını buradan izləyin.
            </p>
          </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Filtrlər</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tarix, mağaza və kassa üzrə hesabatları daralt.
          </p>
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

          {activeRange === 'Custom' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="from-date">Başlanğıc</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="to-date">Son</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <Label htmlFor="store-select">Mağaza</Label>
              <select
                id="store-select"
                value={store}
                onChange={(event) => setStore(event.target.value)}
                className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option>Hamısı</option>
                <option>Mağaza 1</option>
                <option>Mağaza 2</option>
                <option>Mağaza 3</option>
              </select>
            </div>

            <div>
              <Label htmlFor="register-select">Kassa</Label>
              <select
                id="register-select"
                value={register}
                onChange={(event) => setRegister(event.target.value)}
                className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option>Hamısı</option>
                <option>Kassa 1</option>
                <option>Kassa 2</option>
                <option>Kassa 3</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Satış qrafiki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
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
              <CardTitle>Məhsul kateqoriyaları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#6366f1', '#f97316', '#22c55e', '#16a34a'][index % 4]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Günlük müqayisə</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyCompareData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="thisWeek" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="lastWeek" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Detallı hesabat</CardTitle>
            <p className="text-sm text-muted-foreground">
              Filtrə uyğun hesabat sətirləri.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="mr-2 h-4 w-4" />
              Email göndər
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Hesabat №</th>
                <th className="px-4 py-3">Tarix</th>
                <th className="px-4 py-3">Mağaza</th>
                <th className="px-4 py-3">Kassa</th>
                <th className="px-4 py-3">Satış</th>
                <th className="px-4 py-3">Mənfəət</th>
                <th className="px-4 py-3">Vergi</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReports.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">{row.id}</td>
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.store}</td>
                  <td className="px-4 py-3">{row.register}</td>
                  <td className="px-4 py-3">₼{row.sales.toLocaleString()}</td>
                  <td className="px-4 py-3">₼{row.profit.toLocaleString()}</td>
                  <td className="px-4 py-3">₼{row.tax.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.status === 'Tamamlandı' ? 'success' : 'secondary'}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}