'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Store, Shield, Clock } from 'lucide-react';

interface UserActivityProps {
  activities: Array<{
    id: string;
    action: string;
    user: string;
    type: 'store' | 'user' | 'system' | 'security';
    time: string;
  }>;
}

export function UserActivity({ activities }: UserActivityProps) {
  const typeIcons = {
    store: { icon: Store, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    user: { icon: User, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    system: { icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    security: { icon: Shield, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Aktivliklər</CardTitle>
        <CardDescription>Sistemdə son baş verən hadisələr</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const TypeIcon = typeIcons[activity.type]?.icon || Activity;
            const typeStyle = typeIcons[activity.type] || typeIcons.system;
            
            return (
              <div key={activity.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeStyle.bg}`}>
                  <TypeIcon className={`h-4 w-4 ${typeStyle.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}