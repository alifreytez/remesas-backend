import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession, verifyPermission } from '@middlewares/auth.middleware.js';

const router = Router();

router.use(verifySession);

router.post('/', verifyPermission('API:CREATE:CONTACTS'), controller.createContact);
router.patch('/:id', verifyPermission('API:UPDATE:CONTACTS'), controller.updateContact);
router.delete('/:id', verifyPermission('API:DELETE:CONTACTS'), controller.deleteContact);

export default router;
