import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';

export class AuthController {
    // Register new user
    static async register(req: Request, res: Response) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please check your email to verify your account.',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Login user
    static async login(req: Request, res: Response) {
        try {
            const result = await AuthService.login(req.body);

            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    expiresIn: result.expiresIn
                }
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    // Google OAuth authentication
    static async googleAuth(req: Request, res: Response) {
        try {
            const result = await AuthService.googleAuth(req.body);

            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
            });

            res.json({
                success: true,
                message: 'Google authentication successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    expiresIn: result.expiresIn
                }
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Refresh token
    static async refreshToken(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            const result = await AuthService.refreshToken(refreshToken);

            // Set new refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
            });

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    expiresIn: result.expiresIn
                }
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }

    // Logout
    static async logout(req: Request, res: Response) {
        try {
            if (req.user?.userId) {
                await AuthService.logout(req.user.userId);
            }

            // Clear refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
            });

            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Forgot password
    static async forgotPassword(req: Request, res: Response) {
        try {
            await AuthService.forgotPassword(req.body.email);
            res.json({
                success: true,
                message: 'Password reset email sent. Please check your email.'
            });
        } catch (error: any) {
            // Don't reveal if email exists or not
            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        }
    }

    // Reset password
    static async resetPassword(req: Request, res: Response) {
        try {
            await AuthService.resetPassword(req.body.token, req.body.newPassword);
            res.json({
                success: true,
                message: 'Password reset successful. You can now login with your new password.'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Verify email
    static async verifyEmail(req: Request, res: Response) {
        try {
            await AuthService.verifyEmail(req.body.token);
            res.json({
                success: true,
                message: 'Email verified successfully. You can now login to your account.'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Resend verification email
    static async resendVerification(req: Request, res: Response) {
        try {
            await AuthService.resendVerification(req.body.email);
            res.json({
                success: true,
                message: 'Verification email sent. Please check your email.'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get current user profile
    static async getProfile(req: Request, res: Response) {
        try {
            const user = await UserService.getUserById(req.user!.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update user profile
    static async updateProfile(req: Request, res: Response) {
        try {
            const user = await UserService.updateProfile(req.user!.userId, req.body);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: user
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Change password
    static async changePassword(req: Request, res: Response) {
        try {
            await UserService.changePassword(req.user!.userId, req.body);
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get user permissions
    static async getPermissions(req: Request, res: Response) {
        try {
            const permissions = await UserService.getUserPermissions(req.user!.userId);
            res.json({
                success: true,
                data: {
                    permissions,
                    role: req.user!.role
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Check if user has permission
    static async checkPermission(req: Request, res: Response) {
        try {
            const { permission } = req.params;
            const hasPermission = await UserService.hasPermission(req.user!.userId, permission);

            res.json({
                success: true,
                data: {
                    hasPermission,
                    permission
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get available permissions
    static async getAvailablePermissions(req: Request, res: Response) {
        try {
            const permissions = RoleService.getAllPermissions();
            const predefinedRoles = RoleService.getPredefinedRoles();

            res.json({
                success: true,
                data: {
                    permissions,
                    predefinedRoles
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Initialize system (create default roles)
    static async initializeSystem(req: Request, res: Response) {
        try {
            await RoleService.createPredefinedRoles();
            res.json({
                success: true,
                message: 'System initialized successfully with default roles'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
} 