'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Plus, MoreVertical, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { userApi } from '@/lib/api';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CASHIER: 'Kassir',
  VIEWER: 'Viewer',
};

export default function SuperAdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await userApi.getUsers();
        const raw = resp.data?.users ?? resp.data ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.rows && Array.isArray(raw.rows) ? raw.rows : []);
        setUsers(list.map((u: any) => ({ ...u, status: u.status || (u.is_active ? 'ACTIVE' : 'INACTIVE') })));
      } catch (err: any) {
        console.error('Failed to load users', err);
        toast({ title: 'Xəta', description: 'İstifadəçilər yüklənmədi', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await userApi.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast({ title: 'İstifadəçi silindi' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Xəta', description: 'İstifadəçi silinə bilmədi', variant: 'destructive' });
    }
  };

  const toggleStatus = async (user: any) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const resp = await userApi.updateUser(user.id, { status: newStatus, is_active: newStatus === 'ACTIVE' });
      const updated = resp.data ?? resp.data?.user ?? resp.data?.users ?? null;
      setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      toast({ title: `İstifadəçi ${newStatus === 'ACTIVE' ? 'aktiv' : 'deaktiv'} edildi` });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Xəta', description: 'Status dəyişdirilə bilmədi', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-7 w-7 text-red-600" />
            İstifadəçilər
          </h1>
          <p className="text-muted-foreground">Sistemdəki bütün istifadəçiləri idarə edin.</p>
        </div>

        <Link href="/super-admin/users/new">
          <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4" /> Yeni İstifadəçi
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İstifadəçilər</CardTitle>
          <CardDescription>Super admin istifadəçilər siyahısı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">İstifadəçi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-red-100 text-red-700 text-sm">{(user.name || 'U').slice(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{roleLabels[user.role]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {user.status === 'ACTIVE' ? 'Aktiv' : 'Deaktiv'}
                      </Badge>
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
                            <Edit className="h-4 w-4" /> Redaktə et
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => toggleStatus(user)}>
                            {user.status === 'ACTIVE' ? (
                              <>
                                <UserX className="h-4 w-4" /> Deaktiv et
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4" /> Aktiv et
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4" /> Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
