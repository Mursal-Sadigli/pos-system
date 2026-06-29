'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from 'recharts';

const data = [
  { name: 'B', sales: 1200, target: 1500 },
  { name: 'Ç', sales: 1800, target: 1700 },
  { name: 'Ç', sales: 1500, target: 1600 },
  { name: 'C', sales: 2100, target: 1900 },
  { name: 'C', sales: 2400, target: 2200 },
  { name: 'Ş', sales: 2800, target: 2500 },
  { name: 'B', sales: 1900, target: 2100 },
];

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Satış qrafiki</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Line
                type="monotone"
                dataKey="target"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}