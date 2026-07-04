'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { authApi } from '@/lib/api';
import api from '@/lib/api';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function NewAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', storeId: '' });
  const [stores, setStores] = useState<any[]>([]);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // load stores for dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/stores');
        const raw = res.data?.data?.stores ?? res.data?.stores ?? res.data?.data ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.rows && Array.isArray(raw.rows) ? raw.rows : []);
        setStores(list);
      } catch (err: any) {
        console.error('Failed to load stores for dropdown', {
          message: err?.message,
          code: err?.code,
          responseStatus: err?.response?.status,
          responseData: err?.response?.data ?? err,
        });
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({ title: 'Xəta', description: 'Ad və email daxil edin', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const payload: any = { name: form.name, email: form.email, role: 'ADMIN' };
      if (form.storeId) payload.storeId = form.storeId;
      const res = await authApi.inviteUser(payload);
      const responseData = res.data ?? res;
      // Backend qaytarır: { success: true, data: { password, acceptLink, invitation } }
      const actualData = responseData?.data ?? responseData;
      
      const password = actualData?.password ?? actualData?.generatedPassword ?? null;
      const acceptLink = actualData?.acceptLink ?? null;
      
      toast({ title: 'Uğur', description: 'Dəvətnamə göndərildi' });
      if (password) {
        setGeneratedPassword(password);
        if (acceptLink) (window as any)._acceptLink = acceptLink;
        setPwModalOpen(true);
      } else {
        router.push('/super-admin/admins');
      }
    } catch (err: any) {
      const errorData = err?.response?.data ?? err;
      console.error('Invite failed', errorData);
      const errorMessage = errorData?.message || errorData?.error || 'Admin dəvətnaməsi göndərilə bilmədi';
      toast({ title: 'Xəta', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/super-admin/admins">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-semibold">Yeni Admin Dəvətnaməsi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Məlumatları</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
            <div>
              <Label>Ad</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Ad Soyad" />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" value={form.email} onChange={handleChange} placeholder="email@domain.com" />
            </div>
            <div>
              <Label>Mağaza (isteğe bağlı)</Label>
              <Select value={form.storeId} onValueChange={(v) => setForm({ ...form, storeId: v })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Mağaza seçin (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Heç biri</SelectItem>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name ?? s.title ?? s.address ?? s.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>{loading ? 'Göndərilir...' : 'Dəvətnamə Göndər'}</Button>
              <Link href="/super-admin/admins"><Button variant="outline">Ləğv Et</Button></Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Dialog open={pwModalOpen} onOpenChange={setPwModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yaradılan Şifrə və Link</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-muted-foreground text-xs uppercase mb-1">Müvəqqəti Şifrə</Label>
              <p className="font-mono bg-muted/10 p-3 rounded">{generatedPassword}</p>
            </div>
            {typeof window !== 'undefined' && (window as any)._acceptLink && (
              <div>
                <Label className="text-muted-foreground text-xs uppercase mb-1">Qəbul Linki (Email getməsə bunu göndərin)</Label>
                <div className="flex gap-2">
                  <Input readOnly value={(window as any)._acceptLink} className="font-mono text-sm" />
                  <Button type="button" variant="outline" onClick={() => {
                    navigator.clipboard.writeText((window as any)._acceptLink);
                    toast({ title: 'Kopyalandı', description: 'Link yaddaşa kopyalandı' });
                  }}>Kopyala</Button>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">Bu şifrəni və linki istifadəçiyə paylaşın.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setPwModalOpen(false);
              router.push('/super-admin/admins');
            }}>Bağla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
