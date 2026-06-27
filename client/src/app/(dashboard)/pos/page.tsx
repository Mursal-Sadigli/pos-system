'use client';

import { useState } from 'react';
import { PosScreen } from '@/components/pos/PosScreen';

export default function POSPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <PosScreen />
    </div>
  );
}