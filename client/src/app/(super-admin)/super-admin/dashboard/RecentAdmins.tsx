'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCog, Eye, Mail, Store } from 'lucide-react';

interface RecentAdminsProps {
  admins: Array<{
    id: string;
    name: string;
    email: string;
    store: string;
    status: 'active' | 'inactive' | 'suspended';
    avatar: string;
  }>;
}

export function RecentAdmins({ admins }: RecentAdminsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const statusLabels = {
    active: 'Aktiv',
    inactive: 'Deaktiv',
    suspended: 'Dayandırılıb',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Son Adminlər</CardTitle>
            <CardDescription>Ən son əlavə olunan adminlər</CardDescription>
          </div>
          <Link href="/super-admin/admins">
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Bütün Adminlər
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-purple-100 text-purple-700">
                    {getInitials(admin.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{admin.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {admin.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {admin.store}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={admin.status === 'active' ? 'success' : admin.status === 'suspended' ? 'warning' : 'secondary'}>
                  {statusLabels[admin.status]}
                </Badge>
                <Link href={`/super-admin/admins/${admin.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <UserCog className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}