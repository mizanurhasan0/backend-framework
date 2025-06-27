import { Types } from "mongoose";

export interface TRole {
    name: string;
    description: string;
    permissions: string[];
    isActive?: boolean;
    isDefault?: boolean;
}

export interface TRoleUpdate {
    name?: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
    isDefault?: boolean;
}

export interface TRoleWithUsers extends TRole {
    id: string;
    userCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type Permission =
    // User permissions
    | 'user:read' | 'user:create' | 'user:update' | 'user:delete'
    // Category permissions
    | 'category:read' | 'category:create' | 'category:update' | 'category:delete' | 'category:move'
    // Product permissions
    | 'product:read' | 'product:create' | 'product:update' | 'product:delete'
    // Order permissions
    | 'order:read' | 'order:create' | 'order:update' | 'order:delete' | 'order:fulfill'
    // Admin permissions
    | 'admin:read' | 'admin:create' | 'admin:update' | 'admin:delete'
    // System permissions
    | 'system:settings' | 'system:backup' | 'system:logs';

export const PERMISSIONS: Record<string, Permission[]> = {
    SUPER_ADMIN: [
        'user:read', 'user:create', 'user:update', 'user:delete',
        'category:read', 'category:create', 'category:update', 'category:delete', 'category:move',
        'product:read', 'product:create', 'product:update', 'product:delete',
        'order:read', 'order:create', 'order:update', 'order:delete', 'order:fulfill',
        'admin:read', 'admin:create', 'admin:update', 'admin:delete',
        'system:settings', 'system:backup', 'system:logs'
    ],
    ADMIN: [
        'user:read', 'user:create', 'user:update',
        'category:read', 'category:create', 'category:update', 'category:delete', 'category:move',
        'product:read', 'product:create', 'product:update', 'product:delete',
        'order:read', 'order:create', 'order:update', 'order:fulfill',
        'admin:read', 'admin:create', 'admin:update'
    ],
    MANAGER: [
        'user:read',
        'category:read', 'category:create', 'category:update',
        'product:read', 'product:create', 'product:update',
        'order:read', 'order:update', 'order:fulfill'
    ],
    EDITOR: [
        'category:read', 'category:update',
        'product:read', 'product:create', 'product:update',
        'order:read'
    ],
    CUSTOMER: [
        'product:read',
        'order:read', 'order:create'
    ]
}; 