import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { errorResponse } from '../utils/response';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.method === 'GET' || req.method === 'DELETE' ? req.query : req.body;
      await schema.parseAsync({ body: payload });
      return next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        return errorResponse(
          res,
          'Validation failed',
          400,
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
      }
      return errorResponse(res, 'Validation failed', 400);
    }
  };
};
