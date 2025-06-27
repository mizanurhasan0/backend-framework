import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
    // Create a new role
    static async createRole(req: Request, res: Response) {
        try {
            const role = await RoleService.createRole(req.body);
            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: role
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get all roles
    static async getAllRoles(req: Request, res: Response) {
        try {
            const roles = await RoleService.getAllRoles();
            res.json({
                success: true,
                data: roles
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get roles with user count
    static async getRolesWithUserCount(req: Request, res: Response) {
        try {
            const roles = await RoleService.getRolesWithUserCount();
            res.json({
                success: true,
                data: roles
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get role by ID
    static async getRoleById(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const role = await RoleService.getRoleById(roleId);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            res.json({
                success: true,
                data: role
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update role
    static async updateRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const role = await RoleService.updateRole(roleId, req.body);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            res.json({
                success: true,
                message: 'Role updated successfully',
                data: role
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Delete role
    static async deleteRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            await RoleService.deleteRole(roleId);

            res.json({
                success: true,
                message: 'Role deleted successfully'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get active roles
    static async getActiveRoles(req: Request, res: Response) {
        try {
            const roles = await RoleService.getActiveRoles();
            res.json({
                success: true,
                data: roles
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get default role
    static async getDefaultRole(req: Request, res: Response) {
        try {
            const role = await RoleService.getDefaultRole();

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'No default role found'
                });
            }

            res.json({
                success: true,
                data: role
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Set default role
    static async setDefaultRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            await RoleService.setDefaultRole(roleId);

            res.json({
                success: true,
                message: 'Default role set successfully'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get role permissions
    static async getRolePermissions(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const permissions = await RoleService.getRolePermissions(roleId);

            res.json({
                success: true,
                data: {
                    roleId,
                    permissions
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Update role permissions
    static async updateRolePermissions(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const { permissions } = req.body;

            if (!Array.isArray(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Permissions must be an array'
                });
            }

            const role = await RoleService.updateRolePermissions(roleId, permissions);

            res.json({
                success: true,
                message: 'Role permissions updated successfully',
                data: role
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Add permission to role
    static async addPermissionToRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const { permission } = req.body;

            if (!permission) {
                return res.status(400).json({
                    success: false,
                    message: 'Permission is required'
                });
            }

            const role = await RoleService.addPermissionToRole(roleId, permission);

            res.json({
                success: true,
                message: 'Permission added to role successfully',
                data: role
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Remove permission from role
    static async removePermissionFromRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const { permission } = req.body;

            if (!permission) {
                return res.status(400).json({
                    success: false,
                    message: 'Permission is required'
                });
            }

            const role = await RoleService.removePermissionFromRole(roleId, permission);

            res.json({
                success: true,
                message: 'Permission removed from role successfully',
                data: role
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get all available permissions
    static async getAllPermissions(req: Request, res: Response) {
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

    // Create predefined roles
    static async createPredefinedRoles(req: Request, res: Response) {
        try {
            await RoleService.createPredefinedRoles();
            res.json({
                success: true,
                message: 'Predefined roles created successfully'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get role statistics
    static async getRoleStats(req: Request, res: Response) {
        try {
            const stats = await RoleService.getRoleStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Search roles
    static async searchRoles(req: Request, res: Response) {
        try {
            const { query } = req.query;

            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const roles = await RoleService.searchRoles(query);

            res.json({
                success: true,
                data: roles
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Get roles by permission
    static async getRolesByPermission(req: Request, res: Response) {
        try {
            const { permission } = req.params;
            const roles = await RoleService.getRolesByPermission(permission);

            res.json({
                success: true,
                data: {
                    permission,
                    roles
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Clone role
    static async cloneRole(req: Request, res: Response) {
        try {
            const { roleId } = req.params;
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Role name is required'
                });
            }

            const role = await RoleService.cloneRole(roleId, name, description);

            res.status(201).json({
                success: true,
                message: 'Role cloned successfully',
                data: role
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
} 