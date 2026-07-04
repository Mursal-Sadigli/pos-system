'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, UserPlus, Mail, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { userApi } from '@/lib/api';

const roleMap = { ADMIN: 'Admin', MANAGER: 'Manager', CASHIER: 'Kassir', VIEWER: 'Müşahidəçi' };
const statusMap = { ACTIVE: 'Aktiv', INACTIVE: 'Deaktiv', SUSPENDED: 'Dayandırılıb', PENDING: 'Gözləyir' };

export default function StoreUsersPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
      setLoading(true);
      try {
        if (!rawId) return;
        const resp = await userApi.getUsers({ storeId: rawId });
        const data = resp.data?.users ?? resp.data ?? [];
        setUsers(data.map((u: any) => ({
          ...u,
          status: u.status || (u.is_active ? 'ACTIVE' : 'INACTIVE'),
        })));
      } catch (err: any) {
        console.error('Failed to load users', err);
        toast({ title: 'Xəta', description: 'İstifadəçilər yüklənmədi', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [params.id]);

  const handleDelete = async (id: string) => {
    try {
      await userApi.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast({ title: '✅ İstifadəçi silindi' });
    } catch (err: any) {
      console.error('Delete failed', err);
      toast({ title: 'Xəta', description: 'İstifadəçi silinə bilmədi', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Geri
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-red-600" /> Mağaza İstifadəçiləri
          </h1>
          <p className="text-muted-foreground">Mağaza ID: {Array.isArray(params?.id) ? params.id[0] : params?.id}</p>
        </div>
        <Link href={`/super-admin/stores/${Array.isArray(params?.id) ? params.id[0] : params?.id}/users/invite`}>
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4" /> İstifadəçi Əlavə Et
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
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
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {roleMap[user.role as keyof typeof roleMap]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                      {statusMap[user.status as keyof typeof statusMap]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" /> Bax</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" /> Redaktə et</DropdownMenuItem>
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
      </Card>
    </div>
  );
}