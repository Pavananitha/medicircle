import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), (req, res) => authController.register(req, res));

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), (req, res) => authController.login(req, res));

// GET /api/auth/me (authenticated verification foundation)
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

export default router;
