export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  store_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  must_change_password: boolean;
  invitation_token: string | null;
  invitation_expires_at: Date | null;
  invited_by: string | null;
  last_login: Date | null;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  permissions?: string[];
  store_id?: string;
  invited_by?: string;
  is_verified?: boolean;
  must_change_password?: boolean;
  isPasswordHashed?: boolean;
}
