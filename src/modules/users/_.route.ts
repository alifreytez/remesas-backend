import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession, verifyPermission } from '@middlewares/auth.middleware.js';
import meRoutes from './me/_.route.js';
import permissionsRoutes from './permissions/_.route.js';
import rolesRoutes from './roles/_.route.js';

const router = Router();

// Rutas específicas del usuario autenticado (/me) delegadas a subcarpeta me/
router.use('/me', meRoutes);

// RBAC: Permisos del usuario
router.use('/:id/permissions', verifySession, verifyPermission('API:MANAGE:USERS'), permissionsRoutes);

// RBAC: Roles del usuario
router.use('/:id/roles', verifySession, verifyPermission('API:MANAGE:USERS'), rolesRoutes);

// Rutas generales y parametrizadas de usuarios
router.get('/', verifySession, verifyPermission('API:VIEW:USERS'), controller.getAllFullUsers);

// Operaciones CRUD sobre usuario
router.get('/:id', verifySession, verifyPermission('API:VIEW:USERS'), controller.getFullUser);
router.post('/', verifySession, verifyPermission('API:CREATE:USERS'), controller.createUser);
router.patch('/:id/restore', verifySession, verifyPermission('API:UPDATE:USERS'), controller.restoreUser);
router.patch('/:id', verifySession, verifyPermission('API:UPDATE:USERS'), controller.updateUser);
router.delete('/:id', verifySession, verifyPermission('API:DELETE:USERS'), controller.deleteUser);

export default router;
