'use client';

import { useState } from 'react';
import {
  Download,
  RefreshCw,
  Server,
  Database,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  Calendar,
  Filter,
  FileText,
  Printer,
  Mail,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Users,
  Store,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Progress } from '@/components/ui/progress';

// Mock Data
const systemPerformanceData = [
  { name: 'B.e', cpu: 35, memory: 45, disk: 50, database: 60 },
  { name: 'Ç.a', cpu: 42, memory: 52, disk: 52, database: 65 },
  { name: 'Ç', cpu: 38, memory: 48, disk: 51, database: 58 },
  { name: 'C.a', cpu: 55, memory: 65, disk: 53, database: 72 },
  { name: 'C', cpu: 62, memory: 72, disk: 54, database: 78 },
  { name: 'Ş', cpu: 48, memory: 58, disk: 53, database: 68 },
  { name: 'B', cpu: 40, memory: 50, disk: 52, database: 62 },
];

const systemHealth = {
  uptime: '14d 7h 32m',
  cpu: 42,
  memory: 68,
  disk: 54,
  database: 95,
  cache: 78,
  sessions: 156,
  activeUsers: 12,
  requestsPerMinute: 342,
  errorsLastHour: 3,
};

const serverStatus = [
  { name: 'Web Server', status: 'online', uptime: '14d 7h 32m', load: 42, color: '#10B981' },
  { name: 'Database Server', status: 'online', uptime: '14d 7h 30m', load: 95, color: '#4F46E5' },
  { name: 'Cache Server', status: 'online', uptime: '14d 7h 28m', load: 78, color: '#7C3AED' },
  { name: 'Worker Server', status: 'online', uptime: '14d 7h 25m', load: 35, color: '#F59E0B' },
];

const resourceUsage = [
  { name: 'CPU', value: 42, color: '#4F46E5' },
  { name: 'Memory', value: 68, color: '#7C3AED' },
  { name: 'Disk', value: 54, color: '#10B981' },
  { name: 'Database', value: 95, color: '#EF4444' },
];

export default function SystemReportsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = (format: string) => {
    toast({
      title: `📥 ${format.toUpperCase()} ixrac edilir`,
      description: 'Sistem hesabatı yüklənir...',
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
            <Server className="h-7 w-7 text-red-600" />
            Sistem Hesabatları
          </h1>
          <p className="text-muted-foreground">
            Sistem performansı və resurs istifadəsi
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

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">İşlək Vaxtı</p>
            <p className="text-lg font-bold">{systemHealth.uptime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Aktiv İstifadəçi</p>
            <p className="text-lg font-bold">{systemHealth.activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Sorğu/Dəqiqə</p>
            <p className="text-lg font-bold">{systemHealth.requestsPerMinute}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-red-500">
            <p className="text-xs text-muted-foreground">Son 1 Saat Xəta</p>
            <p className="text-lg font-bold text-red-600">{systemHealth.errorsLastHour}</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resurs İstifadəsi</CardTitle>
                <CardDescription>Sistem resurslarının günlük istifadəsi</CardDescription>
              </div>
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList>
                  <TabsTrigger value="weekly">Həftəlik</TabsTrigger>
                  <TabsTrigger value="monthly">Aylıq</TabsTrigger>
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
                  <LineChart data={systemPerformanceData}>
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
                      dataKey="cpu"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      name="CPU (%)"
                      dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      name="Memory (%)"
                      dot={{ fill: '#7C3AED', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="database"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="Database (%)"
                      dot={{ fill: '#EF4444', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Cari Resurs</CardTitle>
            <CardDescription>İndiki resurs istifadəsi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resourceUsage.map((resource) => (
                <div key={resource.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: resource.color }} />
                      {resource.name}
                    </span>
                    <span className="font-medium" style={{ color: resource.color }}>
                      {resource.value}%
                    </span>
                  </div>
                  <Progress value={resource.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Status */}
      <Card>
        <CardHeader>
          <CardTitle>Server Statusu</CardTitle>
          <CardDescription>Bütün serverlərin cari vəziyyəti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {serverStatus.map((server) => (
              <div key={server.name} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">{server.name}</span>
                  </div>
                  <Badge variant={server.status === 'online' ? 'success' : 'destructive'}>
                    {server.status === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>İşlək vaxtı</span>
                    <span>{server.uptime}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Yük</span>
                    <span className={server.load > 80 ? 'text-red-600 font-medium' : ''}>
                      {server.load}%
                    </span>
                  </div>
                  <Progress value={server.load} className="h-1 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              İstifadəçi Statistikası
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cəmi İstifadəçi</span>
                <span className="font-bold">{systemHealth.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktiv İstifadəçi</span>
                <span className="font-bold text-green-600">{systemHealth.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bu Həftə</span>
                <span className="font-bold">+12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              Sistem Gəliri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bu Ay</span>
                <span className="font-bold text-red-600">₼85,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Keçən Ay</span>
                <span className="font-bold">₼72,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Artım</span>
                <span className="font-bold text-green-600">+18.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4" />
              Mağaza Statistikası
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cəmi Mağaza</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktiv</span>
                <span className="font-bold text-green-600">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bu Ay</span>
                <span className="font-bold">+2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}