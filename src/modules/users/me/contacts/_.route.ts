import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas aquí ya están bajo /users/me/contacts (protegidas implícitamente por verifySession en la ruta superior, pero es buena práctica declararlo si se quiere)
router.use(verifySession);

router.get('/', controller.getMyContacts);
router.get('/:contactId', controller.getMyContactById);
router.post('/', controller.createMyContact);
router.patch('/:contactId', controller.updateMyContact);
router.delete('/:contactId', controller.deleteMyContact);

export default router;
