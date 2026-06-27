'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-3xl font-semibold">Şifrə sıfırlama</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Şifrənizi bərpa etmək üçün emailinizi daxil edin.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="example@mail.com" className="h-10 rounded-xl" />
        </div>
      </div>

      <Button className="w-full">Yeniləmə linki göndər</Button>

      <p className="text-center text-sm text-muted-foreground">
        Xatırladın?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Daxil ol
        </Link>
      </p>
    </div>
  );
}