import { useEffect, useRef } from 'react';

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const buffer = useRef('');
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Barkod oxuyucu çox sürətli yazır (adətən 10-30ms).
      // Əgər 100ms-dən çox vaxt keçibsə, buffer-i sıfırla ki, əllə yavaş yazanları nəzərə almasın.
      const currentTime = Date.now();
      if (currentTime - lastKeyTime.current > 100) {
        buffer.current = '';
      }
      lastKeyTime.current = currentTime;

      // Enter düyməsidirsə və buffer-də nəsə varsa (barkodun sonu)
      if (e.key === 'Enter' && buffer.current.length > 2) {
        onScan(buffer.current);
        buffer.current = '';
        e.preventDefault(); // Səhifənin yenilənməsinin qarşısını al
        return;
      }

      // Əgər normal hərf/rəqəmdirsə buffer-ə əlavə et (uzunluğu 1-dir)
      if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan]);
}
