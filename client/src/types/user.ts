export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'viewer';
  storeId: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}