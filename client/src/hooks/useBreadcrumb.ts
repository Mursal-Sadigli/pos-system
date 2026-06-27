"use client";

import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    pos: 'POS',
    products: 'Məhsullar',
    categories: 'Kateqoriyalar',
    orders: 'Sifarişlər',
    customers: 'Müştərilər',
    reports: 'Hesabatlar',
    settings: 'Ayarlar',
};

export function useBreadcrumb(){
    const pathname=usePathname();
    const segments=pathname.split('/').filter(Boolean);

    if(segments.length===0){
        return [{label: 'Dashboard', href: '/dashboard'}];
    }

    return segments.map((segment, index) => {
        const href='/'+segments.slice(0, index+1).join('/');
        return{
            label: routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1),
            href,
        };
    });
}