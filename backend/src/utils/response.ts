import {Response} from 'express';

// Success response
export const successResponse=<T>(res: Response, data: T, message: string='Success', statusCode: number=200) => {
    return res.status(statusCode).json({
        success: true, message, data, timestamp: new Date().toISOString(),
    });
};

// Error response
export const errorResponse=(res: Response, message: string, statusCode: number=500, errors?: any) => {
    return res.status(statusCode).json({
        success: false, message, errors, timestamp: new Date().toISOString(),
    });
};

// Pagination response
export const paginatedResponse=<T>(res: Response, data: T[], total: number, page: number, limit: number, message: string='Success') => {
    return res.status(200).json({success: true, message, data, pagination: {page, limit, total, totalPages: Math.ceil(total/limit), 
    }, timestamp: new Date().toISOString(),
});
};