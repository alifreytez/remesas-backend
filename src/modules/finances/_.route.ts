import { Router } from 'express';
import financesController from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router();

router.use(verifySession);

router.get('/rates', financesController.listRates);
router.post('/rates', financesController.createRate);

router.get('/commissions', financesController.listCommissions);
router.post('/commissions', financesController.createCommission);

export default router;
