import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';
import contactsRoutes from './contacts/_.route.js';

const router = Router();

// Rutas base: /users/me/...
router.get('/permissions', verifySession, controller.getSessionPermissions);
router.get('/profile', verifySession, controller.getMyProfile);
router.patch('/profile', verifySession, controller.updateMyProfile);
router.get('/security', verifySession, controller.getMySecurity);
router.patch('/security', verifySession, controller.updateMySecurity);

// Sub-recursos de autogestión
router.use('/contacts', contactsRoutes);

export default router;
