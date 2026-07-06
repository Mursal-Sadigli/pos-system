import { UserModel } from '../models/User.model';

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
    return UserModel.update(id, data);
  }

  static async deleteUser(id: string) {
    return UserModel.delete(id);
  }
}
