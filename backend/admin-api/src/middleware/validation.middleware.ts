import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { errorResponse } from '../utils/response';

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      return errorResponse(res, error.errors?.[0]?.message || 'Validation failed', 400, error.errors);
    }
  };
};
