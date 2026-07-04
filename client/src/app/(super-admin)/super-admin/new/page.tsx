'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  UserCog,
  Mail,
  Building2,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { superAdminService } from '@/services/superAdmin.service';
import api from '@/lib/api';

const createAdminSchema = z.object({
  name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
  email: z.string().email('Düzgün email daxil edin'),
  storeId: z.string().min(1, 'Mağaza seçin'),
  permissions: z.array(z.string()).optional(),
  sendEmail: z.boolean(),
});

type CreateAdminFormData = {
  name: string;
  email: string;
  storeId: string;
  permissions?: string[];
  sendEmail: boolean;
};

export default function NewAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      permissions: ['view_all', 'manage_users', 'manage_products'],
      sendEmail: true,
    },
  });

  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await api.get('/stores');
        const raw = res.data?.data?.stores ?? res.data?.stores ?? res.data?.data ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.rows && Array.isArray(raw.rows) ? raw.rows : []);
        setStores(list);
      } catch (error) {
        console.error('Failed to load stores', error);
      }
    };

    loadStores();
  }, []);

  const onSubmit = async (data: CreateAdminFormData) => {
    setLoading(true);
    try {
      const response = await superAdminService.createAdmin({
        name: data.name,
        email: data.email,
        storeId: data.storeId,
        permissions: data.permissions || [],
      });

      setGeneratedPassword(response.data.data.password);
      
      toast({
        title: '✅ Admin yaradıldı!',
        description: `${data.name} admini uğurla yaradıldı`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Xəta baş verdi',
        description: error?.message || 'Admin yaradılmadı',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
    // Password field-a da yaz (əgər varsa)
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.value = newPassword;
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Geri */}
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => router.push('/super-admin/admins')}
      >
        <ArrowLeft className="h-4 w-4" />
        Adminlərə Qayıt
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-red-600" />
            Yeni Admin Yarat
          </CardTitle>
          <CardDescription>
            Sistemə yeni admin əlavə edin. Adminə avtomatik random şifrə göndəriləcək.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Ad */}
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

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="admin@company.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Mağaza */}
            <div className="space-y-2">
              <Label>Mağaza</Label>
              <Select
                onValueChange={(value) => setValue('storeId', value)}
              >
                <SelectTrigger className={errors.storeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Mağaza seçin" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {store.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.storeId && (
                <p className="text-sm text-red-500">{errors.storeId.message}</p>
              )}
            </div>

            {/* İcazələr */}
            <div className="space-y-2">
              <Label>İcazələr</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'view_all', label: '📊 Bütün Məlumatları Gör' },
                  { id: 'manage_users', label: '👥 İstifadəçiləri İdarə Et' },
                  { id: 'manage_products', label: '📦 Məhsulları İdarə Et' },
                  { id: 'manage_orders', label: '📋 Sifarişləri İdarə Et' },
                  { id: 'manage_reports', label: '📊 Hesabatları Gör' },
                  { id: 'manage_settings', label: '⚙️ Parametrləri İdarə Et' },
                ].map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={['view_all', 'manage_users', 'manage_products'].includes(perm.id)}
                      value={perm.id}
                      {...register('permissions')}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Random Şifrə Generator */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Şifrə</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleGeneratePassword}
                >
                  <RefreshCw className="h-4 w-4" />
                  Random Şifrə Yarat
                </Button>
              </div>
              {generatedPassword && (
                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                  <code className="flex-1 font-mono text-sm">
                    {showPassword ? generatedPassword : '••••••••••••'}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyPassword}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Adminə bu şifrə email ilə göndəriləcək. İlk girişdə şifrə dəyişmə məcburidir.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/super-admin/admins')}
              >
                Ləğv Et
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yaradılır...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Yarat
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Nəticə */}
          {generatedPassword && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">✅ Admin yaradıldı!</p>
                  <p className="text-sm text-green-700">
                    Email ünvanına dəvət göndərildi.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Şifrə:</span>
                    <code className="bg-white px-3 py-1 rounded text-sm font-mono">
                      {showPassword ? generatedPassword : '••••••••••••'}
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}