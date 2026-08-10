import { Router } from 'express';
import remittancesController from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router();

router.use(verifySession);

router.get('/', remittancesController.list);
router.get('/:id', remittancesController.getById);
router.post('/', remittancesController.create);
router.patch('/:id', remittancesController.updateStatus);

export default router;
