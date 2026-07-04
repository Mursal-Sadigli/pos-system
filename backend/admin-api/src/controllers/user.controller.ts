import { Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { successResponse, errorResponse } from '../utils/response';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      return successResponse(res, users, 'Users fetched');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
