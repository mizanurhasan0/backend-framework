import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

const objectId = z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid ObjectId"
});

// User registration validation
export const registerSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .trim(),
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// User login validation
export const loginSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, 'Password is required')
});

// Google OAuth validation
export const googleAuthSchema = z.object({
    googleId: z.string().min(1, 'Google ID is required'),
    email: z.string().email('Invalid email format'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    avatar: z.string().url('Invalid avatar URL').optional()
});

// Password reset request validation
export const forgotPasswordSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
});

// Password reset confirmation validation
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// Email verification validation
export const emailVerificationSchema = z.object({
    token: z.string().min(1, 'Token is required')
});

// Resend verification email validation
export const resendVerificationSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
});

// Refresh token validation
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

// Change password validation
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be less than 100 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// User profile update validation
export const updateProfileSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .trim()
        .optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
    phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .optional()
});

// User update validation (admin only)
export const updateUserSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .trim()
        .optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
    phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .optional(),
    role: objectId.optional(),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
});

// Role creation validation
export const createRoleSchema = z.object({
    name: z.string()
        .min(2, 'Role name must be at least 2 characters')
        .max(50, 'Role name must be less than 50 characters')
        .toLowerCase()
        .trim(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(200, 'Description must be less than 200 characters')
        .trim(),
    permissions: z.array(z.string()).min(1, 'At least one permission is required'),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false)
});

// Role update validation
export const updateRoleSchema = z.object({
    name: z.string()
        .min(2, 'Role name must be at least 2 characters')
        .max(50, 'Role name must be less than 50 characters')
        .toLowerCase()
        .trim()
        .optional(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(200, 'Description must be less than 200 characters')
        .trim()
        .optional(),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional()
});

// Pagination and filtering validation
export const paginationSchema = z.object({
    page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
    search: z.string().optional(),
    role: objectId.optional(),
    isActive: z.coerce.boolean().optional(),
    isEmailVerified: z.coerce.boolean().optional()
});

// Search validation
export const searchSchema = z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query too long')
});

// ID parameter validation
export const idParamSchema = z.object({
    id: objectId
});

// Role ID parameter validation
export const roleIdParamSchema = z.object({
    roleId: objectId
});

// User ID parameter validation
export const userIdParamSchema = z.object({
    userId: objectId
}); 