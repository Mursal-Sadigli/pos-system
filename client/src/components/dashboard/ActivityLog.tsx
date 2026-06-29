'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activities = [
  { time: '2 dəq əvvəl', text: 'Yeni sifariş yaradıldı: #ORD-005' },
  { time: '15 dəq əvvəl', text: 'Espresso məhsulunun stok dəyəri yeniləndi' },
  { time: '1 saat əvvəl', text: 'Yeni müştəri qeydiyyatdan keçdi' },
  { time: '3 saat əvvəl', text: 'Gündəlik hesabat yaradıldı' },
];

export function ActivityLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son aktivliklər</CardTitle>
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