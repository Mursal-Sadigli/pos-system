'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
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
  onImport: () => void;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateImport = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onImport();
      onOpenChange(false);
    }, 1500); // simulate upload delay
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Məhsulları İdxal Et</DialogTitle>
          <DialogDescription>
            Excel və ya CSV faylını seçərək məhsulları kütləvi şəkildə bazaya əlavə edə bilərsiniz.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 dark:bg-gray-900/50">
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium">Faylı bura sürükləyin və ya klikləyin</p>
          <p className="text-xs text-muted-foreground mt-1">Yalnız .csv və .xlsx dəstəklənir</p>
          
          <Button 
            className="mt-6" 
            variant="secondary"
            onClick={handleSimulateImport}
            disabled={isUploading}
          >
            {isUploading ? 'Yüklənir...' : 'Fayl Seç (Demo)'}
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
