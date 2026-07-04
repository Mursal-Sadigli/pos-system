'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const tabs = [
  { value: 'help', label: '🏠 Yardım Mərkəzi' },
  { value: 'system', label: 'ℹ️ Sistem Məlumatı' },
];

const faqItems = [
  {
    question: 'Sifarişi necə izləyə bilərəm?',
    answer: 'Sifarişlər bölməsində hər bir sifarişin statusunu izləyə bilərsiniz.',
  },
  {
    question: 'Məhsul stokunu necə yeniləyim?',
    answer: 'Məhsullar bölümündə istədiyiniz məhsulu seçərək stok miqdarını yeniləyin.',
  },
  {
    question: 'Hesabatları necə ixrac edim?',
    answer: 'Hesabatlar bölməsində PDF və Excel formatlarında ixrac düymələrindən istifadə edin.',
  },
];

const categories = ['Sifarişlər', 'Məhsullar', 'Müştərilər', 'Ödəniş', 'Parametrlər'];

const systemInfo = {
  version: 'v2.1.4',
  status: 'Əla',
  uptime: '99.98%',
  lastUpdate: '30.06.2026',
  releaseNotes: [
    'Yenilənmiş POS interfeysi',
    'Yeni hesabat filtrləri əlavə edildi',
    'Təhlükəsizlik və sürət optimizasiyası',
  ],
};

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('help');
  const [query, setQuery] = useState('');

  const filteredFaq = useMemo(() => {
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Yardım</h1>
            <p className="text-sm text-muted-foreground">
              Suallarınızı cavablandırmaq və sistem məlumatlarını göstermek üçün.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? 'secondary' : 'outline'}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'help' ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Tez-tez verilən suallar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
                <div>
                  <Label htmlFor="help-search">Axtarış</Label>
                  <Input
                    id="help-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Suallarınızı buraya yazın..."
                  />
                </div>
                <div>
                  <Label>Kategoriyalar</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredFaq.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-lg border bg-muted p-4"
                  >
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}

                {filteredFaq.length === 0 && (
                  <div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
                    Axtarışınıza uyğun nəticə tapılmadı.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Axtarış və təkliflər</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Buradan sual axtara və kateqoriyalara hızlı keçid edə bilərsiniz.
              </p>
              <div className="space-y-3">
                <Button className="w-full">Yeni sual əlavə et</Button>
                <Button variant="outline" className="w-full">
                  Dəstək xidməti ilə əlaqə
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Məlumatı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Versiya</p>
                  <p className="mt-2 text-lg font-semibold">{systemInfo.version}</p>
                </div>
                <div className="rounded-lg border bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Sistem statusu</p>
                    <Badge variant={systemInfo.status === 'Əla' ? 'success' : 'warning'}>
                      {systemInfo.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Uptime: {systemInfo.uptime}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Yeniliklər</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    {systemInfo.releaseNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Axtarış və texniki dəstək</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sistem yenilikləri və statusu ilə bağlı ən son məlumatlar.
              </p>
              <Button className="w-full">Dəstək komandası ilə əlaqə</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}