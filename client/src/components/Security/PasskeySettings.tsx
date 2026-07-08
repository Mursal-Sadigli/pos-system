'use client';

import { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PasskeySettingsProps {
  onLogsUpdated?: () => void;
  onPasskeyStatusChange?: (hasPasskey: boolean) => void;
}

export function PasskeySettings({ onLogsUpdated, onPasskeyStatusChange }: PasskeySettingsProps) {
  const [hasPasskey, setHasPasskey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await userApi.getPasskeyStatus();
      const status = res.data?.data?.hasPasskey || false;
      setHasPasskey(status);
      if (onPasskeyStatusChange) onPasskeyStatusChange(status);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRegisterPasskey = async () => {
    setIsRegistering(true);
    try {
      // 1. Get registration options from server
      const optRes = await userApi.getPasskeyRegistrationOptions();
      const options = optRes.data?.data;

      // 2. Pass options to browser authenticator
      let attestationResponse;
      try {
        attestationResponse = await startRegistration(options);
      } catch (error: any) {
        if (error.name === 'InvalidStateError') {
          return toast.error('Bu cihaz artıq qeydiyyatdan keçib.');
        }
        if (error.name === 'NotAllowedError') {
          return toast.error('Əməliyyat ləğv edildi.');
        }
        throw error;
      }

      // 3. Verify response with server
      await userApi.verifyPasskeyRegistration(attestationResponse);
      
      toast.success('Passkey uğurla əlavə edildi!');
      setHasPasskey(true);
      if (onPasskeyStatusChange) onPasskeyStatusChange(true);
      if (onLogsUpdated) onLogsUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Biometrik təsdiq əlavə edilə bilmədi');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biometrik Təsdiq (Passkey)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Face ID / Barmaq izi</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[280px] sm:max-w-none">
              {hasPasskey
                ? '✅ Cihazınız təsdiqlənib. Həssas əməliyyatlarda biometrik doğrulama istifadə ediləcək.'
                : 'Şifrə yazmadan təhlükəsiz və sürətli təsdiq üçün bu cihazı (və ya telefonu) qeydiyyatdan keçirin.'}
            </p>
          </div>
          <div className="flex gap-2">
            {!hasPasskey ? (
              <Button size="sm" onClick={handleRegisterPasskey} disabled={isRegistering}>
                {isRegistering ? 'Gözlənilir...' : 'Əlavə et'}
              </Button>
            ) : (
              <Button size="sm" onClick={handleRegisterPasskey} disabled={isRegistering} variant="outline">
                Başqa cihaz əlavə et
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
