'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Düzgün email daxil edin'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success('Şifrə yeniləmə linki göndərildi!');
    } catch (error: any) {
      toast.error(error?.message || 'Link göndərilə bilmədi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-3xl font-semibold">Şifrə sıfırlama</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Şifrənizi bərpa etmək üçün emailinizi daxil edin.
        </p>
      </div>

      {isSuccess ? (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center">
          <p>Yeniləmə linki uğurla göndərildi. Zəhmət olmasa emailinizi yoxlayın.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@mail.com" 
              className={\`h-10 rounded-xl \${errors.email ? 'border-destructive' : ''}\`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Yeniləmə linki göndər
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Xatırladın?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Daxil ol
        </Link>
      </p>
    </div>
  );
}