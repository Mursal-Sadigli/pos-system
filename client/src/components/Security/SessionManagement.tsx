'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface SessionManagementProps {
  hasPasskey: boolean;
  onLogsUpdated?: () => void;
}

export function SessionManagement({ hasPasskey, onLogsUpdated }: SessionManagementProps) {
  const [revokingSession, setRevokingSession] = useState(false);

  const handleRevokeAllSessions = async () => {
    if (hasPasskey) {
      setRevokingSession(true);
      try {
        // 1. Get auth options
        const optRes = await userApi.getPasskeyAuthenticationOptions();
        const options = optRes.data?.data;

        // 2. Browser auth
        let assertionResponse;
        try {
          assertionResponse = await startAuthentication(options);
        } catch (error: any) {
          if (error.name === 'NotAllowedError') return toast.error('Əməliyyat ləğv edildi.');
          throw error;
        }

        // 3. Verify & Revoke
        await userApi.revokeSessionsWithPasskey(assertionResponse);
        toast.success('Bütün sessiyalar ləğv edildi. Digər cihazlar sistemi tərk etdi.');
        if (onLogsUpdated) onLogsUpdated();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Biometrik təsdiq xətası');
      } finally {
        setRevokingSession(false);
      }
      return;
    }

    if (!confirm('Bütün digər cihaz və brauzerlərinizdəki sessiyalar ləğv ediləcək. Davam etmək istəyirsiniz?')) return;
    
    setRevokingSession(true);
    try {
      await userApi.revokeAllSessions();
      toast.success('Bütün sessiyalar ləğv edildi. Digər cihazlar sistemi tərk etdi.');
      if (onLogsUpdated) onLogsUpdated();
    } catch {
      toast.error('Sessiyalar ləğv edilərkən xəta baş verdi');
    } finally {
      setRevokingSession(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessiya İdarəsi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border p-4">
          <p className="font-medium">Bütün sessiyaları ləğv et</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cari cihazınız xaricindəki bütün aktiv sessiyaları (digər kompüterlər, telefonlar) dərhal bağlayacaq.
            {hasPasskey && <span className="font-medium text-foreground"> Biometrik təsdiq (Face ID / Barmaq izi) tələb olunacaq.</span>}
          </p>
        </div>
        <Button variant="destructive" onClick={handleRevokeAllSessions} disabled={revokingSession}>
          {revokingSession ? 'Ləğv edilir...' : '🚫 Bütün sessiyaları bağla'}
        </Button>
      </CardContent>
    </Card>
  );
}
