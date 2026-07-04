'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  Users,
  DollarSign,
  Package,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { userApi } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Mock Data
const mockStore = {
  id: 'store-1',
  name: 'Elektronika Dünyası',
  email: 'info@elektronika.az',
  phone: '+994 50 123 45 67',
  address: 'Bakı, Nizami küç. 15',
  taxNumber: 'AZ123456789',
  currency: 'AZN',
  timezone: 'Asia/Baku',
  status: 'active',
  createdAt: '2024-01-01',
  users: 12,
  revenue: 45600,
  orders: 320,
  products: 342,
  customers: 128,
  description: 'Elektronika və texnologiya məhsulları mağazası',
};

// Users will be loaded from API

const monthlyData = [
  { name: 'Yan', revenue: 12000, orders: 80 },
  { name: 'Fev', revenue: 15000, orders: 95 },
  { name: 'Mar', revenue: 13000, orders: 85 },
  { name: 'Apr', revenue: 18000, orders: 110 },
  { name: 'May', revenue: 22000, orders: 140 },
  { name: 'İyn', revenue: 28000, orders: 180 },
];

const roleMap: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Kassir',
  VIEWER: 'Müşahidəçi',
};

const statusMap = {
  active: { label: 'Aktiv', color: 'bg-green-500', variant: 'success' },
  inactive: { label: 'Deaktiv', color: 'bg-gray-500', variant: 'secondary' },
  suspended: { label: 'Dayandırılıb', color: 'bg-yellow-500', variant: 'warning' },
} as const;

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [store, setStore] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // keep loading mock store for now
        setStore(mockStore);

        // fetch users for this store
        const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
        if (rawId) {
          const res = await userApi.getUsers({ storeId: rawId });
          const data = res.data?.users ?? res.data ?? [];
          setUsers(data.map((u: any) => ({ ...u, status: u.status || (u.is_active ? 'ACTIVE' : 'INACTIVE') })));
        }
      } catch (err: any) {
        console.error('Failed to load store or users', {
          message: err?.message,
          code: err?.code,
          response: err?.response?.status ? { status: err.response.status, statusText: err.response.statusText } : undefined,
          data: err?.response?.data ?? err,
        });
        toast({ title: 'Xəta', description: 'Mağaza və ya istifadəçilər yüklənmədi — konsolu yoxlayın', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = () => {
    setDeleteDialog(false);
    toast({ title: '✅ Mağaza silindi' });
    router.push('/super-admin/stores');
  };

  const handleStatusChange = () => {
    setStore({ ...store, status: newStatus });
    setStatusDialog(false);
    toast({ title: `✅ Status ${statusMap[newStatus as keyof typeof statusMap].label} olaraq dəyişdirildi` });
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
    </div>
  );

  if (!store) return (
    <div className="text-center py-12">
      <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold">Mağaza tapılmadı</h3>
      <Button className="mt-4" onClick={() => router.push('/super-admin/stores')}>Geri</Button>
    </div>
  );

  const status = statusMap[store.status as keyof typeof statusMap];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/super-admin/stores')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {store.name}
              <Badge variant={status.variant as any}>{status.label}</Badge>
            </h1>
            <p className="text-muted-foreground">{store.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/super-admin/stores/${params.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" /> Redaktə et
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setNewStatus('active'); setStatusDialog(true); }}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Aktiv et
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setNewStatus('suspended'); setStatusDialog(true); }}>
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" /> Dayandır
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setNewStatus('inactive'); setStatusDialog(true); }}>
                <XCircle className="h-4 w-4 mr-2 text-gray-600" /> Deaktiv et
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => setDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">İstifadəçilər</p><p className="text-2xl font-bold">{store.users}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Gəlir</p><p className="text-2xl font-bold text-red-600">₼{store.revenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Sifarişlər</p><p className="text-2xl font-bold">{store.orders}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Məhsullar</p><p className="text-2xl font-bold">{store.products}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Müştərilər</p><p className="text-2xl font-bold">{store.customers}</p></CardContent></Card>
      </div>

      {/* Info & Chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-lg">Mağaza Məlumatları</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {store.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {store.phone}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {store.address}</div>
            <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> VÖEN: {store.taxNumber}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Yaranma: {store.createdAt}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Saat qurşağı: {store.timezone}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-lg">Aylıq Gəlir Trendi</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="text-lg">İstifadəçilər</CardTitle><CardDescription>Mağaza işçiləri</CardDescription></div>
          <Link href={`/super-admin/stores/${params.id}/users`}>
            <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" /> Hamısı</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{roleMap[user.role]}</p></div>
                <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>{user.status === 'active' ? 'Aktiv' : 'Deaktiv'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent><DialogHeader><DialogTitle>Mağazanı Sil</DialogTitle><DialogDescription>Bu əməliyyat geri qaytarıla bilməz.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteDialog(false)}>Ləğv</Button><Button variant="destructive" onClick={handleDelete}>Sil</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent><DialogHeader><DialogTitle>Statusu Dəyiş</DialogTitle><DialogDescription>Mağazanı <strong>{statusMap[newStatus as keyof typeof statusMap]?.label}</strong> etmək istədiyinizə əminsiniz?</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setStatusDialog(false)}>Ləğv</Button><Button onClick={handleStatusChange}>Təsdiqlə</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}