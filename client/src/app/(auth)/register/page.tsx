'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Qeydiyyat deaktivdir</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Yeni istifadəçi hesabı yaratmaq üçün əvvəlcə administrator tərəfindən dəvət almalısınız.
        </p>
      </div>

      <div className="rounded-3xl border border-muted p-8 bg-muted/20">
        <p className="text-base leading-7 text-foreground">
          Açıq qeydiyyat deaktiv edilib. Daxil olmaq üçün dəvət linkini gözləyin və ya administrator ilə əlaqə saxlayın.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/login" className="rounded-xl bg-primary px-4 py-3 text-center text-white hover:bg-primary/90">
          Daxil ol
        </Link>
        <Link href="/forgot-password" className="rounded-xl border border-border px-4 py-3 text-center hover:bg-muted">
          Şifrəni bərpa et
        </Link>
      </div>
    </div>
  );
}
