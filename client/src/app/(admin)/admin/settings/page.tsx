'use client';

import { Store, CreditCard, Bell, Shield, Paintbrush } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Yadda saxlanıldı',
      description: 'Parametrlər uğurla yeniləndi',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parametrlər</h1>
        <p className="text-muted-foreground">Sistemin ümumi parametrlərini idarə edin</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2"><Store className="h-4 w-4" /> Ümumi</TabsTrigger>
          <TabsTrigger value="payment" className="gap-2"><CreditCard className="h-4 w-4" /> Ödəniş</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Bildirişlər</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Təhlükəsizlik</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Paintbrush className="h-4 w-4" /> Görünüş</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Mağaza Məlumatları</CardTitle>
              <CardDescription>Mağazanızın əsas məlumatlarını buraya daxil edin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Mağaza Adı</label>
                <Input defaultValue="Mənim Mağazam" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Əlaqə Nömrəsi</label>
                <Input defaultValue="+994 50 123 45 67" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ünvan</label>
                <Input defaultValue="Bakı şəhəri, Nizami küçəsi 12" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Valyuta</label>
                <Input defaultValue="AZN (₼)" disabled />
              </div>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Yadda Saxla</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Ödəniş Metodları</CardTitle>
              <CardDescription>Qəbul etdiyiniz ödəniş növlərini tənzimləyin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 border p-4 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">Nağd Ödəniş</h4>
                  <p className="text-sm text-muted-foreground">Kassada nağd ödəniş qəbulu</p>
                </div>
                <Button variant="outline">Deaktiv et</Button>
              </div>
              <div className="flex items-center gap-4 border p-4 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">Bank Kartı</h4>
                  <p className="text-sm text-muted-foreground">POS terminal vasitəsilə kartla ödəniş</p>
                </div>
                <Button variant="outline">Deaktiv et</Button>
              </div>
              <div className="flex items-center gap-4 border p-4 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">QR Ödəniş</h4>
                  <p className="text-sm text-muted-foreground">Mobil tətbiqlə QR kod ödənişi</p>
                </div>
                <Button variant="outline">Aktiv et</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildiriş Parametrləri</CardTitle>
              <CardDescription>Hansı hallarda bildiriş alacağınızı seçin.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tezliklə əlavə olunacaq...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Təhlükəsizlik</CardTitle>
              <CardDescription>Hesabınızın təhlükəsizliyini idarə edin.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tezliklə əlavə olunacaq...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Görünüş Parametrləri</CardTitle>
              <CardDescription>Sistemin görünüşünü fərdiləşdirin.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tezliklə əlavə olunacaq...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
