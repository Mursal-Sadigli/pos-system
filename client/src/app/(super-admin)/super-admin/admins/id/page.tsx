'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Store,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  MoreVertical,
  Eye,
  Activity,
  FileText,
  CreditCard,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';

// Mock Admin Data
const mockAdmin = {
  id: 'admin-1',
  name: 'Elçin Məmmədov',
  email: 'elchin@example.com',
  phone: '+994 50 123 45 67',
  store: 'Elektronika Dünyası',
  storeId: 'store-1',
  role: 'ADMIN',
  status: 'active',
  avatar: 'EM',
  lastLogin: '2024-01-15 10:30:00',
  createdAt: '2024-01-01 00:00:00',
  permissions: ['view_all', 'manage_users', 'manage_products', 'manage_orders'],
  statistics: {
    totalOrders: 1245,
    totalRevenue: 45600,
    totalCustomers: 342,
    totalProducts: 128,
  },
  recentActivity: [
    { action: 'Yeni məhsul əlavə etdi', time: '15 dəq əvvəl', type: 'product' },
    { action: 'Sifariş statusunu yenilədi', time: '1 saat əvvəl', type: 'order' },
    { action: 'Yeni işçi dəvət etdi', time: '3 saat əvvəl', type: 'user' },
  ],
};

export default function AdminDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAdmin(mockAdmin);
      setIsLoading(false);
    }, 800);
  }, [params.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusChange = () => {
    if (!admin || !selectedStatus) return;
    setAdmin({ ...admin, status: selectedStatus });
    setStatusDialogOpen(false);
    toast({
      title: `Admin ${selectedStatus === 'active' ? 'aktiv' : selectedStatus === 'suspended' ? 'dayandırıldı' : 'deaktiv'} edildi`,
      description: `${admin.name} admini ${selectedStatus === 'active' ? 'aktiv' : selectedStatus === 'suspended' ? 'dayandırıldı' : 'deaktiv'} edildi`,
    });
  };

  const handleDelete = () => {
    if (!admin) return;
    setDeleteDialogOpen(false);
    toast({
      title: 'Admin silindi',
      description: `${admin.name} admini uğurla silindi`,
    });
    router.push('/super-admin/admins');
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Admin tapılmadı</h3>
        <p className="text-muted-foreground">Bu ID ilə admin mövcud deyil</p>
        <Button className="mt-4" onClick={() => router.push('/super-admin/admins')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Adminlərə Qayıt
        </Button>
      </div>
    );
  }

  const statusLabels = {
    active: 'Aktiv',
    inactive: 'Deaktiv',
    suspended: 'Dayandırılıb',
  };

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    suspended: 'bg-yellow-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/super-admin/admins')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {admin.name}
              <Badge variant={admin.status === 'active' ? 'success' : admin.status === 'suspended' ? 'warning' : 'secondary'}>
                {statusLabels[admin.status as keyof typeof statusLabels]}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin · {admin.store}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Redaktə et
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MoreVertical className="h-4 w-4" />
                Əməliyyatlar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem 
                className="gap-2 text-green-600"
                onClick={() => {
                  setSelectedStatus('active');
                  setStatusDialogOpen(true);
                }}
              >
                <UserCheck className="h-4 w-4" />
                Aktiv et
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-yellow-600"
                onClick={() => {
                  setSelectedStatus('suspended');
                  setStatusDialogOpen(true);
                }}
              >
                <AlertCircle className="h-4 w-4" />
                Dayandır
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-gray-600"
                onClick={() => {
                  setSelectedStatus('inactive');
                  setStatusDialogOpen(true);
                }}
              >
                <UserX className="h-4 w-4" />
                Deaktiv et
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 text-red-600"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Card */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-2xl">
                {getInitials(admin.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 font-semibold text-lg">{admin.name}</h3>
            <p className="text-sm text-muted-foreground">{admin.role}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {admin.email}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {admin.phone}
              </div>
              <div className="flex items-center justify-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                {admin.store}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Qoşulma: {admin.createdAt.split(' ')[0]}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Son giriş: {admin.lastLogin}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Statistika</CardTitle>
            <CardDescription>Adminin mağaza statistikası</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <ShoppingBag className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{admin.statistics.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Sifariş</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <CreditCard className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">₼{admin.statistics.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Gəlir</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{admin.statistics.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Müştəri</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                <Package className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{admin.statistics.totalProducts}</p>
                <p className="text-sm text-muted-foreground">Məhsul</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Son Aktivliklər
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" />
            İcazələr
          </TabsTrigger>
          <TabsTrigger value="stores" className="gap-2">
            <Store className="h-4 w-4" />
            Mağaza
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Son Aktivliklər</CardTitle>
              <CardDescription>Adminin son əməliyyatları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admin.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      {activity.type === 'product' && <Package className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'order' && <ShoppingBag className="h-4 w-4 text-green-600" />}
                      {activity.type === 'user' && <User className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>İcazələr</CardTitle>
              <CardDescription>Adminin sistem icazələri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admin.permissions.map((permission: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">{permission.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Mağaza Məlumatları</CardTitle>
              <CardDescription>Adminin idarə etdiyi mağaza</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Store className="h-10 w-10 text-purple-600" />
                <div>
                  <p className="font-semibold text-lg">{admin.store}</p>
                  <p className="text-sm text-muted-foreground">Mağaza ID: {admin.storeId}</p>
                  <Badge variant="outline" className="mt-1">Aktiv</Badge>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Eye className="h-4 w-4 mr-2" />
                  Mağazaya Bax
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Statusunu Dəyiş</DialogTitle>
            <DialogDescription>
              {admin.name} adminini <strong>{statusLabels[selectedStatus as keyof typeof statusLabels]}</strong> etmək istədiyinizə əminsiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Ləğv Et
            </Button>
            <Button 
              variant={selectedStatus === 'active' ? 'default' : selectedStatus === 'suspended' ? 'destructive' : 'secondary'}
              onClick={handleStatusChange}
            >
              Təsdiqlə
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admini Sil</DialogTitle>
            <DialogDescription>
              {admin.name} adminini silmək istədiyinizə əminsiniz?
              Bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Ləğv Et
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}