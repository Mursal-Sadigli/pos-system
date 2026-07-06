'use client';

import { useState, useEffect } from 'react';
import { storeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const tabs = [
  { value: 'general', label: '🏠 Ümumi' },
  { value: 'profile', label: '👤 Profil' },
  { value: 'users', label: '👥 İstifadəçilər' },
  { value: 'store', label: '🏪 Mağaza' },
  { value: 'payment', label: '💳 Ödəniş' },
  { value: 'notifications', label: '🔔 Bildirişlər' },
  { value: 'reports', label: '📊 Hesabatlar' },
  { value: 'security', label: '🔒 Təhlükəsizlik' },
];

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
    work_days: [] as string[]
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
          work_days: store.work_days ? (typeof store.work_days === 'string' ? JSON.parse(store.work_days) : store.work_days) : ['Bazar ertəsi - Cümə']
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Şəxsi məlumatlar</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="first-name">Ad</Label>
                    <Input id="first-name" placeholder="Ad" />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Soyad</Label>
                    <Input id="last-name" placeholder="Soyad" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@domain.az" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" placeholder="+994 50 123 45 67" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Şifrə dəyiş</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="current-password">Cari şifrə</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="new-password">Yeni şifrə</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Şifrə təkrarı</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profil şəkli</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">Şəkil yüklə və ya dəyiş</p>
                  </div>
                  <Button>Yüklə</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <CardTitle>İstifadəçi siyahısı</CardTitle>
                  <Button>Yeni istifadəçi əlavə et</Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Ad</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Rol</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3">Elçin Məmmədov</td>
                        <td className="px-4 py-3">elchin@domain.az</td>
                        <td className="px-4 py-3">Admin</td>
                        <td className="px-4 py-3">
                          <Badge variant="success">Aktiv</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Aynur Quliyeva</td>
                        <td className="px-4 py-3">aynur@domain.az</td>
                        <td className="px-4 py-3">Menedjer</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">Yeni</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rollar və icazələr</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Admin</Label>
                    <p className="text-sm text-muted-foreground">Tam idarəetmə icazəsi.</p>
                  </div>
                  <div>
                    <Label>Menedjer</Label>
                    <p className="text-sm text-muted-foreground">Satış və stok izləmə icazəsi.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mağaza parametrləri</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="currency">Valyuta</Label>
                    <select
                      id="currency"
                      className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                      <option>AZN</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="tax-rate">Vergi faizi</Label>
                    <Input id="tax-rate" placeholder="18%" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valyuta ayarları</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="decimal-separator">Ondalıq ayırıcısı</Label>
                    <Input id="decimal-separator" placeholder="." />
                  </div>
                  <div>
                    <Label htmlFor="thousands-separator">Minlik ayırıcısı</Label>
                    <Input id="thousands-separator" placeholder="," />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stripe ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stripe-key">API açarı</Label>
                    <Input id="stripe-key" placeholder="sk_test_..." />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Aktivasiya</p>
                      <p className="text-sm text-muted-foreground">Stripe ödəniş sistemi aktiv olsun.</p>
                    </div>
                    <Switch id="stripe-status" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ödəniş üsulları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Nağd</p>
                      <p className="text-sm text-muted-foreground">Kassa üçün nağd ödəniş.</p>
                    </div>
                    <Switch id="cash-payment" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Kart</p>
                      <p className="text-sm text-muted-foreground">POS terminalı ilə ödəniş.</p>
                    </div>
                    <Switch id="card-payment" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email bildirişləri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Yeni sifariş</span>
                    <Switch id="email-order" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Gündəlik hesabat</span>
                    <Switch id="email-report" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SMS bildirişləri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Yeniliklər</span>
                    <Switch id="sms-news" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Ödəniş xatırlatması</span>
                    <Switch id="sms-reminder" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Push bildirişləri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Yeni mesaj</span>
                    <Switch id="push-message" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Hesab fəaliyyəti</span>
                    <Switch id="push-activity" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hesabat ayarları</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="report-frequency">Hesabat tezliyi</Label>
                    <select
                      id="report-frequency"
                      className="mt-2 block w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
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
                    <Switch id="auto-daily-report" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <span>Həftəlik inventar</span>
                    <Switch id="auto-weekly-inventory" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>2FA ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">İki faktorlu təsdiq</p>
                      <p className="text-sm text-muted-foreground">Hesab təhlükəsizliyini artırın.</p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sessiya idarəsi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">Aktiv sessiyalar</p>
                    <p className="text-sm text-muted-foreground">Brauzer / cihazlara nəzarət.</p>
                  </div>
                  <Button variant="outline">Bütün sessiyaları bağla</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit log</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Təhlükəsizlik və əməliyyat qeydiyyatını izləyin.
                  </p>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm">Son fəaliyyət: 30.06.2026 12:45</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}