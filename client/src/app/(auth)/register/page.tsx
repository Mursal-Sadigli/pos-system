'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h1 className="text-3xl font-semibold">Qeydiyyat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Yeni hesab yaratmaq üçün aşağıdakı formu doldurun.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Ad</Label>
          <Input id="name" placeholder="Adınızı daxil edin" className="h-10 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="example@mail.com" className="h-10 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="password">Şifrə</Label>
          <Input id="password" type="password" placeholder="Şifrənizi daxil edin" className="h-10 rounded-xl" />
        </div>
      </div>

      <Button className="w-full">Qeydiyyatdan keç</Button>
      <p className="text-center text-sm text-muted-foreground">
        Hesabın var?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Daxil ol
        </Link>
      </p>
    </div>
  );
}