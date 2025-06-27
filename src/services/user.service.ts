import { User, IUser } from '../models/user.model';
import { Role } from '../models/role.model';
import { TUser, TUserUpdate, TUserProfile, TChangePassword } from '../types/TUser';
import { Types } from 'mongoose';

export class UserService {
  // Create a new user
  static async createUser(userData: TUser): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  // Get all users with pagination and filtering
  static async getAllUsers(page: number = 1, limit: number = 10, filters: any = {}) {
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isEmailVerified !== undefined) query.isEmailVerified = filters.isEmailVerified;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('role', 'name description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId).populate('role', 'name description permissions');
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).populate('role', 'name description permissions');
  }

  // Update user
  static async updateUser(userId: string, updateData: TUserUpdate): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('role', 'name description permissions');

    return user;
  }

  // Update user profile (for users updating their own profile)
  static async updateProfile(userId: string, profileData: TUserProfile): Promise<IUser | null> {
    const allowedFields = ['name', 'avatar', 'phone'];
    const updateData: any = {};

    allowedFields.forEach(field => {
      if (profileData[field as keyof TUserProfile] !== undefined) {
        updateData[field] = profileData[field as keyof TUserProfile];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('role', 'name description permissions');

    return user;
  }

  // Change password
  static async changePassword(userId: string, passwordData: TChangePassword): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(passwordData.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = passwordData.newPassword;
    await user.save();
  }

  // Deactivate user
  static async deactivateUser(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).populate('role', 'name description');
  }

  // Activate user
  static async activateUser(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).populate('role', 'name description');
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    await User.findByIdAndDelete(userId);
  }

  // Get users by role
  static async getUsersByRole(roleId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const users = await User.find({ role: roleId })
      .populate('role', 'name description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: roleId });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user statistics
  static async getUserStats() {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const googleUsers = await User.countDocuments({ googleId: { $exists: true, $ne: null } });

    // Get users by role
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
      totalUsers,
      activeUsers,
      verifiedUsers,
      googleUsers,
      usersByRole
    };
  }

  // Search users
  static async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('role', 'name description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update user role
  static async updateUserRole(userId: string, roleId: string): Promise<IUser | null> {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        role: roleId,
        permissions: role.permissions
      },
      { new: true, runValidators: true }
    ).populate('role', 'name description permissions');

    return user;
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<string[]> {
    const user = await User.findById(userId).populate('role', 'permissions');
    if (!user) {
      throw new Error('User not found');
    }

    return user.permissions || [];
  }

  // Check if user has permission
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  // Check if user has any of the permissions
  static async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  // Check if user has all permissions
  static async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(permission => userPermissions.includes(permission));
  }
}
