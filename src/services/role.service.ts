import { Role, IRole } from '../models/role.model';
import { User } from '../models/user.model';
import { TRole, TRoleUpdate, TRoleWithUsers, PERMISSIONS } from '../types/TRole';

export class RoleService {
    // Create a new role
    static async createRole(roleData: TRole): Promise<IRole> {
        const role = new Role(roleData);
        return await role.save();
    }

    // Get all roles
    static async getAllRoles(): Promise<IRole[]> {
        return await Role.find().sort({ name: 1 });
    }

    // Get role by ID
    static async getRoleById(roleId: string): Promise<IRole | null> {
        return await Role.findById(roleId);
    }

    // Get role by name
    static async getRoleByName(name: string): Promise<IRole | null> {
        return await Role.findOne({ name: name.toLowerCase() });
    }

    // Update role
    static async updateRole(roleId: string, updateData: TRoleUpdate): Promise<IRole | null> {
        const role = await Role.findByIdAndUpdate(
            roleId,
            updateData,
            { new: true, runValidators: true }
        );

        return role;
    }

    // Delete role
    static async deleteRole(roleId: string): Promise<void> {
        // Check if role is assigned to any users
        const userCount = await User.countDocuments({ role: roleId });
        if (userCount > 0) {
            throw new Error(`Cannot delete role. It is assigned to ${userCount} users.`);
        }

        await Role.findByIdAndDelete(roleId);
    }

    // Get roles with user count
    static async getRolesWithUserCount(): Promise<TRoleWithUsers[]> {
        const roles = await Role.find().sort({ name: 1 });
        const rolesWithCount: TRoleWithUsers[] = [];

        for (const role of roles) {
            const userCount = await User.countDocuments({ role: role._id });
            rolesWithCount.push({
                id: role._id.toString(),
                name: role.name,
                description: role.description,
                permissions: role.permissions,
                isActive: role.isActive,
                isDefault: role.isDefault,
                userCount,
                createdAt: role.createdAt,
                updatedAt: role.updatedAt
            });
        }

        return rolesWithCount;
    }

    // Get active roles
    static async getActiveRoles(): Promise<IRole[]> {
        return await Role.find({ isActive: true }).sort({ name: 1 });
    }

    // Get default role
    static async getDefaultRole(): Promise<IRole | null> {
        return await Role.findOne({ isDefault: true });
    }

    // Set default role
    static async setDefaultRole(roleId: string): Promise<void> {
        // Remove default from all roles
        await Role.updateMany({}, { isDefault: false });

        // Set new default role
        await Role.findByIdAndUpdate(roleId, { isDefault: true });
    }

    // Get role permissions
    static async getRolePermissions(roleId: string): Promise<string[]> {
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        return role.permissions;
    }

    // Update role permissions
    static async updateRolePermissions(roleId: string, permissions: string[]): Promise<IRole | null> {
        const role = await Role.findByIdAndUpdate(
            roleId,
            { permissions },
            { new: true, runValidators: true }
        );

        // Update all users with this role
        await User.updateMany(
            { role: roleId },
            { permissions }
        );

        return role;
    }

    // Add permission to role
    static async addPermissionToRole(roleId: string, permission: string): Promise<IRole | null> {
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        if (!role.permissions.includes(permission)) {
            role.permissions.push(permission);
            await role.save();

            // Update all users with this role
            await User.updateMany(
                { role: roleId },
                { $addToSet: { permissions: permission } }
            );
        }

        return role;
    }

    // Remove permission from role
    static async removePermissionFromRole(roleId: string, permission: string): Promise<IRole | null> {
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        role.permissions = role.permissions.filter(p => p !== permission);
        await role.save();

        // Update all users with this role
        await User.updateMany(
            { role: roleId },
            { $pull: { permissions: permission } }
        );

        return role;
    }

    // Get all available permissions
    static getAllPermissions(): string[] {
        const allPermissions: string[] = [];
        Object.values(PERMISSIONS).forEach(permissions => {
            allPermissions.push(...permissions);
        });
        return [...new Set(allPermissions)]; // Remove duplicates
    }

    // Get predefined roles
    static getPredefinedRoles(): Record<string, string[]> {
        return PERMISSIONS;
    }

    // Create predefined roles
    static async createPredefinedRoles(): Promise<void> {
        const predefinedRoles = [
            {
                name: 'super_admin',
                description: 'Super Administrator with full system access',
                permissions: PERMISSIONS.SUPER_ADMIN,
                isDefault: false
            },
            {
                name: 'admin',
                description: 'Administrator with high-level access',
                permissions: PERMISSIONS.ADMIN,
                isDefault: false
            },
            {
                name: 'manager',
                description: 'Manager with moderate access',
                permissions: PERMISSIONS.MANAGER,
                isDefault: false
            },
            {
                name: 'editor',
                description: 'Editor with limited access',
                permissions: PERMISSIONS.EDITOR,
                isDefault: false
            },
            {
                name: 'customer',
                description: 'Customer with basic access',
                permissions: PERMISSIONS.CUSTOMER,
                isDefault: true
            }
        ];

        for (const roleData of predefinedRoles) {
            const existingRole = await Role.findOne({ name: roleData.name });
            if (!existingRole) {
                await Role.create(roleData);
            }
        }
    }

    // Get role statistics
    static async getRoleStats() {
        const totalRoles = await Role.countDocuments();
        const activeRoles = await Role.countDocuments({ isActive: true });
        const defaultRole = await Role.findOne({ isDefault: true });

        // Get user count by role
        const usersByRole = await User.aggregate([
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleInfo'
                }
            },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    roleName: { $first: '$roleInfo.name' }
                }
            },
            {
                $project: {
                    roleName: { $arrayElemAt: ['$roleName', 0] },
                    count: 1
                }
            }
        ]);

        return {
            totalRoles,
            activeRoles,
            defaultRole: defaultRole ? defaultRole.name : null,
            usersByRole
        };
    }

    // Search roles
    static async searchRoles(query: string): Promise<IRole[]> {
        return await Role.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).sort({ name: 1 });
    }

    // Check if role exists
    static async roleExists(roleId: string): Promise<boolean> {
        const role = await Role.findById(roleId);
        return !!role;
    }

    // Get roles by permission
    static async getRolesByPermission(permission: string): Promise<IRole[]> {
        return await Role.find({
            permissions: permission,
            isActive: true
        }).sort({ name: 1 });
    }

    // Clone role
    static async cloneRole(roleId: string, newName: string, newDescription?: string): Promise<IRole> {
        const originalRole = await Role.findById(roleId);
        if (!originalRole) {
            throw new Error('Original role not found');
        }

        const newRole = new Role({
            name: newName,
            description: newDescription || `Copy of ${originalRole.name}`,
            permissions: originalRole.permissions,
            isActive: true,
            isDefault: false
        });

        return await newRole.save();
    }
} 