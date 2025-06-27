import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
    registerSchema,
    loginSchema,
    googleAuthSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    emailVerificationSchema,
    resendVerificationSchema,
    refreshTokenSchema,
    changePasswordSchema,
    updateProfileSchema
} from '../validations/authValidation';
import { zodValidation } from '../middlewares/errorsMiddleware';
import {
    authGuard,
    requirePermission,
    requireAnyPermission,
    rateLimit
} from '../middlewares/authGuard';

const router = Router();

// Public routes (no authentication required)
router.post('/register', zodValidation(registerSchema), AuthController.register);
router.post('/login', zodValidation(loginSchema), rateLimit(5, 15 * 60 * 1000), AuthController.login);
router.post('/google', zodValidation(googleAuthSchema), AuthController.googleAuth);
router.post('/refresh', zodValidation(refreshTokenSchema), AuthController.refreshToken);
router.post('/forgot-password', zodValidation(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', zodValidation(resetPasswordSchema), AuthController.resetPassword);
router.post('/verify-email', zodValidation(emailVerificationSchema), AuthController.verifyEmail);
router.post('/resend-verification', zodValidation(resendVerificationSchema), AuthController.resendVerification);

// Protected routes (authentication required)
router.use(authGuard); // Apply authentication to all routes below

router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);
router.put('/profile', zodValidation(updateProfileSchema), AuthController.updateProfile);
router.put('/change-password', zodValidation(changePasswordSchema), AuthController.changePassword);
router.get('/permissions', AuthController.getPermissions);
router.get('/check-permission/:permission', AuthController.checkPermission);

// Admin routes (specific permissions required)
router.get('/available-permissions',
    requirePermission('admin:read'),
    AuthController.getAvailablePermissions
);

router.post('/initialize-system',
    requirePermission('system:settings'),
    AuthController.initializeSystem
);

export default router; 