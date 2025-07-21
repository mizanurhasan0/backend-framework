import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/user.model';
import { Role } from '../models/role.model';
import { config } from '../config';
import { TUserLogin, TUserRegister, TGoogleAuth, TPasswordReset, TPasswordResetConfirm, TEmailVerification, TAuthResponse, TJwtPayload } from '../types/TUser';
import { PERMISSIONS } from '../types/TRole';
import { sendEmail } from '../services/email.service';

export class AuthService {
    // Generate JWT tokens
    private static generateTokens(user: IUser): { accessToken: string; refreshToken: string } {
        const payload: TJwtPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role.toString(),
            permissions: user.permissions,
            type: 'access'
        };

        const refreshPayload: TJwtPayload = {
            ...payload,
            type: 'refresh'
        };

        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: '15m'
        });

        const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
            expiresIn: '7d'
        });

        return { accessToken, refreshToken };
    }

    // Register new user
    static async register(userData: TUserRegister): Promise<TAuthResponse> {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) throw new Error('User already exists with this email');

        // Get default role
        const defaultRole = await Role.findOne({ isDefault: true });

        if (!defaultRole) throw new Error('No default role found');


        // Create user
        const user = new User({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: defaultRole._id,
            permissions: defaultRole.permissions
        });

        await user.save();

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        // Send verification email
        // await sendEmail({
        //     to: user.email,
        //     subject: 'Verify your email',
        //     template: 'email-verification',
        //     data: {
        //         name: user.name,
        //         verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        //     }
        // });

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(user);

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role.toString(),
                permissions: user.permissions,
                isEmailVerified: user.isEmailVerified
            },
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 // 15 minutes
        };
    }

    // Login user
    static async login(loginData: TUserLogin): Promise<TAuthResponse> {
        const user = await User.findOne({ email: loginData.email }).populate('role');
        if (!user) throw new Error('Invalid credentials');

        // Check if account is locked
        if (user.onLocked()) throw new Error('Account is temporarily locked. Please try again later.');

        // Check if user is active
        if (!user.isActive) throw new Error('Account is deactivated');


        // Verify password
        const isPasswordValid = await user.comparePassword(loginData.password);
        // if (!isPasswordValid) {
        //     await user.incrementLoginAttempts();
        //     throw new Error('Invalid credentials');
        // }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(user);

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role.toString(),
                permissions: user.permissions,
                isEmailVerified: user.isEmailVerified
            },
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 // 15 minutes
        };
    }

    // Google OAuth authentication
    static async googleAuth(googleData: TGoogleAuth): Promise<TAuthResponse> {
        let user = await User.findOne({ googleId: googleData.googleId });

        if (!user) {
            // Check if user exists with same email
            user = await User.findOne({ email: googleData.email });

            if (user) {
                // Link Google account to existing user
                user.googleId = googleData.googleId;
                user.googleEmail = googleData.email;
                if (!user.isEmailVerified) {
                    user.isEmailVerified = true;
                }
                await user.save();
            } else {
                // Create new user
                const defaultRole = await Role.findOne({ isDefault: true });
                if (!defaultRole) {
                    throw new Error('No default role found');
                }

                user = new User({
                    name: googleData.name,
                    email: googleData.email,
                    googleId: googleData.googleId,
                    googleEmail: googleData.email,
                    avatar: googleData.avatar,
                    role: defaultRole._id,
                    permissions: defaultRole.permissions,
                    isEmailVerified: true
                });

                await user.save();
            }
        }

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens(user);

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role.toString(),
                permissions: user.permissions,
                isEmailVerified: user.isEmailVerified
            },
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 // 15 minutes
        };
    }

    // Refresh token
    static async refreshToken(refreshToken: string): Promise<TAuthResponse> {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as TJwtPayload;

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            const user = await User.findById(decoded.userId).populate('role');
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            // Generate new tokens
            const tokens = this.generateTokens(user);

            return {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role.toString(),
                    permissions: user.permissions,
                    isEmailVerified: user.isEmailVerified
                },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: 15 * 60 // 15 minutes
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    // Forgot password
    static async forgotPassword(email: string): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Reset your password',
            template: 'password-reset',
            data: {
                name: user.name,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            }
        });
    }

    // Reset password
    static async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
    }

    // Verify email
    static async verifyEmail(token: string): Promise<void> {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new Error('Invalid or expired verification token');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
    }

    // Resend verification email
    static async resendVerification(email: string): Promise<void> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        if (user.isEmailVerified) {
            throw new Error('Email is already verified');
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Verify your email',
            template: 'email-verification',
            data: {
                name: user.name,
                verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
            }
        });
    }

    // Logout
    static async logout(userId: string): Promise<void> {
        const user = await User.findById(userId);
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }
    }

    // Verify JWT token
    static verifyToken(token: string): TJwtPayload {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as TJwtPayload;
            if (decoded.type !== 'access') throw new Error('Invalid token type');

            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Check permission
    static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
        return userPermissions.includes(requiredPermission);
    }

    // Check multiple permissions (all must be present)
    static hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
        return requiredPermissions.every(permission => userPermissions.includes(permission));
    }

    // Check multiple permissions (any must be present)
    static hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
        return requiredPermissions.some(permission => userPermissions.includes(permission));
    }
} 