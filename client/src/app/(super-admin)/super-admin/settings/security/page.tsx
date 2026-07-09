'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { superAdminService, SecuritySettings } from '@/services/superAdmin.service';
import { RefreshCw, Save } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    passwordComplexity: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsFetching(true);
      const res = await superAdminService.getSecuritySettings();
      if (res.data) {
        setSecuritySettings(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      toast({
        title: '❌ Xəta',
        description: 'Təhlükəsizlik parametrlərini yükləmək mümkün olmadı',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await superAdminService.updateSecuritySettings(securitySettings);
      toast({
        title: '✅ Təhlükəsizlik parametrləri saxlanıldı',
        description: 'Bütün dəyişikliklər uğurla tətbiq edildi',
      });
    } catch (error) {
      console.error('Failed to save security settings:', error);
      toast({
        title: '❌ Xəta',
        description: 'Parametrləri yadda saxlamaq mümkün olmadı',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChange = async (key: keyof SecuritySettings, checked: boolean) => {
    const updatedSettings = { ...securitySettings, [key]: checked };
    setSecuritySettings(updatedSettings);

    if (checked) {
      let msg = '';
      if (key === 'twoFactorAuth') msg = 'İki-mərhələli doğrulama (2FA) aktivləşdirildi';
      if (key === 'passwordComplexity') msg = 'Güclü şifrə siyasəti aktivləşdirildi';
      toast({ title: '✅ Bildiriş', description: msg });
    }

    try {
      await superAdminService.updateSecuritySettings(updatedSettings);
    } catch (error) {
      console.error('Failed to auto-save toggle:', error);
      setSecuritySettings(securitySettings); // revert
      toast({ title: '❌ Xəta', description: 'Dəyişiklik yadda saxlanıla bilmədi', variant: 'destructive' });
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Təhlükəsizlik Parametrləri</CardTitle>
          <CardDescription>
            Sistemin təhlükəsizlik siyasətini idarə edin
          </CardDescription>
        </div>
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
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>İki-Mərhələli Doğrulama (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Bütün istifadəçilər üçün giriş zamanı 2FA tələb olunur
              </p>
            </div>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={(checked) => handleToggleChange('twoFactorAuth', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Güclü Şifrə Siyasəti</Label>
              <p className="text-sm text-muted-foreground">
                Şifrələrdə böyük hərf, rəqəm və simvol tələb olunur
              </p>
            </div>
            <Switch
              checked={securitySettings.passwordComplexity}
              onCheckedChange={(checked) => handleToggleChange('passwordComplexity', checked)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Sessiya Müddəti (dəqiqə)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min={1}
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 30 })}
            />
            <p className="text-xs text-muted-foreground">İstifadəçi hərəkətsiz qaldıqda avtomatik çıxış edilir.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxLoginAttempts">Maksimum Giriş Cəhdləri</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              min={1}
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
            />
            <p className="text-xs text-muted-foreground">Maksimum həddi keçdikdə hesab müvəqqəti bloklanır.</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
