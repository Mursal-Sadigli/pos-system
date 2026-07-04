'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign,
  Eye,
  EyeOff,
  Download,
  Calendar,
  ChevronRight,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock Data - API-dən gələcək
const weeklySalesData = [
  { name: 'B.e', sales: 1200, orders: 8 },
  { name: 'Ç.a', sales: 1800, orders: 12 },
  { name: 'Ç', sales: 1500, orders: 10 },
  { name: 'C.a', sales: 2100, orders: 15 },
  { name: 'C', sales: 2400, orders: 18 },
  { name: 'Ş', sales: 2800, orders: 22 },
  { name: 'B', sales: 1900, orders: 14 },
];

const topProducts = [
  { name: 'iPhone 15 Pro', sales: 45, revenue: 58455, color: '#4F46E5' },
  { name: 'Samsung S24', sales: 32, revenue: 31968, color: '#7C3AED' },
  { name: 'MacBook Pro', sales: 18, revenue: 35982, color: '#EC4899' },
  { name: 'AirPods Pro', sales: 56, revenue: 13944, color: '#F59E0B' },
  { name: 'iPad Air', sales: 24, revenue: 14376, color: '#10B981' },
];

const recentOrders = [
  { id: '#ORD-2024-001', customer: 'Elçin Məmmədov', amount: 124.50, status: 'completed', time: '2 dəq əvvəl' },
  { id: '#ORD-2024-002', customer: 'Günel Həsənova', amount: 89.99, status: 'processing', time: '15 dəq əvvəl' },
  { id: '#ORD-2024-003', customer: 'Rəşad Əliyev', amount: 245.00, status: 'pending', time: '1 saat əvvəl' },
  { id: '#ORD-2024-004', customer: 'Aygün Quliyeva', amount: 67.50, status: 'completed', time: '2 saat əvvəl' },
  { id: '#ORD-2024-005', customer: 'Tural Hüseynov', amount: 189.99, status: 'cancelled', time: '3 saat əvvəl' },
];

const statusColors = {
  completed: 'bg-green-500',
  processing: 'bg-blue-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
};

const statusLabels = {
  completed: 'Tamamlandı',
  processing: 'Hazırlanır',
  pending: 'Gözləmədə',
  cancelled: 'Ləğv olundu',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState(weeklySalesData);
  const [filter, setFilter] = useState('weekly');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      title: 'Bugünkü Satış',
      value: '₼1,250.00',
      icon: DollarSign,
      change: '+12.5%',
      trend: 'up',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Sifarişlər',
      value: '45',
      icon: ShoppingBag,
      change: '+8.2%',
      trend: 'up',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Məhsullar',
      value: '342',
      icon: Package,
      change: '-2.4%',
      trend: 'down',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Müştərilər',
      value: '128',
      icon: Users,
      change: '+3.1%',
      trend: 'up',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Xoş gəldiniz, {user?.name}! Bugün mağazanızın vəziyyəti
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Bugün: {new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Button>
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4" />
            Yenilə
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-lg ${stat.bg} p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">son 7 gündə</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Satış Qrafiki</CardTitle>
                <CardDescription>Həftəlik satış trendi</CardDescription>
              </div>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList>
                  <TabsTrigger value="weekly">Həftəlik</TabsTrigger>
                  <TabsTrigger value="monthly">Aylıq</TabsTrigger>
                  <TabsTrigger value="yearly">İllik</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      strokeWidth={2}
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
            <CardTitle>Ən Çox Satılanlar</CardTitle>
            <CardDescription>Bu həftə ən çox satılan məhsullar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white" style={{ background: product.color }}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} satış</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₼{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Son Sifarişlər</CardTitle>
              <CardDescription>Bugünkü son sifarişlər</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              Bütün Sifarişlərə Bax
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${statusColors[order.status as keyof typeof statusColors]}`} />
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{order.time}</span>
                  <span className="font-medium">₼{order.amount.toFixed(2)}</span>
                  <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'default'}>
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}