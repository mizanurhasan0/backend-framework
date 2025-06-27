import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import {
    createRoleSchema,
    updateRoleSchema,
    searchSchema,
    roleIdParamSchema
} from '../validations/authValidation';
import { zodValidation } from '../middlewares/errorsMiddleware';
import {
    authGuard,
    requirePermission,
    requireAnyPermission
} from '../middlewares/authGuard';

const router = Router();

// Apply authentication to all role routes
router.use(authGuard);

// Role management routes (admin permissions required)
router.post('/',
    requirePermission('admin:create'),
    zodValidation(createRoleSchema),
    RoleController.createRole
);

router.get('/',
    requirePermission('admin:read'),
    RoleController.getAllRoles
);

router.get('/with-users',
    requirePermission('admin:read'),
    RoleController.getRolesWithUserCount
);

router.get('/active',
    requirePermission('admin:read'),
    RoleController.getActiveRoles
);

router.get('/default',
    requirePermission('admin:read'),
    RoleController.getDefaultRole
);

router.get('/stats',
    requirePermission('admin:read'),
    RoleController.getRoleStats
);

router.get('/search',
    requirePermission('admin:read'),
    zodValidation(searchSchema),
    RoleController.searchRoles
);

router.get('/permissions',
    requirePermission('admin:read'),
    RoleController.getAllPermissions
);

router.get('/by-permission/:permission',
    requirePermission('admin:read'),
    RoleController.getRolesByPermission
);

router.get('/:roleId',
    requirePermission('admin:read'),
    zodValidation(roleIdParamSchema),
    RoleController.getRoleById
);

router.put('/:roleId',
    requirePermission('admin:update'),
    zodValidation(roleIdParamSchema),
    zodValidation(updateRoleSchema),
    RoleController.updateRole
);

router.delete('/:roleId',
    requirePermission('admin:delete'),
    zodValidation(roleIdParamSchema),
    RoleController.deleteRole
);

router.patch('/:roleId/set-default',
    requirePermission('admin:update'),
    zodValidation(roleIdParamSchema),
    RoleController.setDefaultRole
);

// Permission management routes
router.get('/:roleId/permissions',
    requirePermission('admin:read'),
    zodValidation(roleIdParamSchema),
    RoleController.getRolePermissions
);

router.put('/:roleId/permissions',
    requirePermission('admin:update'),
    zodValidation(roleIdParamSchema),
    RoleController.updateRolePermissions
);

router.post('/:roleId/permissions',
    requirePermission('admin:update'),
    zodValidation(roleIdParamSchema),
    RoleController.addPermissionToRole
);

router.delete('/:roleId/set-default',
    requirePermission('admin:update'),
    zodValidation(roleIdParamSchema),
    RoleController.removePermissionFromRole
);

// System management routes
router.post('/predefined/create',
    requirePermission('system:settings'),
    RoleController.createPredefinedRoles
);

router.post('/:roleId/clone',
    requirePermission('admin:create'),
    zodValidation(roleIdParamSchema),
    RoleController.cloneRole
);

export default router; 