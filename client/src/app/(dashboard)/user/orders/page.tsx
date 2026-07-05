'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Printer, Eye, Calendar } from 'lucide-react';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderTable } from '@/components/orders/OrderTable';
import { orderApi } from '@/lib/api';
import { format } from 'date-fns';

const orderTabs = [
  { key: 'all', label: '📋 Bütün' },
  { key: 'pending', label: '⏳ Gözləmədə' },
  { key: 'processing', label: '🔄 Hazırlanır' },
  { key: 'completed', label: '✅ Tamamlandı' },
  { key: 'cancelled', label: '❌ Ləğv' },
];

const customers = ['Hamısı'];
const cashiers = ['Hamısı'];
const paymentMethods = ['Hamısı', 'Nağd', 'Kart'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customer, setCustomer] = useState('Hamısı');
  const [cashier, setCashier] = useState('Hamısı');
  const [paymentMethod, setPaymentMethod] = useState('Hamısı');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab =
        activeTab === 'all' || order.status === activeTab;
      const orderDate = order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd') : '';
      const matchesDate =
        (!dateFrom || orderDate >= dateFrom) &&
        (!dateTo || orderDate <= dateTo);
      const matchesCustomer =
        customer === 'Hamısı' || order.customer_name === customer;
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

      {loading ? (
        <div className="flex justify-center p-8">Yüklənir...</div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onStatusChange={async (id, status) => {
            await orderApi.updateOrderStatus(id, status);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}