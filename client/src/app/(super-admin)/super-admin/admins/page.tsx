'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCog,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  UserCheck,
  UserX,
  Store,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

// Admin users are loaded from API

const statusLabels = {
  active: 'Aktiv',
  inactive: 'Deaktiv',
  suspended: 'Dayandırılıb',
};

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const res = await userApi.getUsers({ role: 'ADMIN' });
        const payload = res.data?.data;
        const raw = payload?.users ?? payload ?? [];
        const list = Array.isArray(raw) ? raw : [];
        // normalize status to lowercase for UI
        const normalized = list.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          store: (u.store_name || u.store || u.storeId) ?? '',
          status: (u.status || (u.is_active ? 'ACTIVE' : 'INACTIVE')).toLowerCase(),
          phone: u.phone,
          lastLogin: u.last_login ?? u.lastLogin ?? null,
          createdAt: u.created_at ?? u.createdAt ?? null,
          avatar: u.avatar ?? null,
          permissions: u.permissions ?? [],
        }));
        setAdmins(normalized);
      } catch (err: any) {
        console.error('Failed to load admins', err);
        toast({ title: 'Xəta', description: 'Adminlər yüklənmədi', variant: 'destructive' });
      }
    };
    loadAdmins();
  }, []);

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          admin.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || admin.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: admins.length,
    active: admins.filter((a) => a.status === 'active').length,
    inactive: admins.filter((a) => a.status === 'inactive').length,
    suspended: admins.filter((a) => a.status === 'suspended').length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      await userApi.deleteUser(selectedAdmin.id);
      setAdmins(admins.filter((a) => a.id !== selectedAdmin.id));
      setDeleteDialogOpen(false);
      toast({ title: 'Admin silindi', description: `${selectedAdmin.name} admini uğurla silindi` });
      setSelectedAdmin(null);
    } catch (err: any) {
      console.error('Delete admin failed', err);
      toast({ title: 'Xəta', description: 'Admin silinə bilmədi', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (admin: any, status: string) => {
    try {
      const statusUpper = status.toUpperCase();
      await userApi.updateUser(admin.id, { status: statusUpper, is_active: statusUpper === 'ACTIVE' });
      setAdmins(admins.map((a) => (a.id === admin.id ? { ...a, status } : a)));
      toast({ title: `Admin ${statusLabels[status as keyof typeof statusLabels]}`, description: `${admin.name} admini ${statusLabels[status as keyof typeof statusLabels].toLowerCase()} edildi` });
    } catch (err: any) {
      console.error('Toggle status failed', err);
      toast({ title: 'Xəta', description: 'Status dəyişdirilə bilmədi', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-7 w-7 text-red-600" />
            Adminlər
          </h1>
          <p className="text-muted-foreground">
            Sistemdəki bütün adminləri idarə edin
          </p>
        </div>
        <Link href="/super-admin/admins/new">
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4" />
            Yeni Admin
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ümumi Adminlər</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 border-l-4 border-green-500">
            <p className="text-sm text-muted-foreground">Aktiv</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 border-l-4 border-gray-500">
            <p className="text-sm text-muted-foreground">Deaktiv</p>
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-muted-foreground">Dayandırılıb</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.suspended}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Admin axtar (ad, email, mağaza)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Statuslar</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Deaktiv</SelectItem>
                <SelectItem value="suspended">Dayandırılıb</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Admin</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Mağaza</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Son Giriş</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Yaradılma</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir admin tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-purple-100 text-purple-700">
                              {getInitials(admin.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Store className="h-3 w-3 text-muted-foreground" />
                          {admin.store}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={admin.status === 'active' ? 'success' : admin.status === 'suspended' ? 'warning' : 'secondary'}>
                          {statusLabels[admin.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {admin.lastLogin}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {admin.createdAt}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              Bax
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Redaktə et
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                              Statusu Dəyiş
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleToggleStatus(admin, 'active')}
                            >
                              <UserCheck className="h-4 w-4 text-green-500" />
                              Aktiv et
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleToggleStatus(admin, 'suspended')}
                            >
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              Dayandır
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleToggleStatus(admin, 'inactive')}
                            >
                              <UserX className="h-4 w-4 text-gray-500" />
                              Deaktiv et
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-red-600"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admini Sil</DialogTitle>
            <DialogDescription>
              {selectedAdmin?.name} adminini silmək istədiyinizə əminsiniz?
              Bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Ləğv Et
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}