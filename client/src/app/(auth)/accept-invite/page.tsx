'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '../../../hooks/useToast';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Dəvətinizi təsdiqləmək üçün gözləyin...');

  const token = searchParams?.get('token') ?? '';

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Dəvət tokeni tapılmadı. Linki yenidən yoxlayın.');
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await authApi.acceptInvitation(token);
      const acceptedData = response?.data?.data as { alreadyAccepted?: boolean } | undefined;
      const alreadyAccepted = Boolean(acceptedData?.alreadyAccepted);

      setStatus('success');
      // Köhnə tokenləri sil ki istifadəçi təmiz sessiya ilə login etsin
      useAuthStore.getState().logout();
      if (alreadyAccepted) {
        setMessage('Bu dəvət artıq qəbul edilib. İndi daxil ola bilərsiniz.');
        toast({ title: 'Dəvət artıq aktivdir', description: 'Hesabınız hazırdır. Daxil olun.' });
        window.setTimeout(() => router.push('/login'), 1200);
      } else {
        setMessage('Dəvət qəbul edildi. İndi daxil olaraq şifrənizi dəyişə bilərsiniz.');
        toast({ title: 'Dəvət qəbul edildi', description: 'Hesabınız artıq aktivdir. Daxil olun.' });
        window.setTimeout(() => router.push('/login'), 1200);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message || 'Dəvət qəbul edilərkən problem yarandı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>İstifadəçi Dəvəti</CardTitle>
          <CardDescription>
            Dəvət linkini təsdiqləyin və hesabınızı aktiv edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={handleAccept} disabled={loading || status === 'success' || !token}>
              {loading ? 'Qəbul edilir...' : 'Dəvəti Qəbul Et'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Daxil ol
            </Button>
          </div>
          {status === 'success' && (
            <p className="text-sm text-green-600">Hesabınız aktivləşdirildi. İndi giriş edə bilərsiniz.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Yüklənir...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
