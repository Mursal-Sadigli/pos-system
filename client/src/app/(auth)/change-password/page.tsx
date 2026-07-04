'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Cari şifrə ən az 6 simvol olmalıdır'),
  newPassword: z.string().min(6, 'Yeni şifrə ən az 6 simvol olmalıdır'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifrələr uyğun deyil',
  path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast.success('Şifrəniz uğurla dəyişdirildi. Daxil olun.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error?.message || 'Şifrə dəyişdirilə bilmədi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-muted p-8 bg-white shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Şifrəni dəyiş</h1>
          <p className="text-sm text-muted-foreground">Təhlükəsizlik üçün yeni şifrə seçin.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentPassword">Cari şifrə</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              {...register('currentPassword')}
              className={errors.currentPassword ? 'border-destructive' : ''}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Yeni şifrə</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              {...register('newPassword')}
              className={errors.newPassword ? 'border-destructive' : ''}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Şifrəni təsdiq et</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Şifrəni yenilə'}
        </Button>
      </form>
    </div>
  );
}
