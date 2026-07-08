'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import api, { storeApi } from '@/lib/api';

const roleColors = {
  SUPER_ADMIN: 'bg-red-600',
  ADMIN: 'bg-purple-600',
  MANAGER: 'bg-blue-600',
  CASHIER: 'bg-green-600',
  VIEWER: 'bg-gray-600',
};

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Menecer',
  CASHIER: 'Kassir',
  VIEWER: 'Müşahidəçi',
};

const statusLabels = {
  active: 'Aktiv',
  inactive: 'Deaktiv',
  suspended: 'Dayandırılıb',
};

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  store?: string | null;
  status: string;
  phone?: string | null;
  last_login?: string | null;
  lastLogin?: string | null;
  avatar?: string;
  is_active?: boolean;
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', status: '', storeId: '' });
  const [stores, setStores] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [usersRes, storesRes] = await Promise.all([
          api.get('/users'),
          storeApi.getStores().catch(() => null)
        ]);

        const payload = usersRes?.data?.data;
        const rawUsers = Array.isArray(payload)
          ? payload
          : payload?.users ?? payload?.rows ?? payload?.items ?? [];
        const normalizedUsers = Array.isArray(rawUsers)
          ? rawUsers.map((user) => ({ ...user, status: String(user?.status || 'active').toLowerCase() }))
          : [];
        setUsers(normalizedUsers);

        if (storesRes?.data?.data) {
          const storesData = storesRes.data.data.stores || storesRes.data.data;
          setStores(Array.isArray(storesData) ? storesData : []);
        }
      } catch (error) {
        console.error('Failed to load users', error);
        setUsers([]);
        toast({ title: 'Xəta', description: 'İstifadəçilər yüklənə bilmədi', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    // `toast` is stable for this effect and should not trigger repeated reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    managers: users.filter((u) => u.role === 'MANAGER').length,
    cashiers: users.filter((u) => u.role === 'CASHIER').length,
    viewers: users.filter((u) => u.role === 'VIEWER').length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      toast({
        title: 'İstifadəçi silindi',
        description: `${selectedUser.name} istifadəçisi uğurla silindi`,
      });
    } catch (error) {
      toast({ title: 'Xəta', description: 'İstifadəçi silinə bilmədi', variant: 'destructive' });
    } finally {
      setSelectedUser(null);
    }
  };

  const openViewDialog = (user: UserRecord) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const openEditDialog = (user: UserRecord) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      storeId: (user as any).store_id || (user as any).storeId || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status.toLowerCase(),
      };
      if (editForm.storeId) {
        payload.store_id = editForm.storeId;
      }
      
      const response = await api.put(`/users/${selectedUser.id}`, payload);
      const updatedUser = response?.data?.data;
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...updatedUser, status: String(updatedUser?.status || u.status || 'active').toLowerCase() } : u)));
      setEditDialogOpen(false);
      toast({
        title: 'İstifadəçi redaktə edildi',
        description: `${editForm.name} məlumatları güncəlləndi`,
      });
    } catch (error) {
      toast({ title: 'Xəta', description: 'İstifadəçi yenilənə bilmədi', variant: 'destructive' });
    } finally {
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (user: UserRecord, status: string) => {
    try {
      await api.put(`/users/${user.id}`, { status: status.toLowerCase() });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: String(status).toLowerCase() } : u)));
      toast({
        title: `İstifadəçi ${statusLabels[status as keyof typeof statusLabels]}`,
        description: `${user.name} istifadəçisi ${statusLabels[status as keyof typeof statusLabels].toLowerCase()} edildi`,
      });
    } catch (error) {
      toast({ title: 'Xəta', description: 'Status dəyişdirilə bilmədi', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-red-600" />
            İstifadəçilər
          </h1>
          <p className="text-muted-foreground">
            Sistemdəki bütün istifadəçiləri idarə edin
          </p>
        </div>
        <Link href="/super-admin/users/new">
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4" />
            Yeni İstifadəçi
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-8">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ümumi</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-green-500">
            <p className="text-xs text-muted-foreground">Aktiv</p>
            <p className="text-xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-gray-500">
            <p className="text-xs text-muted-foreground">Deaktiv</p>
            <p className="text-xl font-bold text-gray-600">{stats.inactive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-yellow-500">
            <p className="text-xs text-muted-foreground">Dayandırılıb</p>
            <p className="text-xl font-bold text-yellow-600">{stats.suspended}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-purple-600">
            <p className="text-xs text-muted-foreground">Admin</p>
            <p className="text-xl font-bold text-purple-600">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-blue-600">
            <p className="text-xs text-muted-foreground">Manager</p>
            <p className="text-xl font-bold text-blue-600">{stats.managers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-green-600">
            <p className="text-xs text-muted-foreground">Kassir</p>
            <p className="text-xl font-bold text-green-600">{stats.cashiers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 border-l-4 border-gray-600">
            <p className="text-xs text-muted-foreground">Müşahidəçi</p>
            <p className="text-xl font-bold text-gray-600">{stats.viewers}</p>
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
                placeholder="İstifadəçi axtar (ad, email)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Rollar</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="CASHIER">Kassir</SelectItem>
                <SelectItem value="VIEWER">Müşahidəçi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
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

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">İstifadəçi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Mağaza</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Son Giriş</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Yüklənir...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir istifadəçi tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className={user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`gap-1 ${user.role === 'SUPER_ADMIN' ? 'border-red-600 text-red-600' : ''}`}>
                          <span className={`h-2 w-2 rounded-full ${roleColors[user.role as keyof typeof roleColors]}`} />
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.store}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'warning' : 'secondary'}>
                          {statusLabels[user.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.last_login ?? user.lastLogin ?? 'Heç bir giriş yoxdur'}
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
                            <DropdownMenuItem className="gap-2" onSelect={() => openViewDialog(user)}>
                              <Eye className="h-4 w-4" />
                              Bax
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onSelect={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4" />
                              Redaktə et
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                              Statusu Dəyiş
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="gap-2"
                              onSelect={() => handleToggleStatus(user, 'active')}
                            >
                              <UserCheck className="h-4 w-4 text-green-500" />
                              Aktiv et
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onSelect={() => handleToggleStatus(user, 'suspended')}
                            >
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              Dayandır
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onSelect={() => handleToggleStatus(user, 'inactive')}
                            >
                              <UserX className="h-4 w-4 text-gray-500" />
                              Deaktiv et
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 text-red-600"
                              onSelect={() => {
                                setSelectedUser(user);
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İstifadəçi məlumatları</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} istifadəçisinin detallı görünüşü.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={selectedUser.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div><span className="font-medium">Rol:</span> {roleLabels[selectedUser.role as keyof typeof roleLabels]}</div>
                <div><span className="font-medium">Mağaza:</span> {selectedUser.store}</div>
                <div><span className="font-medium">Status:</span> {statusLabels[selectedUser.status as keyof typeof statusLabels]}</div>
                <div><span className="font-medium">Telefon:</span> {selectedUser.phone}</div>
                <div><span className="font-medium">Son giriş:</span> {selectedUser.last_login ?? selectedUser.lastLogin ?? 'Heç bir giriş yoxdur'}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Bağla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İstifadəçini redaktə et</DialogTitle>
            <DialogDescription>
              Ad, email, rol və statusu dəyişdirin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ad</label>
              <Input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={editForm.role}
                onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="CASHIER">Kassir</option>
                <option value="VIEWER">Müşahidəçi</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Deaktiv</option>
                <option value="suspended">Dayandırılıb</option>
              </select>
            </div>
            {stores.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Mağaza</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={editForm.storeId}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, storeId: e.target.value }))}
                >
                  <option value="">-- Dəyişdirilməsin --</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Ləğv et</Button>
            <Button onClick={handleSaveEdit}>Yadda saxla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İstifadəçini Sil</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} istifadəçisini silmək istədiyinizə əminsiniz?
              Bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Ləğv Et
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}