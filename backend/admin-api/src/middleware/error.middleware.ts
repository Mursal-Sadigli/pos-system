import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { SystemLogService } from '../services/system-log.service';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  const status = err.status || 500;
  
  // Sadece 500 xətalarını (server xətalarını) system log-a yazırıq
  if (status === 500) {
    SystemLogService.logEvent(
      'error',
      'api',
      err.message || 'Internal server error',
      {
        path: req.path,
        method: req.method,
        stack: err.stack,
        body: req.body,
        query: req.query
      }
    ).catch(e => console.error('Failed to write to system log in error middleware', e));
  }

  return errorResponse(res, err.message || 'Internal server error', status);
};
