'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { reportsApi } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SystemPerformancePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  
  // Historical data for live chart
  const [history, setHistory] = useState<any[]>([]);

  // Function to fetch server health metrics
  const fetchHealth = async (isBackground = false, showToast = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const res = await reportsApi.getSystemHealth();
      const data = res.data.data;
      setHealthData(data);
      
      // Update historical chart data
      setHistory(prev => {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const newRecord = { 
          time: timeStr, 
          cpu: data.performance.cpu, 
          memory: data.performance.memory,
          database: data.performance.database
        };
        const newHistory = [...prev, newRecord];
        if (newHistory.length > 15) { // Keep last 15 points
          newHistory.shift();
        }
        return newHistory;
      });

      if (showToast) {
        toast({
          title: '✅ Vəziyyət yeniləndi',
          description: 'Ən son server məlumatları yükləndi',
        });
      }
    } catch (error: any) {
      if (!isBackground) {
        toast({
          title: '❌ Xəta',
          description: error.response?.data?.message || 'Server vəziyyətini oxumaq mümkün olmadı',
          variant: 'destructive',
        });
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  // Initial load and setup polling
  useEffect(() => {
    fetchHealth(false, false);
    
    // Auto-poll every 5 seconds for "real-time" feel
    const interval = setInterval(() => {
      fetchHealth(true, false); // silent background fetch
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-red-600" />
            Sistem Performansı
          </h1>
          <p className="text-muted-foreground">
            Server resurslarının və xidmətlərin canlı monitorinqi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchHealth(false, true)} className="gap-2" disabled={isLoading}>
            <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Yenilə
          </Button>
        </div>
      </div>

      {!healthData && isLoading ? (
        <div className="flex justify-center items-center h-48">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : healthData ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <Cpu className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPU Yükü</p>
                  <h3 className="text-2xl font-bold">{healthData.performance.cpu}%</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RAM İstifadəsi</p>
                  <h3 className="text-2xl font-bold">{healthData.performance.memory}%</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktiv Bağlantı (DB)</p>
                  <h3 className="text-2xl font-bold">{healthData.performance.activeUsers}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sistem Uptime</p>
                  <h3 className="text-xl font-bold">{healthData.performance.uptime}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Server Statuses */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Xidmətlərin Vəziyyəti</CardTitle>
                <CardDescription>Bütün əsas serverlərin statusu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {healthData.servers.map((server: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium">{server.name}</span>
                      </div>
                      <Badge variant={server.status === 'online' ? 'success' : 'destructive'} className={server.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                        {server.status === 'online' ? 'Online' : 'Xəta'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uptime: {server.uptime}</span>
                      <span className={server.load > 80 ? 'text-red-500 font-bold' : ''}>
                        Yük: {server.load}%
                      </span>
                    </div>
                    <Progress value={server.load} className={`h-1.5 ${server.load > 80 ? 'bg-red-200' : ''}`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Live Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Canlı Yük Qrafiki</CardTitle>
                <CardDescription>Son saniyələr üzrə CPU və RAM yükünün izlənilməsi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cpu" name="CPU (%)" stroke="#DC2626" strokeWidth={2} isAnimationActive={false} />
                      <Line type="monotone" dataKey="memory" name="RAM (%)" stroke="#2563EB" strokeWidth={2} isAnimationActive={false} />
                      <Line type="monotone" dataKey="database" name="DB Yükü" stroke="#8B5CF6" strokeWidth={2} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}