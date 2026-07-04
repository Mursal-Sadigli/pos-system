'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Yeni şifrə ən az 6 simvol olmalıdır'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifrələr uyğun deyil',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error('Token tapılmadı. Zəhmət olmasa linki yoxlayın.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token tapılmadı');
      return;
    }
    
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, data.newPassword);
      setIsSuccess(true);
      toast.success('Şifrəniz uğurla yeniləndi. Daxil ola bilərsiniz.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error?.message || 'Şifrə yenilənə bilmədi');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto py-10 text-center text-muted-foreground">
        Yalın və ya etibarsız link. Yenidən şifrə sıfırlama tələb edin.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10">
      {isSuccess ? (
        <div className="space-y-6 text-center">
          <div className="p-4 bg-green-50 text-green-700 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Təbriklər!</h2>
            <p>Şifrəniz uğurla yeniləndi.</p>
            <p className="text-sm mt-2">Sizi giriş səhifəsinə yönləndiririk...</p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full">
            Daxil ol
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-muted p-8 bg-white shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Şifrəni yenilə</h1>
            <p className="text-sm text-muted-foreground">Hesabınız üçün yeni şifrə təyin edin.</p>
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
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni şifrəni təsdiqləyin</Label>
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
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Şifrəni yenilə
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Yüklənir...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
