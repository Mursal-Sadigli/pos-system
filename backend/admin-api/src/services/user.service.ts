import { UserModel } from '../models/User.model';
import { query } from '../config/database';

export class UserService {
  static async getUsers(options: {
    role?: string;
    storeId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    return UserModel.findAll({
      role: options.role,
      store_id: options.storeId,
      is_active: options.isActive,
      page: options.page,
      limit: options.limit,
    });
  }

  static async getUserById(id: string) {
    return UserModel.findById(id);
  }

  static async updateUser(id: string, data: Record<string, any>) {
    if (data.password) {
      const res = await query('SELECT password_complexity FROM public.security_settings LIMIT 1');
      const complexityEnabled = res.rows[0]?.password_complexity;
      if (complexityEnabled) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(data.password)) {
          throw new Error('Şifrə ən azı 8 simvol olmalı, tərkibində ən azı bir böyük hərf, bir kiçik hərf, bir rəqəm və bir xüsusi simvol (!@#$%^&*) olmalıdır.');
        }
      } else if (data.password.length < 6) {
        throw new Error('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      }
    }
    return UserModel.update(id, data);
  }

  static async deleteUser(id: string) {
    return UserModel.delete(id);
  }
}
