import axios from 'axios';
import type { CreateProductRequest, Product } from '@/types/product';
import type { CreateOrderRequest, Order } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { LoginRequest, LoginResponse } from '@/types/user';

const baseURL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API ?? '/api';

const isBrowser = typeof globalThis !== 'undefined' && 'window' in globalThis;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== REQUEST INTERCEPTOR ====================
// Hər request-ə token əlavə et
api.interceptors.request.use(
  (config) => {
    const token = isBrowser ? (globalThis as typeof globalThis & { window?: { localStorage?: { getItem: (key: string) => string | null } } }).window?.localStorage?.getItem('token') ?? null : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 halında localStorage-i təmizlə, amma redirect etmə
    // Redirect authStore.checkAuth tərəfindən idarə olunur
    if (error.response?.status === 401 && isBrowser) {
      const win = (globalThis as typeof globalThis & { window?: { localStorage?: { removeItem: (key: string) => void } } }).window;
      win?.localStorage?.removeItem('token');
      win?.localStorage?.removeItem('refreshToken');
      win?.localStorage?.removeItem('user');
      // location.assign('/login') - BU SƏTRI SİLDİK
      // Çünki tam page reload olur və state itirilir
    }
    return Promise.reject(error?.response?.data ?? error);
  }
);

// ==================== AUTH API ====================
export const authApi = {
  login: (payload: LoginRequest) => api.post<LoginResponse>('/auth/login', payload),
  register: (payload: any) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  acceptInvitation: (token: string) => api.post('/auth/accept-invite', { token }),
  inviteUser: (payload: { name: string; email: string; role: string; storeId?: string }) =>
    api.post('/auth/invite', payload),
};

// ==================== USER API ====================
export const userApi = {
  getUsers: (params?: { role?: string; storeId?: string; isActive?: boolean; page?: number; limit?: number }) =>
    api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, payload: any) => api.put(`/users/${id}`, payload),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// ==================== PRODUCT API ====================
export const productApi = {
  getProducts: () => api.get<Product[]>('/products'),
  getProduct: (id: string) => api.get<Product>(`/products/${id}`),
  createProduct: (payload: CreateProductRequest) => api.post<Product>('/products', payload),
  updateProduct: (id: string, payload: Partial<CreateProductRequest>) =>
    api.put<Product>(`/products/${id}`, payload),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

// ==================== ORDER API ====================
export const orderApi = {
  getOrders: () => api.get<Order[]>('/orders'),
  getOrder: (id: string) => api.get<Order>(`/orders/${id}`),
  createOrder: (payload: CreateOrderRequest) => api.post<Order>('/orders', payload),
};

// ==================== CUSTOMER API ====================
export const customerApi = {
  getCustomers: () => api.get<Customer[]>('/customers'),
  getCustomer: (id: string) => api.get<Customer>(`/customers/${id}`),
};

export default api;