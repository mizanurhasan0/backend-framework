import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`,
    });
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export const zodValidation = (schema: ZodSchema<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (err: any) {
            res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: err.errors || err.message,
            });
        }
    };
};