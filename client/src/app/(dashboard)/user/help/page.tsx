'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';

const tabs = [
  { value: 'help', label: '🏠 Yardım Mərkəzi' },
  { value: 'tickets', label: '🎫 Mənim Müraciətlərim' },
  { value: 'system', label: 'ℹ️ Sistem Məlumatı' },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('help');
  const [query, setQuery] = useState('');
  
  // Data states
  const [faqs, setFaqs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New ticket state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'help') {
        const res = await userApi.getFaqs();
        setFaqs(res.data?.data || []);
      } else if (activeTab === 'tickets') {
        const res = await userApi.getTickets();
        setTickets(res.data?.data || []);
      } else if (activeTab === 'system') {
        const res = await userApi.getSystemInfo();
        setSystemInfo(res.data?.data || null);
      }
    } catch (error) {
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error('Mövzu və mesaj mütləqdir');
      return;
    }
    
    try {
      setSubmittingTicket(true);
      await userApi.createTicket(ticketForm);
      toast.success('Müraciətiniz uğurla göndərildi!');
      setIsTicketModalOpen(false);
      setTicketForm({ subject: '', message: '' });
      fetchData(); // refresh tickets
    } catch (error) {
      toast.error('Müraciət göndərilərkən xəta baş verdi');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const filteredFaq = useMemo(() => {
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, faqs]);

  const categories = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Yardım</h1>
            <p className="text-sm text-muted-foreground">
              Sistemlə bağlı suallarınıza cavab tapın və ya texniki dəstək istəyin.
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

      {activeTab === 'help' && (
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
                  <Label>Kateqoriyalar</Label>
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
                {loading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
                {!loading && filteredFaq.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-muted p-4"
                  >
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}

                {!loading && filteredFaq.length === 0 && (
                  <div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
                    Axtarışınıza uyğun nəticə tapılmadı.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dəstək</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sualınızın cavabını tapa bilmədiniz? Texniki dəstək komandamıza müraciət edin.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setActiveTab('tickets');
                    setIsTicketModalOpen(true);
                  }}
                >
                  Yeni Müraciət Yarat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tickets' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Mənim Müraciətlərim</CardTitle>
            <Button onClick={() => setIsTicketModalOpen(true)}>Yeni Müraciət</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && <p className="text-sm text-muted-foreground">Yüklənir...</p>}
              {!loading && tickets.length === 0 && (
                <div className="rounded-lg border bg-muted p-8 text-center text-sm text-muted-foreground">
                  Hələ heç bir dəstək müraciətiniz yoxdur.
                </div>
              )}
              {!loading && tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <Badge variant={ticket.status === 'open' ? 'warning' : 'success'}>
                        {ticket.status === 'open' ? 'Açıq' : 'Həll Olundu'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {ticket.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {ticket.created_at}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'system' && systemInfo && (
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
                    Uptime (Kəsintisiz işləmə): {systemInfo.uptime}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Ən son yenilənmə</p>
                  <p className="mt-1 text-sm">{systemInfo.lastUpdate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Yeniliklər (Release Notes)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                {systemInfo.releaseNotes?.map((note: string, idx: number) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Dəstək Müraciəti (Ticket)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mövzu</Label>
              <Input 
                placeholder="Problemin qısa xülasəsi (məs: Printer qoşulmur)" 
                value={ticketForm.subject}
                onChange={e => setTicketForm({...ticketForm, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Mesajınız</Label>
              <Textarea 
                placeholder="Probleminizi ətraflı şəkildə izah edin..." 
                className="min-h-[100px]"
                value={ticketForm.message}
                onChange={e => setTicketForm({...ticketForm, message: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTicketModalOpen(false)}>Ləğv et</Button>
            <Button onClick={handleCreateTicket} disabled={submittingTicket}>
              {submittingTicket ? 'Göndərilir...' : 'Göndər'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}