'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Clock, UserPlus, ShoppingCart, Trash2, Edit, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const getActionIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes('product') || a.includes('order')) return <ShoppingCart className="h-4 w-4 text-green-500" />;
  if (a.includes('delete') || a.includes('remove') || a.includes('deactivate')) return <Trash2 className="h-4 w-4 text-red-500" />;
  if (a.includes('user') || a.includes('profile')) return <Edit className="h-4 w-4 text-blue-500" />;
  if (a.includes('login') || a.includes('session')) return <UserPlus className="h-4 w-4 text-gray-500" />;
  if (a.includes('security') || a.includes('passkey') || a.includes('2fa')) return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
  return <Clock className="h-4 w-4 text-gray-500" />;
};

const getActionType = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes('delete') || a.includes('remove') || a.includes('deactivate')) return 'destructive';
  if (a.includes('add') || a.includes('create') || a.includes('enable')) return 'success';
  if (a.includes('security') || a.includes('passkey') || a.includes('2fa') || a.includes('revoke')) return 'warning';
  return 'default';
};

export default function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real pagination
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await userApi.getStoreAuditLogs({ search: searchQuery, limit, offset });
      setLogs(res.data?.data?.logs || []);
      setTotal(res.data?.data?.total || 0);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Səlahiyyətiniz yoxdur');
      } else {
        toast.error('Loglar yüklənərkən xəta baş verdi');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is admin or manager
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchLogs();
    }
  }, [searchQuery, offset, user]);

  if (user && user.role === 'cashier') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Sizin bu səhifəni görmək səlahiyyətiniz yoxdur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Logları</h1>
          <p className="text-muted-foreground">Mağaza daxilində baş verən bütün əməliyyatların tarixçəsi</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İstifadəçi və ya əməliyyat axtar..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setOffset(0); // reset pagination on search
                }}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={fetchLogs} disabled={loading}>
              <Filter className="h-4 w-4" />
              Yenilə
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Əməliyyat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">İstifadəçi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Açıqlama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Yüklənir...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir log tapılmadı
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <Badge variant={getActionType(log.action) as any} className="text-xs">
                            {log.action}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm">
                        {log.first_name} {log.last_name} ({log.role})
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {log.description}
                        {log.ip_address && <span className="block text-xs text-muted-foreground/70 mt-0.5">IP: {log.ip_address}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination controls (Simple) */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>
          Cəmi {total} qeyd tapıldı
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0 || loading}
          >
            Əvvəlki
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total || loading}
          >
            Sonrakı
          </Button>
        </div>
      </div>
    </div>
  );
}
