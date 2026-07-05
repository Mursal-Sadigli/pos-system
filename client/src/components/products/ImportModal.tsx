'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: any[]) => void;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      // Map parsed json to product format - making it case insensitive and checking multiple variations
      const products = json.map((row: any) => {
        const getVal = (keys: string[]) => {
          const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
          return key ? row[key] : undefined;
        };

        return {
          name: getVal(['ad', 'name', 'məhsul', 'məhsulun adı', 'ad/name']),
          sku: getVal(['sku', 'barkod', 'barcode', 'kod', 'code']),
          category: getVal(['kateqoriya', 'category', 'növlər']),
          price: Number(getVal(['qiymət', 'price', 'satış qiyməti', 'qiyməti']) || 0),
          stock: Number(getVal(['stok', 'stock', 'say', 'miqdar', 'qalıq']) || 0),
          min_stock: Number(getVal(['minimum stok', 'min stock', 'min_stok']) || 0),
          status: getVal(['status', 'hal']) || 'active',
        };
      }).filter(p => p.name && p.name.toString().trim() !== ''); // only keep rows that have a name

      if (products.length === 0) {
        alert('Fayldan heç bir məhsul oxuna bilmədi! Zəhmət olmasa faylın içində (Ad, Qiymət, Stok) sütunlarının düzgün yazıldığından əmin olun.');
        return;
      }

      onImport(products);
      onOpenChange(false);
    } catch (error) {
      console.error('Error parsing excel:', error);
      alert('Fayl oxunarkən xəta baş verdi. Zəhmət olmasa düzgün Excel faylı seçdiyinizə əmin olun.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Məhsulları İdxal Et</DialogTitle>
          <DialogDescription>
            Excel (.xlsx) faylını seçərək məhsulları kütləvi şəkildə bazaya əlavə edə bilərsiniz.
            Sütun adları Ad, SKU, Kateqoriya, Qiymət, Stok olmalıdır.
          </DialogDescription>
        </DialogHeader>
        
        <div 
          onClick={handleBoxClick}
          className={`mt-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 dark:bg-gray-900/50 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium">Faylı seçmək üçün klikləyin</p>
          <p className="text-xs text-muted-foreground mt-1">Yalnız .xlsx və .csv dəstəklənir</p>
          
          <Button 
            className="mt-6" 
            variant="secondary"
            disabled={isUploading}
            onClick={(e) => { e.stopPropagation(); handleBoxClick(); }}
          >
            {isUploading ? 'Yüklənir...' : 'Kompüterdən Seç'}
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Ləğv et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
