'use client';

import { format } from 'date-fns';
import { Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderData: {
    items: ReceiptItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: 'cash' | 'card';
    date: Date;
  } | null;
}

export function ReceiptModal({ open, onOpenChange, orderData }: ReceiptModalProps) {
  if (!orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 flex flex-col items-center justify-center border-b">
          <div className="bg-green-500 rounded-full p-2 mb-3">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Ödəniş Uğurlu!</h2>
        </div>

        <ScrollArea className="max-h-[50vh]">
          {/* Printable Receipt Area */}
          <div className="p-6 bg-white dark:bg-gray-950 text-black dark:text-gray-300 font-mono text-sm print:text-black" id="receipt-content">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold">POS SYSTEM</h3>
              <p>123 Ticarət küçəsi, Bakı</p>
              <p>Tel: +994 50 123 45 67</p>
              <p className="mt-2">VÖEN: 1234567891</p>
            </div>

            <div className="flex justify-between mb-4 border-b border-dashed border-gray-300 pb-2">
              <div>
                <p>Tarix: {format(orderData.date, 'dd.MM.yyyy')}</p>
                <p>Saat: {format(orderData.date, 'HH:mm')}</p>
              </div>
              <div className="text-right">
                <p>Çek №: {Math.floor(Math.random() * 100000).toString().padStart(6, '0')}</p>
                <p>Kassir: Admin</p>
              </div>
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-dashed border-gray-300">
                  <th className="text-left py-1 font-semibold">Adı</th>
                  <th className="text-center py-1 font-semibold">Say</th>
                  <th className="text-right py-1 font-semibold">Məbləğ</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1">{item.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">₼{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 border-t border-dashed border-gray-300 pt-2 mb-4">
              <div className="flex justify-between">
                <span>Alt cəmi:</span>
                <span>₼{orderData.subtotal.toFixed(2)}</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between">
                  <span>Endirim:</span>
                  <span>-₼{orderData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ƏDV (10%):</span>
                <span>₼{orderData.tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-bold border-t border-dashed border-gray-300 pt-2 mb-6">
              <span>YEKUN:</span>
              <span>₼{orderData.total.toFixed(2)}</span>
            </div>

            <div className="text-center mb-6">
              <p>Ödəniş növü: {orderData.paymentMethod === 'cash' ? 'NAĞD' : 'KART'}</p>
            </div>

            <div className="text-center">
              <p className="font-bold">TƏŞƏKKÜRLƏR!</p>
              <div className="mt-4 flex justify-center">
                {/* Mock Barcode using simple div borders */}
                <div className="flex items-center h-12 w-48 bg-white border border-gray-200">
                  <div className="w-full h-full flex justify-between px-2">
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className={`h-full bg-black ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-gray-50 dark:bg-gray-900 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Bağla
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Çeki Çap Et
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
