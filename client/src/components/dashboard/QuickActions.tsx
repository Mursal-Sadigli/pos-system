'use client';

import Link from 'next/link';
import { ShoppingCart, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const actions = [
  { label: 'New Sale', href: '/pos', icon: ShoppingCart },
  { label: 'Add Product', href: '/products/new', icon: Package },
  { label: 'View Orders', href: '/orders', icon: FileText },
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
