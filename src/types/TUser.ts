import { Types } from "mongoose";

export interface TUser {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    phone?: string;
    role: Types.ObjectId | string;
    permissions?: string[];
    isActive?: boolean;
    isEmailVerified?: boolean;
    googleId?: string;
    googleEmail?: string;
}

export interface TUserLogin {
    email: string;
    password: string;
}

export interface TUserRegister extends TUser {
    confirmPassword: string;
}

export interface TGoogleAuth {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
}

export interface TPasswordReset {
    email: string;
}

export interface TPasswordResetConfirm {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface TEmailVerification {
    token: string;
}

export interface TUserUpdate {
    name?: string;
    avatar?: string;
    phone?: string;
    role?: Types.ObjectId | string;
    permissions?: string[];
    isActive?: boolean;
}

export interface TUserProfile {
    name?: string;
    avatar?: string;
    phone?: string;
}

export interface TChangePassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface TJwtPayload {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
    type: 'access' | 'refresh';
}

export interface TAuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        role: string;
        permissions: string[];
        isEmailVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
} 