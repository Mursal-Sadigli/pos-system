'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Sparkles } from 'lucide-react';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerLoyalty } from '@/components/customers/CustomerLoyalty';
import { CustomerDetails } from '@/components/customers/CustomerDetails';
import { Input } from '@/components/ui/input';

const customers = [
  {
    id: '1',
    name: 'Elçin Məmmədov',
    phone: '+994 50 123 45 67',
    email: 'elchin@email.com',
    points: 250,
    lastPurchase: '15.01.2024',
    segment: 'Premium',
    orders: [
      { id: 'ORD-001', date: '15.01.2024', total: 42.5 },
      { id: 'ORD-007', date: '09.01.2024', total: 29.0 },
    ],
    coupons: ['LOYALTY10', 'BDAY15'],
  },
  {
    id: '2',
    name: 'Aynur Quliyeva',
    phone: '+994 55 987 65 43',
    email: 'aynur@email.com',
    points: 180,
    lastPurchase: '18.01.2024',
    segment: 'Gold',
    orders: [
      { id: 'ORD-005', date: '18.01.2024', total: 32.0 },
      { id: 'ORD-002', date: '12.01.2024', total: 15.5 },
    ],
    coupons: ['WELCOME5'],
  },
  {
    id: '3',
    name: 'Rəşad Hacıyev',
    phone: '+994 51 555 55 55',
    email: 'rashad@email.com',
    points: 320,
    lastPurchase: '20.01.2024',
    segment: 'Diamond',
    orders: [
      { id: 'ORD-010', date: '20.01.2024', total: 68.0 },
      { id: 'ORD-008', date: '17.01.2024', total: 49.5 },
    ],
    coupons: ['SMART20', 'LOYALTY5'],
  },
];

export default function CustomersPage() {
  const [query, setQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[number] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const openDetails = (customer: typeof customers[number]) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müştərilər</h1>
            <p className="text-sm text-muted-foreground">
              Müştəri bazanızı və loyalty kartlarını buradan izləyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary">
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Müştəri
            </Button>
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Loyalty Kartlar
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <CustomerLoyalty
            title="Ümumi xallar"
            value="750"
            description="Bütün istifadəçilərin xalları"
          />
          <CustomerLoyalty
            title="Aktiv istifadələr"
            value="128"
            description="Bu ay aktiv olan müştərilər"
          />
          <CustomerLoyalty
            title="Endirim kuponları"
            value="24"
            description="Müştərilərə verilmiş kuponlar"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Customer Grid</h2>
            <p className="text-sm text-muted-foreground">
              Müştəriləri axtar və profilinə daxil ol.
            </p>
          </div>

          <div className="flex w-full max-w-lg items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ad üzrə axtarış..."
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={() => openDetails(customer)}
            />
          ))}
        </div>
      </div>

      <CustomerDetails
        customer={selectedCustomer}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}