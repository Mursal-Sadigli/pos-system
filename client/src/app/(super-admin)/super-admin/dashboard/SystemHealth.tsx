'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Server, Database, Cpu, HardDrive, Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface SystemHealthProps {
  health: {
    status: 'operational' | 'degraded' | 'down';
    uptime: string;
    cpu: number;
    memory: number;
    disk: number;
    database: number;
  };
}

export function SystemHealth({ health }: SystemHealthProps) {
  const statusLabels = {
    operational: { label: 'Operational', color: 'bg-green-500', icon: CheckCircle },
    degraded: { label: 'Degraded', color: 'bg-yellow-500', icon: AlertCircle },
    down: { label: 'Down', color: 'bg-red-500', icon: AlertCircle },
  };

  const currentStatus = statusLabels[health.status] || statusLabels.operational;
  const StatusIcon = currentStatus.icon;

  const healthItems = [
    { label: 'CPU', value: health.cpu, icon: Cpu, color: health.cpu < 70 ? 'text-green-600' : 'text-red-600' },
    { label: 'Memory', value: health.memory, icon: HardDrive, color: health.memory < 80 ? 'text-green-600' : 'text-red-600' },
    { label: 'Disk', value: health.disk, icon: Database, color: health.disk < 80 ? 'text-green-600' : 'text-red-600' },
    { label: 'Database', value: health.database, icon: Server, color: health.database < 90 ? 'text-green-600' : 'text-red-600' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sistem Sağlamlığı
            </CardTitle>
            <CardDescription>Sistem resurslarının istifadəsi</CardDescription>
          </div>
          <Badge className={currentStatus.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {currentStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            İşlək vaxtı: <span className="font-medium text-foreground">{health.uptime}</span>
          </div>
          {healthItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </span>
                <span className={`font-medium ${item.color}`}>{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}