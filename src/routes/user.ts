import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
    updateUserSchema,
    paginationSchema,
    searchSchema,
    userIdParamSchema
} from '../validations/authValidation';
import { zodValidation } from '../middlewares/errorsMiddleware';
import {
    authGuard,
    requirePermission,
} from '../middlewares/authGuard';

const router = Router();

// Apply authentication to all user routes
router.use(authGuard);

// User management routes (admin permissions required)
router.post('/',
    // requirePermission('user:create'),
    zodValidation(updateUserSchema),
    UserController.createUser
);

router.get('/',
    requirePermission('user:read'),
    zodValidation(paginationSchema),
    UserController.getAllUsers
);

router.get('/stats',
    requirePermission('user:read'),
    UserController.getUserStats
);

router.get('/search',
    requirePermission('user:read'),
    zodValidation(searchSchema),
    UserController.searchUsers
);

router.get('/:userId',
    requirePermission('user:read'),
    zodValidation(userIdParamSchema),
    UserController.getUserById
);

router.put('/:userId',
    requirePermission('user:update'),
    zodValidation(userIdParamSchema),
    zodValidation(updateUserSchema),
    UserController.updateUser
);

router.delete('/:userId',
    requirePermission('user:delete'),
    zodValidation(userIdParamSchema),
    UserController.deleteUser
);

router.patch('/:userId/activate',
    requirePermission('user:update'),
    zodValidation(userIdParamSchema),
    UserController.activateUser
);

router.patch('/:userId/deactivate',
    requirePermission('user:update'),
    zodValidation(userIdParamSchema),
    UserController.deactivateUser
);

router.put('/:userId/role',
    requirePermission('user:update'),
    zodValidation(userIdParamSchema),
    UserController.updateUserRole
);

// Role-based user queries
router.get('/role/:roleId',
    requirePermission('user:read'),
    zodValidation(paginationSchema),
    UserController.getUsersByRole
);

// Permission checking routes
router.get('/:userId/permissions',
    requirePermission('user:read'),
    zodValidation(userIdParamSchema),
    UserController.getUserPermissions
);

router.get('/:userId/check-permission/:permission',
    requirePermission('user:read'),
    zodValidation(userIdParamSchema),
    UserController.checkUserPermission
);

router.post('/:userId/check-any-permission',
    requirePermission('user:read'),
    zodValidation(userIdParamSchema),
    UserController.checkUserAnyPermission
);

router.post('/:userId/check-all-permissions',
    requirePermission('user:read'),
    zodValidation(userIdParamSchema),
    UserController.checkUserAllPermissions
);

export default router;
