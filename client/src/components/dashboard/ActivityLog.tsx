'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activities = [
  { time: '2 min ago', text: 'New order #ORD-005 created' },
  { time: '15 min ago', text: 'Product "Espresso" stock updated' },
  { time: '1 hour ago', text: 'Customer John Doe registered' },
  { time: '3 hours ago', text: 'Daily report generated' },
];

export function ActivityLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fəaliyyət jurnalı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.text} className="border-b pb-3 last:border-0">
              <p className="text-sm">{activity.text}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
