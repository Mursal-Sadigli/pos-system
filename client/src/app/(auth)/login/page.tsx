'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';

const loginSchema=z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least characters'),
    remember: z.boolean().optional(),
});

type LoginFormData=z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router=useRouter();
    const {login, isLoading, user}=useAuth();
    const [showPassword, setShowPassword]=useState(false);

    // Artıq daxil olmuş istifadəçini yönləndir
    useEffect(() => {
      if (user) {
        if ((user as any).must_change_password || user.mustChangePassword) {
          router.replace('/change-password');
        } else if (user.role === 'SUPER_ADMIN') {
          router.replace('/super-admin');
        } else if (user.role === 'ADMIN') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      }
    }, [user, router]);

    const {register, handleSubmit, formState: {errors}, }=useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const onSubmit=async(data: LoginFormData) => {
        try{
            const response = await login(data.email, data.password);
            toast.success('Uğurla daxil oldunuz!');
            const user = response?.user;
            const role = user?.role;
            if (user?.must_change_password || (user as any)?.mustChangePassword) {
              router.push('/change-password');
            } else if (role === 'SUPER_ADMIN') {
              router.push('/super-admin');
            } else if (role === 'ADMIN') {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
        }catch(error: any){
            console.error('Login xətası:', error);
            toast.error(error?.message || 'Daxil olma uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.');
        }
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Daxil ol</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hesabınıza daxil olmaq üçün email və şifrəni yazın.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" {...register('remember')} />
          <Label htmlFor="remember" className="text-sm font-normal">
            Xatırla
          </Label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Şifrəni unutmusunuz?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Daxil ol'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Hesabınız yoxdur?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Qeydiyyatdan keç
        </Link>
      </p>
    </form>
  </div>
  );
}
