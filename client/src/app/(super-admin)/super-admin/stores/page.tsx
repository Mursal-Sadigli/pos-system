'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Users, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';

const statusMap = { active: 'Aktiv', inactive: 'Deaktiv', suspended: 'Dayandırılıb' };

interface StoreItem {
  id: string;
  name: string;
  is_active: boolean;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stores');
        const items = res.data?.data?.stores ?? res.data?.stores ?? res.data?.data ?? [];
        setStores(items);
      } catch (error: any) {
        toast({ title: '⚠️ Mağazalar yüklənmədi', description: error?.message || 'API xətası' });
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const filtered = stores.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/stores/${id}`);
      setStores((prev) => prev.filter((s) => s.id !== id));
      toast({ title: '✅ Mağaza silindi' });
    } catch (error: any) {
      toast({ title: '❌ Mağaza silinmədi', description: error?.message || 'API xətası' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mağazalar</h1>
          <p className="text-muted-foreground">Bütün mağazaları idarə edin</p>
        </div>
        <Link href="/super-admin/stores/new">
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4" /> Yeni Mağaza
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Mağaza axtar..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Mağaza</th>
                <th className="px-4 py-3 text-left text-sm font-medium">İstifadəçilər</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Gəlir</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Yüklənir...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Heç bir mağaza tapılmadı.</td>
                </tr>
              ) : filtered.map((store) => (
                <tr key={store.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{store.name}</div>
                        {store.email && <div className="text-xs text-muted-foreground">{store.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" /> —
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">—</td>
                  <td className="px-4 py-3">
                    <Badge variant={store.is_active ? 'success' : 'secondary'}>
                      {statusMap[(store.is_active ? 'active' : 'inactive') as keyof typeof statusMap]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link href={`/super-admin/stores/${store.id}`} className="gap-2"><Eye className="h-4 w-4" /> Bax</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/super-admin/stores/${store.id}/edit`} className="gap-2"><Edit className="h-4 w-4" /> Redaktə et</Link></DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleDelete(store.id)}>
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