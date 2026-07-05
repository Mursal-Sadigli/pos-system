'use client';

import { useState } from 'react';
import { Search, Filter, Clock, UserPlus, UserMinus, ShoppingCart, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock Log Data
const mockLogs = [
  { 
    id: '1', 
    action: 'ADD_PRODUCT', 
    user: 'Əli Məmmədov (Kassir)', 
    description: 'Yeni məhsul əlavə edildi: "iPhone 15 Pro Max"', 
    timestamp: '2024-05-20 14:30', 
    type: 'success' 
  },
  { 
    id: '2', 
    action: 'DELETE_ORDER', 
    user: 'Günel Həsənova (Menecer)', 
    description: 'Sifariş ləğv edildi: #ORD-2024-005', 
    timestamp: '2024-05-20 13:15', 
    type: 'destructive' 
  },
  { 
    id: '3', 
    action: 'EDIT_USER', 
    user: 'Rəşad Əliyev (Admin)', 
    description: 'İstifadəçi məlumatları yeniləndi: "Aygün Quliyeva"', 
    timestamp: '2024-05-20 11:45', 
    type: 'default' 
  },
  { 
    id: '4', 
    action: 'CREATE_ORDER', 
    user: 'Əli Məmmədov (Kassir)', 
    description: 'Yeni sifariş yaradıldı: #ORD-2024-006 (₼1,250.00)', 
    timestamp: '2024-05-20 10:20', 
    type: 'success' 
  },
  { 
    id: '5', 
    action: 'LOGIN', 
    user: 'Günel Həsənova (Menecer)', 
    description: 'Sistemə daxil oldu', 
    timestamp: '2024-05-20 09:00', 
    type: 'secondary' 
  },
];

const getActionIcon = (action: string) => {
  switch (action) {
    case 'ADD_PRODUCT': return <ShoppingCart className="h-4 w-4 text-green-500" />;
    case 'DELETE_ORDER': return <Trash2 className="h-4 w-4 text-red-500" />;
    case 'EDIT_USER': return <Edit className="h-4 w-4 text-blue-500" />;
    case 'CREATE_ORDER': return <ShoppingCart className="h-4 w-4 text-green-500" />;
    case 'LOGIN': return <UserPlus className="h-4 w-4 text-gray-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export default function LogsPage() {
  const [logs, setLogs] = useState(mockLogs);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Logları</h1>
          <p className="text-muted-foreground">Mağaza daxilində baş verən bütün əməliyyatların tarixçəsi</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İstifadəçi və ya əməliyyat axtar..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Əməliyyat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">İstifadəçi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Açıqlama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Heç bir log tapılmadı
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <Badge variant={log.type as any} className="text-xs">
                            {log.action}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm">{log.user}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{log.description}</td>
                      <td className="px-4 py-3 text-sm flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
