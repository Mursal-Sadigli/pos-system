import axios from 'axios';
import type { CreateProductRequest, Product } from '@/types/product';
import type { CreateOrderRequest, Order } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { LoginRequest, LoginResponse } from '@/types/user';

let baseURL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API ?? '/api';
let adminBaseURL = process.env.NEXT_PUBLIC_ADMIN_API ?? '/api/admin';

// Sistem yaddaşında ilişib qalmış ngrok-u bypass etmək üçün lokal təhlükəsizlik
if (typeof baseURL === 'string' && baseURL.includes('ngrok')) {
  baseURL = 'http://localhost:5002/api';
}
if (typeof adminBaseURL === 'string' && adminBaseURL.includes('ngrok')) {
  adminBaseURL = 'http://localhost:5001/api/admin';
}

console.log("Current API URLs:", { baseURL, adminBaseURL });

const isBrowser = typeof globalThis !== 'undefined' && 'window' in globalThis;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminApi = axios.create({
  baseURL: adminBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== REQUEST INTERCEPTOR ====================
// Hər request-ə token əlavə et
const requestInterceptor = (config: any) => {
  const token = isBrowser ? (globalThis as typeof globalThis & { window?: { localStorage?: { getItem: (key: string) => string | null } } }).window?.localStorage?.getItem('token') ?? null : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
adminApi.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

// ==================== RESPONSE INTERCEPTOR ====================
const responseErrorInterceptor = async (error: any) => {
  if (error.response?.status === 401 && isBrowser) {
    // Try to refresh token
    const refreshToken = window.localStorage?.getItem('refreshToken');
    if (refreshToken) {
      try {
        const res = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
        const newToken = res.data.token;
        if (newToken) {
          window.localStorage.setItem('token', newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        }
      } catch (refreshError) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } else {
      window.localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, responseErrorInterceptor);
adminApi.interceptors.response.use((response) => response, responseErrorInterceptor);

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
  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        const win = typeof window !== 'undefined' ? window : undefined;
        win?.localStorage?.removeItem('token');
        win?.localStorage?.removeItem('refreshToken');
        win?.localStorage?.removeItem('user');
      }
      throw error;
    }
  },
  getProfile: () => adminApi.get('/users/profile'),
  updateProfile: (payload: any) => adminApi.put('/users/profile', payload),
  updatePassword: (payload: any) => adminApi.put('/users/profile/password', payload),
};

// ==================== PRODUCT API ====================
export const productApi = {
  getProducts: () => api.get<Product[]>('/products'),
  getProduct: (id: string) => api.get<Product>(`/products/${id}`),
  createProduct: (payload: CreateProductRequest) => api.post<Product>('/products', payload),
  updateProduct: (id: string, payload: Partial<CreateProductRequest>) =>
    api.put<Product>(`/products/${id}`, payload),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  bulkImportProducts: (payload: { products: any[] }) => api.post<{message: string, count: number, products: Product[]}>('/products/bulk-import', payload),
};

// ==================== ORDER API ====================
export const orderApi = {
  getOrders: () => api.get<Order[]>('/orders'),
  getOrder: (id: string) => api.get<Order>(`/orders/${id}`),
  createOrder: (payload: CreateOrderRequest) => api.post<Order>('/orders', payload),
  updateOrderStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
};

// ==================== CUSTOMER API ====================
export const customerApi = {
  getCustomers: () => api.get<Customer[]>('/customers'),
  getCustomer: (id: string) => api.get<Customer>(`/customers/${id}`),
};

// ==================== REPORTS API ====================
export const reportsApi = {
  getSalesSummary: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/reports/summary', { params }),
  getTopProducts: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/reports/top-products', { params }),
};

// ==================== STORE API ====================
export const storeApi = {
  getMyStore: () => adminApi.get('/stores/my-store'),
  updateMyStore: (payload: any) => adminApi.put('/stores/my-store', payload),
};


export default api;