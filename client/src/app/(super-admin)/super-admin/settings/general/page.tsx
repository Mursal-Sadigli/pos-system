'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { superAdminService, GeneralSettings } from '@/services/superAdmin.service';
import { RefreshCw, Save } from 'lucide-react';

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    systemName: 'POS System',
    defaultLanguage: 'az',
    defaultTimezone: 'Asia/Baku',
    defaultCurrency: 'AZN',
    maintenanceMode: false,
    allowRegistration: false,
    enableEmailNotifications: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsFetching(true);
      const res = await superAdminService.getGeneralSettings();
      if (res.data) {
        setGeneralSettings(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch general settings:', error);
      toast({
        title: '❌ Xəta',
        description: 'Parametrləri yükləmək mümkün olmadı',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await superAdminService.updateGeneralSettings(generalSettings);
      toast({
        title: '✅ Parametrlər saxlanıldı',
        description: 'Bütün dəyişikliklər uğurla tətbiq edildi',
      });
    } catch (error) {
      console.error('Failed to save general settings:', error);
      toast({
        title: '❌ Xəta',
        description: 'Parametrləri yadda saxlamaq mümkün olmadı',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChange = async (key: keyof GeneralSettings, checked: boolean) => {
    const updatedSettings = { ...generalSettings, [key]: checked };
    setGeneralSettings(updatedSettings);

    if (checked) {
      let msg = '';
      if (key === 'maintenanceMode') msg = 'Baxım Rejimi aktivləşdirildi';
      if (key === 'allowRegistration') msg = 'Öz-özünə qeydiyyat aktivləşdirildi';
      if (key === 'enableEmailNotifications') msg = 'Email bildirişləri aktivləşdirildi';
      toast({ title: '✅ Bildiriş', description: msg });
    }

    try {
      await superAdminService.updateGeneralSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to auto-save toggle:', error);
      setGeneralSettings(generalSettings); // revert
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
          <CardTitle>Ümumi Parametrlər</CardTitle>
          <CardDescription>
            Sistemin əsas parametrlərini konfiqurasiya edin
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
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
              onCheckedChange={(checked) => handleToggleChange('maintenanceMode', checked)}
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
              onCheckedChange={(checked) => handleToggleChange('allowRegistration', checked)}
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
              onCheckedChange={(checked) => handleToggleChange('enableEmailNotifications', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
