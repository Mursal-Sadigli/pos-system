'use client';

import Link from 'next/link';
import { ShoppingCart, PackagePlus, UserPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  { label: 'Yeni satış', href: '/pos', icon: ShoppingCart },
  { label: 'Yeni məhsul', href: '/products', icon: PackagePlus },
  { label: 'Yeni müştəri', href: '/customers', icon: UserPlus },
  { label: 'Hesabat çap', href: '/reports', icon: FileText },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button key={action.label} variant="outline" asChild>
          <Link href={action.href}>
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}