'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  UserPlus,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { userApi } from '@/lib/api';

const roleColors = {
  MANAGER: 'bg-purple-500',
  CASHIER: 'bg-blue-500',
  VIEWER: 'bg-gray-500',
};

const roleLabels = {
  MANAGER: 'Menecer',
  CASHIER: 'Kassir',
  VIEWER: 'Müşahidəçi',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const resp = await userApi.getUsers();
        const data = resp.data?.users ?? resp.data ?? [];
        setUsers(data.map((u: any) => ({ ...u, status: u.status || (u.is_active ? 'ACTIVE' : 'INACTIVE') })));
      } catch (err: any) {
        console.error('Failed to load users', err);
        toast({ title: 'Xəta', description: 'İstifadəçilər yüklənmədi', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await userApi.deleteUser(selectedUser.id);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      toast({ title: 'İstifadəçi silindi', description: `${selectedUser.name} istifadəçisi uğurla silindi` });
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Delete failed', err);
      toast({ title: 'Xəta', description: 'İstifadəçi silinə bilmədi', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await userApi.updateUser(user.id, { status: newStatus, is_active: newStatus === 'ACTIVE' });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      toast({ title: `İstifadəçi ${newStatus === 'ACTIVE' ? 'aktiv' : 'deaktiv'} edildi` });
    } catch (err: any) {
      console.error('Toggle failed', err);
      toast({ title: 'Xəta', description: 'Status dəyişdirilə bilmədi', variant: 'destructive' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İşçilər</h1>
          <p className="text-muted-foreground">Mağaza işçilərini idarə edin</p>
        </div>
        <Link href="/admin/users/invite">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="h-4 w-4" /> Yeni İşçi Əlavə Et
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="İşçi axtar (ad, email)..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery((e.target as { value?: string }).value ?? "")} />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Rol" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Rollar</SelectItem>
                <SelectItem value="MANAGER">Menecer</SelectItem>
                <SelectItem value="CASHIER">Kassir</SelectItem>
                <SelectItem value="VIEWER">Müşahidəçi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Statuslar</SelectItem>
                <SelectItem value="ACTIVE">Aktiv</SelectItem>
                <SelectItem value="INACTIVE">Deaktiv</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filtr</Button>
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
                  <th className="px-4 py-3 text-left text-sm font-medium">İşçi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Son Giriş</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Heç bir işçi tapılmadı</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10"><AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">{getInitials(user.name)}</AvatarFallback></Avatar>
                          <div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="gap-1">
                          <span className={`h-2 w-2 rounded-full ${roleColors[user.role as keyof typeof roleColors]}`} />
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {user.status === 'ACTIVE' ? 'Aktiv' : 'Deaktiv'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.last_login ?? user.lastLogin}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" /> Redaktə et</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => handleToggleStatus(user)}>
                              {user.status === 'ACTIVE' ? (<><UserX className="h-4 w-4" /> Deaktiv et</>) : (<><UserCheck className="h-4 w-4" /> Aktiv et</>)}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600" onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}>
                              <Trash2 className="h-4 w-4" /> Sil
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
            <DialogTitle>İstifadəçini Sil</DialogTitle>
            <DialogDescription>{selectedUser?.name} istifadəçisini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Ləğv Et</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
