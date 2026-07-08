'use client';

import { useState, useEffect, useCallback } from 'react';
import { storeApi, userApi, authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const tabs = [
  { value: 'general', label: '🏠 Ümumi' },
  { value: 'profile', label: '👤 Profil' },
  { value: 'users', label: '👥 İstifadəçilər' },
  { value: 'notifications', label: '🔔 Bildirişlər' },
  { value: 'reports', label: '📊 Hesabatlar' },
  { value: 'security', label: '🔒 Təhlükəsizlik' },
];

// ─── Notification & Report Preferences Tab ─────────────────────────────────────
type NotifPrefs = {
  email: { new_order: boolean; daily_report: boolean };
  sms: { updates: boolean; payment_reminder: boolean };
  push: { new_message: boolean; account_activity: boolean };
  reports: { auto_daily: boolean; auto_weekly: boolean; format: string; frequency: string };
};

const DEFAULT_PREFS: NotifPrefs = {
  email: { new_order: false, daily_report: false },
  sms: { updates: false, payment_reminder: false },
  push: { new_message: false, account_activity: false },
  reports: { auto_daily: false, auto_weekly: false, format: 'Excel', frequency: 'Gündəlik' },
};

// ─── Reports Tab Component ─────────────────────────────────────────────────────
function ReportsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await userApi.getNotifPrefs();
        const data = res.data?.data;
        if (data && typeof data === 'object') {
          setPrefs({ ...DEFAULT_PREFS, ...data });
        }
      } catch (err) {
        console.warn('[NotifPrefs] Load failed, using defaults');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateReportPref = async (key: keyof NotifPrefs['reports'], value: any) => {
    const updated = {
      ...prefs,
      reports: {
        ...prefs.reports,
        [key]: value,
      },
    } as NotifPrefs;

    setPrefs(updated);
    setSaving(true);
    try {
      await userApi.updateNotifPrefs(updated);
      if (value === true || typeof value === 'string') {
        toast.success('Hesabat tənzimləməsi yadda saxlandı');
      }
    } catch (err) {
      setPrefs(prefs);
      toast.error('Saxlama xətası baş verdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saving && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
          Yadda saxlanılır...
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hesabat ayarları</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="report-frequency">Hesabat tezliyi</Label>
              <select
                id="report-frequency"
                className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                value={prefs.reports?.frequency || 'Gündəlik'}
                onChange={(e) => updateReportPref('frequency', e.target.value)}
              >
                <option>Gündəlik</option>
                <option>Həftəlik</option>
                <option>Aylıq</option>
              </select>
            </div>
            <div>
              <Label htmlFor="report-format">Format</Label>
              <select
                id="report-format"
                className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                value={prefs.reports?.format || 'Excel'}
                onChange={(e) => updateReportPref('format', e.target.value)}
              >
                <option>PDF</option>
                <option>Excel</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avtomatik hesabatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span>Gündəlik satış</span>
              <Switch 
                id="auto-daily-report" 
                checked={prefs.reports?.auto_daily || false}
                onCheckedChange={(c) => updateReportPref('auto_daily', c)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span>Həftəlik inventar</span>
              <Switch 
                id="auto-weekly-inventory" 
                checked={prefs.reports?.auto_weekly || false}
                onCheckedChange={(c) => updateReportPref('auto_weekly', c)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await userApi.getNotifPrefs();
        const data = res.data?.data;
        if (data && typeof data === 'object') {
          setPrefs({ ...DEFAULT_PREFS, ...data });
        }
      } catch (err) {
        // API yoxdursa default dəyərlər qalır
        console.warn('[NotifPrefs] Load failed, using defaults');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = useCallback(
    async (group: keyof NotifPrefs, key: string) => {
      const newValue = !(prefs[group] as any)[key];
      const updated = {
        ...prefs,
        [group]: {
          ...(prefs[group] as any),
          [key]: newValue,
        },
      } as NotifPrefs;

      setPrefs(updated); // Optimistic update
      setSaving(true);
      try {
        await userApi.updateNotifPrefs(updated);
        if (newValue === true) {
          toast.success('Bildiriş tənzimləməsi yadda saxlandı');
        }
      } catch (err) {
        setPrefs(prefs); // Revert on error
        toast.error('Saxlama xətası baş verdi');
      } finally {
        setSaving(false);
      }
    },
    [prefs]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saving && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
          Yadda saxlanılır...
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle>Email bildirişləri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Yeni sifariş</p>
                <p className="text-xs text-muted-foreground">Hər yeni sifarişdə email göndər</p>
              </div>
              <Switch
                id="email-new-order"
                checked={prefs.email.new_order}
                onCheckedChange={() => toggle('email', 'new_order')}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Gündəlik hesabat</p>
                <p className="text-xs text-muted-foreground">Hər gün satış hesabatı al</p>
              </div>
              <Switch
                id="email-daily-report"
                checked={prefs.email.daily_report}
                onCheckedChange={() => toggle('email', 'daily_report')}
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS */}
        <Card>
          <CardHeader>
            <CardTitle>SMS bildirişləri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Yeniliklər</p>
                <p className="text-xs text-muted-foreground">Sistem yenilikləri haqqında SMS al</p>
              </div>
              <Switch
                id="sms-updates"
                checked={prefs.sms.updates}
                onCheckedChange={() => toggle('sms', 'updates')}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Ödəniş xatırlatması</p>
                <p className="text-xs text-muted-foreground">Vaxtı keçmiş ödənişlər üçün SMS</p>
              </div>
              <Switch
                id="sms-payment-reminder"
                checked={prefs.sms.payment_reminder}
                onCheckedChange={() => toggle('sms', 'payment_reminder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push */}
        <Card>
          <CardHeader>
            <CardTitle>Push bildirişləri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Yeni mesaj</p>
                <p className="text-xs text-muted-foreground">Yeni mesaj gəldikdə bildiriş al</p>
              </div>
              <Switch
                id="push-new-message"
                checked={prefs.push.new_message}
                onCheckedChange={() => toggle('push', 'new_message')}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Hesab hərəkətləri</p>
                <p className="text-xs text-muted-foreground">Hesabınıza giriş edildikdə</p>
              </div>
              <Switch
                id="push-account-activity"
                checked={prefs.push.account_activity}
                onCheckedChange={() => toggle('push', 'account_activity')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<{ qrCodeUrl: string; secret: string } | null>(null);
  const [otpToken, setOtpToken] = useState('');
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [revokingSession, setRevokingSession] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statusRes, logsRes] = await Promise.all([
          userApi.get2FAStatus(),
          userApi.getAuditLogs(20),
        ]);
        setTwoFAEnabled(statusRes.data?.data?.enabled || false);
        setAuditLogs(logsRes.data?.data?.logs || []);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
        setLogsLoading(false);
      }
    })();
  }, []);

  const handleGenerate2FA = async () => {
    try {
      const res = await userApi.generate2FA();
      setQrData(res.data?.data);
      setShowQR(true);
    } catch {
      toast.error('QR kod yaradılarkən xəta baş verdi');
    }
  };

  const handleEnable2FA = async () => {
    if (!otpToken.trim()) return toast.error('Kod daxil edin');
    setEnabling2FA(true);
    try {
      await userApi.enable2FA(otpToken);
      setTwoFAEnabled(true);
      setShowQR(false);
      setQrData(null);
      setOtpToken('');
      toast.success('2FA uğurla aktivləşdirildi!');
      const logsRes = await userApi.getAuditLogs(20);
      setAuditLogs(logsRes.data?.data?.logs || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Kod yanlışdır');
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) return toast.error('Şifrənizi daxil edin');
    setDisabling2FA(true);
    try {
      await userApi.disable2FA(disablePassword);
      setTwoFAEnabled(false);
      setShowDisableModal(false);
      setDisablePassword('');
      toast.success('2FA deaktiv edildi');
      const logsRes = await userApi.getAuditLogs(20);
      setAuditLogs(logsRes.data?.data?.logs || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Şifrə yanlışdır');
    } finally {
      setDisabling2FA(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Bütün digər cihaz və brauzerlərinizdəki sessiyalar ləğv ediləcək. Davam etmək istəyirsiniz?')) return;
    setRevokingSession(true);
    try {
      await userApi.revokeAllSessions();
      toast.success('Bütün sessiyalar ləğv edildi. Digər cihazlar sistemi tərk etdi.');
      const logsRes = await userApi.getAuditLogs(20);
      setAuditLogs(logsRes.data?.data?.logs || []);
    } catch {
      toast.error('Sessiyalar ləğv edilərkən xəta baş verdi');
    } finally {
      setRevokingSession(false);
    }
  };

  const ACTION_LABELS: Record<string, string> = {
    login: '🔑 Sistemə giriş',
    password_changed: '🔒 Şifrə dəyişdirildi',
    '2fa_enabled': '🛡️ 2FA aktivləşdirildi',
    '2fa_disabled': '⚠️ 2FA deaktiv edildi',
    sessions_revoked: '🚫 Sessiyalar ləğv edildi',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2FA Card */}
      <Card>
        <CardHeader>
          <CardTitle>İki Faktorlu Təsdiqləmə (2FA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">İki faktorlu təsdiq</p>
              <p className="text-sm text-muted-foreground">
                {twoFAEnabled ? '✅ Aktiv — hesabınız qorunur.' : 'Hesab təhlükəsizliyini artırın.'}
              </p>
            </div>
            {twoFAEnabled ? (
              <Button variant="destructive" size="sm" onClick={() => setShowDisableModal(true)}>
                Deaktiv et
              </Button>
            ) : (
              <Button size="sm" onClick={handleGenerate2FA}>
                Aktivləşdir
              </Button>
            )}
          </div>

          {/* QR Code setup flow */}
          {showQR && qrData && (
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              <p className="text-sm font-medium">Google Authenticator tətbiqini açın və QR kodu skan edin:</p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrData.qrCodeUrl} alt="2FA QR Code" className="rounded-lg border" width={180} height={180} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Skan edə bilmirsinizsə, bu kodu əl ilə daxil edin: <span className="font-mono font-bold">{qrData.secret}</span>
              </p>
              <div className="flex gap-2">
                <Input
                  id="otp-token"
                  placeholder="6 rəqəmli kodu daxil edin"
                  value={otpToken}
                  onChange={e => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <Button onClick={handleEnable2FA} disabled={enabling2FA || otpToken.length !== 6}>
                  {enabling2FA ? 'Yoxlanılır...' : 'Təsdiqlə'}
                </Button>
              </div>
            </div>
          )}

          {/* Disable 2FA modal */}
          {showDisableModal && (
            <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">2FA-nı deaktiv etmək üçün şifrənizi daxil edin:</p>
              <div className="flex gap-2">
                <Input
                  id="disable-2fa-password"
                  type="password"
                  placeholder="Cari şifrəniz"
                  value={disablePassword}
                  onChange={e => setDisablePassword(e.target.value)}
                />
                <Button variant="destructive" onClick={handleDisable2FA} disabled={disabling2FA}>
                  {disabling2FA ? '...' : 'Deaktiv et'}
                </Button>
                <Button variant="outline" onClick={() => { setShowDisableModal(false); setDisablePassword(''); }}>
                  Ləğv et
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sessiya İdarəsi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4">
            <p className="font-medium">Bütün sessiyaları ləğv et</p>
            <p className="text-sm text-muted-foreground mt-1">
              Bu, cari cihazınız xaricindəki bütün aktiv sessiyaları (digər kompüterlər, telefonlar) dərhal bağlayacaq. Hesabınıza icazəsiz giriş olduğunu düşünürsünüzsə bunu istifadə edin.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleRevokeAllSessions}
            disabled={revokingSession}
          >
            {revokingSession ? 'Ləğv edilir...' : '🚫 Bütün sessiyaları bağla'}
          </Button>
        </CardContent>
      </Card>

      {/* Audit Log Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fəaliyyət Tarixçəsi (Audit Log)</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Hələ heç bir fəaliyyət qeyd edilməyib.</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between rounded-lg border p-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ACTION_LABELS[log.action] || log.action}</p>
                    {log.description && (
                      <p className="text-xs text-muted-foreground">{log.description}</p>
                    )}
                    {log.ip_address && (
                      <p className="text-xs text-muted-foreground">IP: {log.ip_address}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {log.created_at}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userApi.getProfile();
      const profile = res.data.data;
      if (profile) {
        setFormData({
          name: profile.name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
        });
      }
    } catch (error) {
      console.error('Profil gətirilə bilmədi', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      await userApi.updateProfile(formData);
      alert('Şəxsi məlumatlar yeniləndi!');
    } catch (error: any) {
      console.error('Profil yadda saxlanıla bilmədi', error);
      alert(error.response?.data?.message || 'Yenilənmə zamanı xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return alert('Bütün şifrə xanalarını doldurun!');
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert('Yeni şifrə təkrarı ilə uyğun deyil!');
    }
    try {
      setSaving(true);
      await userApi.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      alert('Şifrə uğurla dəyişdirildi!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Şifrə yenilənə bilmədi', error);
      alert(error.response?.data?.message || 'Şifrə dəyişdirilərkən xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Yüklənir...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Şəxsi məlumatlar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="first-name">Ad</Label>
            <Input id="first-name" placeholder="Ad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="last-name">Soyad</Label>
            <Input id="last-name" placeholder="Soyad" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@domain.az" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" placeholder="+994 50 123 45 67" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
        </CardContent>
        <div className="flex justify-end p-6 pt-0">
          <Button onClick={handleProfileSave} disabled={saving}>
            {saving ? 'Yenilənir...' : 'Yadda Saxla'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Şifrə dəyiş</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="current-password">Cari şifrə</Label>
            <Input id="current-password" type="password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
          </div>
          <div></div>
          <div>
            <Label htmlFor="new-password">Yeni şifrə</Label>
            <Input id="new-password" type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="confirm-password">Şifrə təkrarı</Label>
            <Input id="confirm-password" type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
          </div>
        </CardContent>
        <div className="flex justify-end p-6 pt-0">
          <Button onClick={handlePasswordSave} disabled={saving}>
            {saving ? 'Dəyişdirilir...' : 'Şifrəni Dəyiş'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function GeneralTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    store_code: '',
    address: '',
    phone: '',
    email: '',
    contact_phone: '',
    manager_name: '',
    work_start: '',
    work_end: '',
    work_days: [] as string[],
    currency: 'AZN',
    language: 'az',
    tax_rate: 0
  });

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const res = await storeApi.getMyStore();
      const store = res.data?.data;
      if (store) {
        setFormData({
          name: store.name || '',
          store_code: store.store_code || '',
          address: store.address || '',
          phone: store.phone || '',
          email: store.email || '',
          contact_phone: store.contact_phone || '',
          manager_name: store.manager_name || '',
          work_start: store.work_start || '',
          work_end: store.work_end || '',
          work_days: store.work_days ? (typeof store.work_days === 'string' ? JSON.parse(store.work_days) : store.work_days) : ['Bazar ertəsi - Cümə'],
          currency: store.currency || 'AZN',
          language: store.language || 'az',
          tax_rate: store.tax_rate !== undefined && store.tax_rate !== null ? Number(store.tax_rate) : 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch store', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await storeApi.updateMyStore(formData);
      alert('Mağaza məlumatları yeniləndi!');
    } catch (error) {
      console.error('Mağaza yadda saxlanıla bilmədi', error);
      alert('Yenilənmə zamanı xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter(d => d !== day)
        : [...prev.work_days, day]
    }));
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Yüklənir...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mağaza məlumatları</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="store-name">Mağaza adı</Label>
            <Input id="store-name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Mağaza adı" />
          </div>
          <div>
            <Label htmlFor="store-code">Mağaza kodu</Label>
            <Input id="store-code" value={formData.store_code} onChange={e => setFormData({...formData, store_code: e.target.value})} placeholder="ST001" />
          </div>
          <div>
            <Label htmlFor="store-address">Ünvan</Label>
            <Input id="store-address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Bakı, Azərbaycan" />
          </div>
          <div>
            <Label htmlFor="store-phone">Telefon</Label>
            <Input id="store-phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+994 50 123 45 67" />
          </div>
          <div>
            <Label htmlFor="currency">Valyuta</Label>
            <select
              id="currency"
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value})}
              className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="AZN">AZN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <Label htmlFor="language">Dil</Label>
            <select
              id="language"
              value={formData.language}
              onChange={e => setFormData({...formData, language: e.target.value})}
              className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              <option value="az">Azərbaycanca</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div>
            <Label htmlFor="tax-rate">Vergi faizi (%)</Label>
            <Input id="tax-rate" type="number" step="0.01" value={formData.tax_rate} onChange={e => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})} placeholder="18" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Əlaqə məlumatları</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input id="contact-email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="info@yourstore.az" />
          </div>
          <div>
            <Label htmlFor="contact-phone">Əsas telefon</Label>
            <Input id="contact-phone" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} placeholder="+994 12 345 67 89" />
          </div>
          <div>
            <Label htmlFor="contact-manager">Mağaza meneceri</Label>
            <Input id="contact-manager" value={formData.manager_name} onChange={e => setFormData({...formData, manager_name: e.target.value})} placeholder="Ad Soyad" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İş saatları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="work-start">Başlama</Label>
              <Input id="work-start" type="time" value={formData.work_start} onChange={e => setFormData({...formData, work_start: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="work-end">Bitmə</Label>
              <Input id="work-end" type="time" value={formData.work_end} onChange={e => setFormData({...formData, work_end: e.target.value})} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Bazar ertəsi - Cümə', 'Şənbə', 'Bazar'].map(day => (
              <Badge 
                key={day} 
                variant={formData.work_days.includes(day) ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => toggleDay(day)}
              >
                {day}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saxlanılır...' : 'Yadda Saxla'}
        </Button>
      </div>
    </div>
  );
}

function UsersTab({ currentUser }: { currentUser: any }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'CASHIER' });
  const [inviting, setInviting] = useState(false);

  // Edit user state
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  // Roles state
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    MANAGER: [],
    CASHIER: [],
    VIEWER: []
  });
  const [savingRoles, setSavingRoles] = useState(false);

  const availablePermissions = [
    { id: 'pos_access', label: 'POS Terminal Satış' },
    { id: 'sales_view_own', label: 'Öz Satışlarını Görmək' },
    { id: 'sales_view', label: 'Bütün Satışları Görmək' },
    { id: 'inventory_view', label: 'Anbarı Görmək' },
    { id: 'inventory_manage', label: 'Anbarı İdarə Etmək' },
    { id: 'store_settings', label: 'Mağaza Tənzimləmələri' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchStoreRoles();
  }, []);

  const fetchStoreRoles = async () => {
    try {
      const res = await storeApi.getMyStore();
      if (res.data?.data?.role_permissions) {
        setRolePermissions(res.data.data.role_permissions);
      }
    } catch (e) {
      console.error('Failed to fetch store roles', e);
    }
  };

  const handleRoleToggle = (role: string, permissionId: string) => {
    setRolePermissions(prev => {
      const perms = prev[role] || [];
      const newPerms = perms.includes(permissionId)
        ? perms.filter(p => p !== permissionId)
        : [...perms, permissionId];
      return { ...prev, [role]: newPerms };
    });
  };

  const saveRolePermissions = async () => {
    try {
      setSavingRoles(true);
      await storeApi.updateMyStore({ role_permissions: rolePermissions });
      alert('İcazələr yadda saxlanıldı!');
    } catch (e) {
      alert('İcazələri yadda saxlamaq mümkün olmadı');
    } finally {
      setSavingRoles(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers();
      if (res.data?.data) {
        const usersData = res.data.data.users || res.data.data.rows || res.data.data;
        if (Array.isArray(usersData)) {
          // ADMIN və SUPER_ADMIN-ləri gizlədirik
          const filteredUsers = usersData.filter((u: any) => u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN');
          setUsers(filteredUsers);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('İstifadəçilər gətirilə bilmədi', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setInviting(true);
      await authApi.inviteUser(inviteData);
      alert('İstifadəçi dəvət edildi!');
      setInviteOpen(false);
      setInviteData({ name: '', email: '', role: 'CASHIER' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Dəvət göndərilərkən xəta baş verdi');
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) return;
    try {
      await userApi.deleteUser(id);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Silinmə uğursuz oldu');
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: any = { ADMIN: 'Admin', MANAGER: 'Menecer', CASHIER: 'Kassir', VIEWER: 'İzləyici', SUPER_ADMIN: 'Super Admin' };
    return roles[role] || role;
  };

  const handleEditOpen = (user: any) => {
    setEditData({
      id: user.id,
      name: user.name,
      last_name: user.last_name || '',
      role: user.role,
      is_active: user.is_active
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    try {
      setEditing(true);
      await userApi.updateUser(editData.id, editData);
      alert('Məlumatlar yeniləndi!');
      setEditOpen(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Yenilənmə uğursuz oldu');
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>İşçi siyahısı</CardTitle>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>Yeni işçi əlavə et</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni İşçi Dəvət Et</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <Label>Ad və Soyad</Label>
                  <Input required value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} placeholder="Ad Soyad" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input required type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} placeholder="email@domain.com" />
                </div>
                <div>
                  <Label>Rol</Label>
                  <select 
                    className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    value={inviteData.role} 
                    onChange={e => setInviteData({...inviteData, role: e.target.value})}
                  >
                    {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
                    <option value="MANAGER">Menecer</option>
                    <option value="CASHIER">Kassir</option>
                    <option value="VIEWER">İzləyici</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={inviting}>
                    {inviting ? 'Göndərilir...' : 'Dəvət Göndər'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Yüklənir...</div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Ad</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">{u.name} {u.last_name || ''}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{getRoleLabel(u.role)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? 'success' : 'secondary'}>{u.is_active ? 'Aktiv' : 'Passiv'}</Badge>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditOpen(u)}>Düzəliş et</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>Sil</Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted-foreground">İstifadəçi tapılmadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşçi Məlumatlarına Düzəliş Et</DialogTitle>
          </DialogHeader>
          {editData && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>Ad</Label>
                <Input required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
              </div>
              <div>
                <Label>Soyad</Label>
                <Input value={editData.last_name} onChange={e => setEditData({...editData, last_name: e.target.value})} />
              </div>
              <div>
                <Label>Rol</Label>
                <select 
                  className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  value={editData.role} 
                  onChange={e => setEditData({...editData, role: e.target.value})}
                >
                  <option value="MANAGER">Menecer</option>
                  <option value="CASHIER">Kassir</option>
                  <option value="VIEWER">İzləyici</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={editData.is_active} 
                  onChange={e => setEditData({...editData, is_active: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive">Aktivdir</Label>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={editing}>
                  {editing ? 'Yadda Saxlanılır...' : 'Yadda Saxla'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
          <CardTitle>Rollar və icazələr</CardTitle>
          <Button onClick={saveRolePermissions} disabled={savingRoles}>
            {savingRoles ? 'Saxlanılır...' : 'İcazələri Yadda Saxla'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {['MANAGER', 'CASHIER', 'VIEWER'].map(role => (
            <div key={role} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">
                {role === 'MANAGER' ? 'Menecer' : role === 'CASHIER' ? 'Kassir' : 'İzləyici'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availablePermissions.map(perm => {
                  const hasPerm = (rolePermissions[role] || []).includes(perm.id);
                  return (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`${role}-${perm.id}`}
                        checked={hasPerm}
                        onChange={() => handleRoleToggle(role, perm.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`${role}-${perm.id}`} className="text-sm font-normal cursor-pointer">
                        {perm.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h1 className="text-3xl font-bold tracking-tight">Parametrlər</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mağaza, profil, istifadəçi və sistem parametrlərini buradan idarə edin.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <nav className="space-y-2 rounded-lg border bg-card p-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                activeTab === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {activeTab === 'general' && (
            <GeneralTab />
          )}

          {activeTab === 'profile' && (
            <ProfileTab />
          )}

          {activeTab === 'users' && (
            <UsersTab currentUser={user} />
          )}



          {activeTab === 'notifications' && (
            <NotificationsTab />
          )}

          {activeTab === 'reports' && (
            <ReportsTab />
          )}

          {activeTab === 'security' && (
            <SecurityTab />
          )}
        </div>
      </div>
    </div>
  );
}