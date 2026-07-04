'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { userApi } from '@/lib/api';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = use(params);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [status, setStatus] = useState('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resp = await userApi.getUser(id);
        const user = resp.data?.data || resp.data;
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setRole(user.role || 'ADMIN');
          setStatus(user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE'));
        }
      } catch (error: any) {
        toast({
          title: 'Xəta',
          description: 'İstifadəçi məlumatları yüklənmədi.',
          variant: 'destructive',
        });
        router.push('/super-admin/users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id, router, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Xəta',
        description: 'Ad və email doldurulmalıdır.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      await userApi.updateUser(id, {
        name: name.trim(),
        email: email.trim(),
        role,
        status,
        is_active: status === 'ACTIVE',
      });

      toast({
        title: 'Uğurlu',
        description: 'İstifadəçi məlumatları yeniləndi.',
      });

      router.push('/super-admin/users');
    } catch (error: any) {
      toast({
        title: 'Xəta',
        description: error?.message || 'Yenilənmə zamanı xəta baş verdi.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => router.push('/super-admin/users')}>
        <ArrowLeft className="h-4 w-4" />
        Geri
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            İstifadəçini Redaktə Et
          </CardTitle>
          <CardDescription>
            İstifadəçi məlumatlarını və rolunu dəyişdirin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="CASHIER">Kassir</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktiv</SelectItem>
                  <SelectItem value="INACTIVE">Deaktiv</SelectItem>
                  <SelectItem value="SUSPENDED">Dayandırılıb</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isSaving} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saxlanılır...' : 'Yadda Saxla'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}