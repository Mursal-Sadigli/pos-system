'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';

export default function NewStorePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    currency: 'AZN',
    timezone: 'Asia/Baku',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast({ title: 'Xəta', description: 'Mağaza adı daxil edin', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        tax_number: form.taxNumber || undefined,
        currency: form.currency,
        timezone: form.timezone,
      };
      const res = await api.post('/stores', payload);
      toast({ title: 'Uğur', description: 'Mağaza yaradıldı' });
      // Navigate to stores list or the created store
      const created = res.data?.store ?? res.data ?? null;
      if (created?.id) router.push(`/super-admin/stores/${created.id}`);
      else router.push('/super-admin/stores');
    } catch (err: any) {
      console.error('Create store failed', err?.response?.data ?? err);
      toast({ title: 'Xəta', description: 'Mağaza yaradılarkən xəta baş verdi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/super-admin/stores">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-semibold">Yeni Mağaza Yarat</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mağaza Məlumatları</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-2xl">
            <div>
              <Label>Ad</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Mağaza adı" />
            </div>

            <div>
              <Label>Email</Label>
              <Input name="email" value={form.email} onChange={handleChange} placeholder="info@magaza.az" />
            </div>

            <div>
              <Label>Telefon</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+994 50 123 45 67" />
            </div>

            <div>
              <Label>Ünvan</Label>
              <Textarea name="address" value={form.address} onChange={handleChange} placeholder="Mağaza ünvanı" />
            </div>

            <div>
              <Label>VÖEN / Vergi nömrəsi</Label>
              <Input name="taxNumber" value={form.taxNumber} onChange={handleChange} placeholder="AZ123456789" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Valyuta</Label>
                <Input name="currency" value={form.currency} onChange={handleChange} />
              </div>
              <div className="flex-1">
                <Label>Timezone</Label>
                <Input name="timezone" value={form.timezone} onChange={handleChange} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>{loading ? 'Yaradılır...' : 'Yarat'}</Button>
              <Link href="/super-admin/stores">
                <Button variant="outline">Ləğv Et</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
