'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Database, Download, Trash2, Plus, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { backupApi } from '@/lib/api';

interface Backup {
  id: string;
  filename: string;
  size_bytes: string | number;
  status: string;
  created_at: string;
}

export default function BackupSettingsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      setIsLoading(true);
      const response = await backupApi.getBackups();
      setBackups(response.data.data || []);
    } catch (error) {
      console.error('Nüsxələr yüklənərkən xəta:', error);
      toast.error('Siyahı yüklənə bilmədi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);
      await backupApi.createBackup();
      toast.success('Məlumat bazası uğurla nüsxələndi!');
      fetchBackups();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Nüsxələmə zamanı xəta baş verdi.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!window.confirm('Bu nüsxəni silmək istədiyinizə əminsiniz?')) return;

    try {
      setIsDeleting(id);
      await backupApi.deleteBackup(id);
      toast.success('Nüsxə silindi.');
      setBackups((prev) => prev.filter((b) => b.id !== id));
    } catch (error: any) {
      toast.error('Nüsxə silinə bilmədi.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = (id: string) => {
    const url = backupApi.downloadBackupUrl(id);
    
    // To include authorization token, we might need to fetch it or just open in new tab if cookie based.
    // Since we use Bearer token in headers, direct window.open might fail if API requires Bearer header.
    // But Super Admin API for download can be hit directly if token is in cookie or we fetch as blob.
    // Let's try fetching as blob so we can pass headers.
    
    const token = window.localStorage.getItem('token');
    
    toast.loading('Yüklənir...', { id: 'download' });
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Yükləmə xətası');
      return response.blob();
    })
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const backup = backups.find(b => b.id === id);
      a.download = backup ? backup.filename : 'backup.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Yükləndi!', { id: 'download' });
    })
    .catch(error => {
      console.error(error);
      toast.error('Yükləmə uğursuz oldu.', { id: 'download' });
    });
  };

  const formatBytes = (bytes: number | string) => {
    const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (b === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nüsxələmə (Backup)</h2>
          <p className="text-muted-foreground">
            Sistemin ehtiyat nüsxəsini yaradın və ya mövcud nüsxələri idarə edin.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchBackups} disabled={isLoading || isCreating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Yenilə
          </Button>
          <Button onClick={handleCreateBackup} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Yeni Nüsxə Yarat
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5 text-primary" />
            Mövcud Nüsxələr
          </CardTitle>
          <CardDescription>
            Əvvəlcədən yaradılmış məlumat bazası nüsxələrinin siyahısı. Cədvəldəki məlumatlar JSON formatındadır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>Hələ heç bir nüsxə yaradılmayıb.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fayl Adı</TableHead>
                    <TableHead>Tarix</TableHead>
                    <TableHead>Ölçü</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.filename}</TableCell>
                      <TableCell>
                        {format(new Date(backup.created_at), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell>{formatBytes(backup.size_bytes)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {backup.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(backup.id)}
                          title="Yüklə"
                        >
                          <Download className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          disabled={isDeleting === backup.id}
                          title="Sil"
                        >
                          {isDeleting === backup.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
