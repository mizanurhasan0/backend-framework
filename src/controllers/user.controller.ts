import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';

export class UserController {
  // Create a new user (admin only)
  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all users with pagination and filtering
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { page, limit, ...filters } = req.query;
      const result = await UserService.getAllUsers(
        Number(page) || 1,
        Number(limit) || 10,
        filters
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await UserService.getUserById(userId);

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

  // Update user (admin only)
  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await UserService.updateUser(userId, req.body);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete user (admin only)
  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await UserService.deleteUser(userId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Activate user (admin only)
  static async activateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await UserService.activateUser(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User activated successfully',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Deactivate user (admin only)
  static async deactivateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await UserService.deactivateUser(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get users by role
  static async getUsersByRole(req: Request, res: Response) {
    try {
      const { roleId } = req.params;
      const { page, limit } = req.query;

      const result = await UserService.getUsersByRole(
        roleId,
        Number(page) || 1,
        Number(limit) || 10
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user role (admin only)
  static async updateUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      const user = await UserService.updateUserRole(userId, roleId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user statistics
  static async getUserStats(req: Request, res: Response) {
    try {
      const stats = await UserService.getUserStats();

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

  // Search users
  static async searchUsers(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const { page, limit } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const result = await UserService.searchUsers(
        query,
        Number(page) || 1,
        Number(limit) || 10
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user permissions
  static async getUserPermissions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const permissions = await UserService.getUserPermissions(userId);

      res.json({
        success: true,
        data: {
          userId,
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

  // Check if user has permission
  static async checkUserPermission(req: Request, res: Response) {
    try {
      const { userId, permission } = req.params;
      const hasPermission = await UserService.hasPermission(userId, permission);

      res.json({
        success: true,
        data: {
          userId,
          permission,
          hasPermission
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Check if user has any of the permissions
  static async checkUserAnyPermission(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions must be an array'
        });
      }

      const hasPermission = await UserService.hasAnyPermission(userId, permissions);

      res.json({
        success: true,
        data: {
          userId,
          permissions,
          hasPermission
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Check if user has all permissions
  static async checkUserAllPermissions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions must be an array'
        });
      }

      const hasPermission = await UserService.hasAllPermissions(userId, permissions);

      res.json({
        success: true,
        data: {
          userId,
          permissions,
          hasPermission
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
