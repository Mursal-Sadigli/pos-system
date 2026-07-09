'use client';

import { useState } from 'react';
import {
  Download,
  RefreshCw,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Calendar,
  Filter,
  FileText,
  Printer,
  Mail,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Activity,
  Search,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { reportsApi } from '@/lib/api';
import { useEffect } from 'react';

// Mock Data










const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  VIEWER: 'Viewer',
};

const statusLabels = {
  active: 'Aktiv',
  inactive: 'Deaktiv',
  suspended: 'Dayandırılıb',
};

export default function UsersReportsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [period, setPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);



  const handleExport = (format: string) => {
    if (format === 'csv') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Ad,Email,Rol,Status,Tarix\n';
      filteredUsers.forEach(user => {
        csvContent += `${user.name},${user.email},${user.role},${user.status},${user.date}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'istifadeci_hesabati.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: '📥 CSV ixrac edildi',
        description: 'İstifadəçi hesabatı uğurla yükləndi',
      });
    } else {
      toast({
        title: `📥 ${format.toUpperCase()} ixrac edilir`,
        description: 'Bu format tezliklə əlavə ediləcək',
      });
    }
  };

  
  const [userStats, setUserStats] = useState<any>({ total: 0, active: 0, inactive: 0, suspended: 0, admins: 0, managers: 0, cashiers: 0, viewers: 0, newThisWeek: 0, growth: 0 });
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  
  const fetchData = async (showToast = false) => {
    setIsLoading(true);
    try {
      const [statsRes, growthRes, recentRes] = await Promise.all([
        reportsApi.getUserDetailedStats(),
        reportsApi.getUserDetailedGrowth(),
        reportsApi.getRecentUsers()
      ]);
      
      setUserStats(statsRes.data.data.stats);
      setRoleDistribution(statsRes.data.data.roleDistribution);
      setUserActivityData(statsRes.data.data.userActivityData);
      setUserGrowthData(growthRes.data.data);
      setRecentUsers(recentRes.data.data);
      
      if (showToast) {
        toast({ title: '✅ Hesabat yeniləndi', description: 'Ən son məlumatlar yükləndi' });
      }
    } catch (error: any) {
      toast({ title: '❌ Xəta', description: error.response?.data?.message || 'Məlumatları yükləmək mümkün olmadı', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = recentUsers.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRefresh = () => {
    fetchData(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-red-600" />
            İstifadəçi Hesabatları
          </h1>
          <p className="text-muted-foreground">
            Bütün istifadəçi statistikaları və analitikası
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ümumi</p>
            <p className="text-lg font-bold">{userStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-green-500">
            <p className="text-xs text-muted-foreground">Aktiv</p>
            <p className="text-lg font-bold text-green-600">{userStats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-gray-500">
            <p className="text-xs text-muted-foreground">Deaktiv</p>
            <p className="text-lg font-bold text-gray-600">{userStats.inactive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-yellow-500">
            <p className="text-xs text-muted-foreground">Dayandırılıb</p>
            <p className="text-lg font-bold text-yellow-600">{userStats.suspended}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-purple-600">
            <p className="text-xs text-muted-foreground">Admin</p>
            <p className="text-lg font-bold text-purple-600">{userStats.admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-blue-600">
            <p className="text-xs text-muted-foreground">Manager</p>
            <p className="text-lg font-bold text-blue-600">{userStats.managers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-green-600">
            <p className="text-xs text-muted-foreground">Kassir</p>
            <p className="text-lg font-bold text-green-600">{userStats.cashiers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-gray-600">
            <p className="text-xs text-muted-foreground">Müşahidəçi</p>
            <p className="text-lg font-bold text-gray-600">{userStats.viewers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>İstifadəçi Artımı</CardTitle>
                <CardDescription>Aylıq istifadəçi artımı</CardDescription>
              </div>
              <Tabs value={period} onValueChange={setPeriod}>
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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
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
                      dataKey="users"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      name="Cəmi İstifadəçi"
                      dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="admins"
                      stroke="#7C3AED"
                      strokeWidth={2}
                      name="Admin"
                      dot={{ fill: '#7C3AED', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="managers"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Manager"
                      dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cashiers"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Kassir"
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
            <CardTitle>Rol Paylanması</CardTitle>
            <CardDescription>İstifadəçi rollarına görə pay</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {roleDistribution.map((entry, index) => (
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

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Gündəlik İstifadəçi Aktivliyi</CardTitle>
          <CardDescription>Həftəlik istifadəçi aktivlik statistikası</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
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
                <Bar dataKey="active" fill="#4F46E5" name="Aktiv İstifadəçi" />
                <Bar dataKey="new" fill="#10B981" name="Yeni İstifadəçi" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Son İstifadəçilər</CardTitle>
              <CardDescription>Ən son əlavə olunan istifadəçilər</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Axtar..."
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün Rollar</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="CASHIER">Kassir</SelectItem>
                  <SelectItem value="VIEWER">Müşahidəçi</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün Statuslar</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiv</SelectItem>
                  <SelectItem value="suspended">Dayandırılıb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">İstifadəçi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tarix</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir istifadəçi tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'MANAGER' ? 'secondary' : 'outline'}>
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                          {statusLabels[user.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.date}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}