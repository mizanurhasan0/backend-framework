import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthService } from '../services/auth.service';
import { TJwtPayload } from '../types/TUser';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
                permissions: string[];
            };
        }
    }
}

// Basic authentication middleware
export const authGuard = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No token provided'
        });
    }

    try {
        const decoded = AuthService.verifyToken(token) as TJwtPayload;
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions
        };
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid token'
        });
    }
};

// Permission-based middleware
export const requirePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Authentication required'
            });
        }

        if (!AuthService.hasPermission(req.user.permissions, permission)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions'
            });
        }

        next();
    };
};

// Multiple permissions middleware (all required)
export const requireAllPermissions = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Authentication required'
            });
        }

        if (!AuthService.hasAllPermissions(req.user.permissions, permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions'
            });
        }

        next();
    };
};

// Multiple permissions middleware (any required)
export const requireAnyPermission = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Authentication required'
            });
        }

        if (!AuthService.hasAnyPermission(req.user.permissions, permissions)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions'
            });
        }

        next();
    };
};

// Role-based middleware
export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Authentication required'
            });
        }

        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient role'
            });
        }

        next();
    };
};

// Multiple roles middleware (any required)
export const requireAnyRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient role'
            });
        }

        next();
    };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decoded = AuthService.verifyToken(token) as TJwtPayload;
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                permissions: decoded.permissions
            };
        } catch (err) {
            // Token is invalid, but we don't fail the request
        }
    }

    next();
};

// Email verification middleware
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Authentication required'
        });
    }

    // This would typically check against the user's email verification status
    // For now, we'll assume it's verified if the user exists
    // In a real implementation, you'd fetch the user and check isEmailVerified
    next();
};

// Rate limiting middleware (basic implementation)
export const rateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
    const attempts = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        const userAttempts = attempts.get(ip);

        if (!userAttempts || now > userAttempts.resetTime) {
            attempts.set(ip, { count: 1, resetTime: now + windowMs });
        } else if (userAttempts.count >= maxAttempts) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.'
            });
        } else {
            userAttempts.count++;
        }

        next();
    };
};
