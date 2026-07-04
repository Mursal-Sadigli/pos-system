'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
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
import { authApi } from '@/lib/api';

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      await authApi.inviteUser({
        name: name.trim(),
        email: email.trim(),
        role,
      });

      toast({
        title: 'Dəvət göndərildi',
        description: 'İstifadəçi üçün dəvət linki yaradıldı.',
      });

      router.push('/super-admin/users');
    } catch (error: any) {
      toast({
        title: 'Xəta',
        description: error?.message || 'İstifadəçi dəvəti göndərilmədi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => router.push('/super-admin/users')}>
        <ArrowLeft className="h-4 w-4" />
        Geri
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Yeni istifadəçi
          </CardTitle>
          <CardDescription>
            Yeni istifadəçiyə dəvət göndərin və rol təyin edin.
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
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isLoading ? 'Göndərilir...' : 'Dəvət göndər'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
