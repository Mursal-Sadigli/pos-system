'use client';

import { useState } from 'react';
import {
  Settings,
  Shield,
  Database,
  Bell,
  Mail,
  Globe,
  Server,
  RefreshCw,
  Save,
  Lock,
  Key,
  Users,
  Store,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

export default function SuperAdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'POS System',
    defaultLanguage: 'az',
    defaultTimezone: 'Asia/Baku',
    defaultCurrency: 'AZN',
    maintenanceMode: false,
    allowRegistration: false,
    enableEmailNotifications: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    ipWhitelist: '192.168.1.1, 10.0.0.1',
    enableAuditLog: true,
    passwordPolicy: 'strong',
    requirePasswordChange: 30,
  });

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: '✅ Parametrlər saxlanıldı',
        description: 'Bütün dəyişikliklər uğurla tətbiq edildi',
      });
    }, 1500);
  };

  const handleBackup = () => {
    toast({
      title: '💾 Backup başladıldı',
      description: 'Sistem backup-ı arxa planda aparılır',
    });
  };

  const handleReset = () => {
    toast({
      title: '⚠️ Parametrlər sıfırlandı',
      description: 'Bütün parametrlər default vəziyyətə qaytarıldı',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7 text-red-600" />
            Sistem Parametrləri
          </h1>
          <p className="text-muted-foreground">
            Bütün sistem parametrlərini idarə edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBackup} className="gap-2">
            <Database className="h-4 w-4" />
            Backup
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2 text-red-600">
            <RefreshCw className="h-4 w-4" />
            Sıfırla
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2 bg-red-600 hover:bg-red-700">
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saxlanılır...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Saxla
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            Ümumi
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Təhlükəsizlik
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Server className="h-4 w-4" />
            Sistem
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Ümumi Parametrlər</CardTitle>
              <CardDescription>
                Sistemin əsas parametrlərini konfiqurasiya edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Sistem Adı</Label>
                  <Input
                    id="systemName"
                    value={generalSettings.systemName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Dil</Label>
                  <select
                    id="defaultLanguage"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={generalSettings.defaultLanguage}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}
                  >
                    <option value="az">Azərbaycanca</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultTimezone">Saat Qurşağı</Label>
                  <select
                    id="defaultTimezone"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={generalSettings.defaultTimezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, defaultTimezone: e.target.value })}
                  >
                    <option value="Asia/Baku">Asia/Baku (UTC+4)</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Valyuta</Label>
                  <select
                    id="defaultCurrency"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={generalSettings.defaultCurrency}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, defaultCurrency: e.target.value })}
                  >
                    <option value="AZN">AZN (₼)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Baxım Rejimi</Label>
                    <p className="text-sm text-muted-foreground">
                      Aktiv olduqda sistem müvəqqəti olaraq bağlanır
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Öz-özünə Qeydiyyat</Label>
                    <p className="text-sm text-muted-foreground">
                      İstifadəçilərin özləri qeydiyyatdan keçə bilər
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.allowRegistration}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, allowRegistration: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Bildirişləri</Label>
                    <p className="text-sm text-muted-foreground">
                      Sistem hadisələri üçün email bildirişləri göndər
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, enableEmailNotifications: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Təhlükəsizlik Parametrləri</CardTitle>
              <CardDescription>
                Sistem təhlükəsizlik parametrlərini konfiqurasiya edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Sessiya Vaxtı (dəqiqə)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Maksimum Login Cəhdi</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Ağ Siyahısı</Label>
                  <Input
                    id="ipWhitelist"
                    placeholder="192.168.1.1, 10.0.0.1"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vergül ilə ayırın. Boş saxlasanız, bütün IP-lərə icazə verilir
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirePasswordChange">Şifrə Dəyişmə (gün)</Label>
                  <Input
                    id="requirePasswordChange"
                    type="number"
                    value={securitySettings.requirePasswordChange}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, requirePasswordChange: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    İstifadəçilər bu müddətdən sonra şifrə dəyişməyə məcburdur
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>İki Faktorlu Doğrulama (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      İstifadəçilər üçün 2FA məcburidir
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Log</Label>
                    <p className="text-sm text-muted-foreground">
                      Bütün sistem hadisələrini qeydə al
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.enableAuditLog}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableAuditLog: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Parametrləri</CardTitle>
              <CardDescription>
                Sistem performans və saxlama parametrləri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Database Status</Label>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">Bağlantı aktivdir</span>
                    <Badge variant="outline" className="ml-auto border-green-600 text-green-600">
                      Live
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cache Status</Label>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">Cache aktivdir</span>
                    <Badge variant="outline" className="ml-auto border-green-600 text-green-600">
                      Redis
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Avtomatik Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Hər gün avtomatik backup yaradılır (saat 03:00)
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleBackup}>
                    <Database className="h-4 w-4 mr-2" />
                    İndi Backup Et
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Son Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      2024-01-15 03:00 - Uğurlu
                    </p>
                  </div>
                  <Badge variant="success">Başarılı</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Ölçüsü</Label>
                    <p className="text-sm text-muted-foreground">
                      256.4 MB
                    </p>
                  </div>
                  <Badge variant="outline">Yeni</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Parametrləri</CardTitle>
              <CardDescription>
                Email server parametrlərini konfiqurasiya edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Server</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    value="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP İstifadəçi</Label>
                  <Input
                    id="smtpUser"
                    placeholder="noreply@pos.com"
                    value="noreply@pos.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Şifrə</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value="password123"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Email Göndər</Label>
                    <p className="text-sm text-muted-foreground">
                      Konfiqurasiyanı yoxlamaq üçün test email göndərin
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Test Göndər
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Göndərilməsi</Label>
                    <p className="text-sm text-muted-foreground">
                      Sistem email-ləri göndərmək üçün SMTP istifadə edir
                    </p>
                  </div>
                  <Badge variant="success">Aktiv</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}