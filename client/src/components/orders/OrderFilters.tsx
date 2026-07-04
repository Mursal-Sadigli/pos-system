'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OrderFiltersProps {
  dateFrom: string;
  dateTo: string;
  customer: string;
  cashier: string;
  paymentMethod: string;
  customers: string[];
  cashiers: string[];
  paymentMethods: string[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onCashierChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onClear: () => void;
}

export function OrderFilters({
  dateFrom,
  dateTo,
  customer,
  cashier,
  paymentMethod,
  customers,
  cashiers,
  paymentMethods,
  onDateFromChange,
  onDateToChange,
  onCustomerChange,
  onCashierChange,
  onPaymentMethodChange,
  onClear,
}: OrderFiltersProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <div>
          <label className="mb-2 block text-sm font-medium">Tarixdən</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Tarixə</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Müştəri</label>
          <select
            className="h-10 w-full rounded-lg border px-3 text-sm"
            value={customer}
            onChange={(e) => onCustomerChange(e.target.value)}
          >
            {customers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Kassa</label>
          <select
            className="h-10 w-full rounded-lg border px-3 text-sm"
            value={cashier}
            onChange={(e) => onCashierChange(e.target.value)}
          >
            {cashiers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-end">
          <Button variant="outline" onClick={onClear}>
            Təmizlə
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div>
          <label className="mb-2 block text-sm font-medium">Ödəniş üsulu</label>
          <select
            className="h-10 w-full rounded-lg border px-3 text-sm"
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}