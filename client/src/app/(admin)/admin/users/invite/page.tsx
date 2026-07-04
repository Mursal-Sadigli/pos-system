'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { authApi } from '@/lib/api';

const inviteSchema = z.object({
  name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
  email: z.string().email('Düzgün email daxil edin'),
  role: z.enum(['MANAGER', 'CASHIER', 'VIEWER']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function InviteUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'CASHIER' },
  });

  const role = watch('role');

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true);
    try {
      const response = await authApi.inviteUser(data);
      
      // Göndərilən şifrəni göstər
      setGeneratedPassword(response.data.password);
      
      toast({
        title: '✅ Dəvət göndərildi!',
        description: `${data.email} ünvanına dəvət göndərildi`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Xəta baş verdi',
        description: error?.message || 'Dəvət göndərilmədi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    const clipboard = (globalThis as { navigator?: { clipboard?: { writeText?: (value: string) => void } } }).navigator?.clipboard;
    if (clipboard?.writeText) {
      clipboard.writeText(generatedPassword);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Geri
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Yeni İstifadəçi Dəvət Et
          </CardTitle>
          <CardDescription>
            İstifadəçiyə avtomatik random şifrə göndəriləcək.
            İlk girişdə şifrə dəyişmə məcburidir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input
                placeholder="Elçin Məmmədov"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="elchin@company.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                onValueChange={(value: any) => setValue('role', value)}
                defaultValue="CASHIER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGER">Menecer</SelectItem>
                  <SelectItem value="CASHIER">Kassir</SelectItem>
                  <SelectItem value="VIEWER">Müşahidəçi</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === 'MANAGER' && 'Menecerlər məhsul, sifariş və hesabatları idarə edə bilər'}
                {role === 'CASHIER' && 'Kassirlər yalnız satış edə və ödəniş qəbul edə bilər'}
                {role === 'VIEWER' && 'Müşahidəçilər yalnız məlumatlara baxa bilər'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Göndərilir...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Dəvət Göndər
                </>
              )}
            </Button>
          </form>

          {/* Göndərilən şifrəni göstər */}
          {generatedPassword && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">✅ Dəvət göndərildi!</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">Şifrə:</span>
                    <code className="bg-white px-3 py-1 rounded text-sm font-mono">
                      {showPassword ? generatedPassword : '••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyPassword}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/users')}
                >
                  İşçilərə Bax
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}