'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Printer, Eye, Calendar } from 'lucide-react';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderTable } from '@/components/orders/OrderTable';

const orderTabs = [
  { key: 'all', label: '📋 Bütün' },
  { key: 'pending', label: '⏳ Gözləmədə' },
  { key: 'preparing', label: '🔄 Hazırlanır' },
  { key: 'completed', label: '✅ Tamamlandı' },
  { key: 'cancelled', label: '❌ Ləğv' },
];

const orders = [
  {
    id: '001',
    customer: 'Elçin',
    amount: 45,
    status: 'completed',
    payment: 'Kart',
    time: '14:30',
    date: '2026-06-30',
    cashier: 'Kassa 1',
    items: [
      { name: 'Espresso', qty: 2, price: 5 },
      { name: 'Kroassan', qty: 1, price: 3 },
    ],
  },
  {
    id: '002',
    customer: 'Aynur',
    amount: 30,
    status: 'pending',
    payment: 'Nağd',
    time: '15:10',
    date: '2026-06-30',
    cashier: 'Kassa 2',
    items: [
      { name: 'Latte', qty: 1, price: 7 },
      { name: 'Sandviç', qty: 1, price: 8 },
    ],
  },
  {
    id: '003',
    customer: 'Rəşad',
    amount: 72,
    status: 'preparing',
    payment: 'Kart',
    time: '16:05',
    date: '2026-06-29',
    cashier: 'Kassa 1',
    items: [
      { name: 'Cappuccino', qty: 2, price: 6 },
      { name: 'Sushi', qty: 1, price: 12 },
    ],
  },
];

const customers = ['Hamısı', 'Elçin', 'Aynur', 'Rəşad'];
const cashiers = ['Hamısı', 'Kassa 1', 'Kassa 2'];
const paymentMethods = ['Hamısı', 'Nağd', 'Kart'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customer, setCustomer] = useState('Hamısı');
  const [cashier, setCashier] = useState('Hamısı');
  const [paymentMethod, setPaymentMethod] = useState('Hamısı');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab =
        activeTab === 'all' || order.status === activeTab;
      const matchesDate =
        (!dateFrom || order.date >= dateFrom) &&
        (!dateTo || order.date <= dateTo);
      const matchesCustomer =
        customer === 'Hamısı' || order.customer === customer;
      const matchesCashier =
        cashier === 'Hamısı' || order.cashier === cashier;
      const matchesPayment =
        paymentMethod === 'Hamısı' || order.payment === paymentMethod;

      return matchesTab && matchesDate && matchesCustomer && matchesCashier && matchesPayment;
    });
  }, [activeTab, dateFrom, dateTo, customer, cashier, paymentMethod]);

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCustomer('Hamısı');
    setCashier('Hamısı');
    setPaymentMethod('Hamısı');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sifarişlər</h1>
            <p className="text-sm text-muted-foreground">
              Bütün sifarişləri buradan izləyə bilərsiniz.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {orderTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'secondary' : 'outline'}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <OrderFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        customer={customer}
        cashier={cashier}
        paymentMethod={paymentMethod}
        customers={customers}
        cashiers={cashiers}
        paymentMethods={paymentMethods}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onCustomerChange={setCustomer}
        onCashierChange={setCashier}
        onPaymentMethodChange={setPaymentMethod}
        onClear={handleClearFilters}
      />

      <OrderTable
        orders={filteredOrders}
      />
    </div>
  );
}