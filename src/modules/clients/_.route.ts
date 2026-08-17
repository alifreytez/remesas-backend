import { Router } from 'express';
import clientsController from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router();

router.use(verifySession);

router.get('/', clientsController.list);
router.get('/:id', clientsController.getById);
router.get('/:id/contacts', clientsController.getContacts);
router.post('/', clientsController.create);
router.patch('/:id', clientsController.update);
router.delete('/:id', clientsController.remove);

export default router;
