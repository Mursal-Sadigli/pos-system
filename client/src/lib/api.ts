import axios from 'axios';
import type {CreateProductRequest, Product} from '@/types/product';
import type {CreateOrderRequest, Order} from '@/types/order';
import type {Customer} from '@/types/customer';
import type {LoginRequest, LoginResponse} from '@/types/user';

const baseURL=process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const api=axios.create({
    baseURL, headers: {'Content-Type': 'application/json'},
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error?.response?.data ?? error);
    }
);

export const authApi={
    login: (payload: LoginRequest) => api.post<LoginResponse>('/auth/login', payload),
};

export const productApi={
    getProducts: () => api.get<Product[]>('/products'),
    getProduct: (id: string) => api.get<Product>(`/products/${id}`),
    createProduct: (payload: CreateProductRequest) => api.post<Product>('/products', payload),
    updateProduct: (id: string, payload: Partial<CreateProductRequest>) => 
        api.put<Product>(`/products/${id}`, payload),
    deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

export const customerApi={
    getCustomers: () => api.get<Customer[]>('/customers'),
    getCustomer: (id: string) => api.get<Customer>(`/customers/${id}`),
};

export default api;