import api from '@/lib/api';

export interface CreateAdminData {
  name: string;
  email: string;
  password?: string;
  storeId: string;
  permissions?: string[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string;
  storeName?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface GeneralSettings {
  systemName: string;
  defaultLanguage: string;
  defaultTimezone: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  enableEmailNotifications: boolean;
}

export const superAdminService = {
  // General Settings
  getGeneralSettings: () => {
    return api.get<GeneralSettings>('/super-admin/settings/general');
  },
  
  updateGeneralSettings: (data: Partial<GeneralSettings>) => {
    return api.put<GeneralSettings>('/super-admin/settings/general', data);
  },

  // Bütün adminləri gətir
  getAdmins: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    return api.get('/super-admin/admins', { params });
  },

  // Admin detallarını gətir
  getAdminById: (id: string) => {
    return api.get(`/super-admin/admins/${id}`);
  },

  // Yeni admin yarat
  createAdmin: (data: CreateAdminData) => {
    return api.post('/super-admin/admins', data);
  },

  // Admin yenilə
  updateAdmin: (id: string, data: Partial<CreateAdminData>) => {
    return api.put(`/super-admin/admins/${id}`, data);
  },

  // Admin sil
  deleteAdmin: (id: string) => {
    return api.delete(`/super-admin/admins/${id}`);
  },

  // Admin statusunu dəyiş
  updateAdminStatus: (id: string, status: string) => {
    return api.patch(`/super-admin/admins/${id}/status`, { status });
  },
};