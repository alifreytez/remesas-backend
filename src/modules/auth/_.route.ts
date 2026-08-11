import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession, preventDoubleLogin } from '@middlewares/auth.middleware.js';

const router = Router();

router.post('/register', controller.register);
router.post('/login', preventDoubleLogin, controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', verifySession, controller.logout);
router.post('/forgot-username', controller.forgotUsername);
router.post('/forgot-password', controller.forgotPassword);
router.post('/verify-reset-code', controller.verifyResetCode);
router.post('/reset-password', controller.resetPassword);

export default router;
