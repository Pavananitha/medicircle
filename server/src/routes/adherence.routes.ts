import { Router } from 'express';
import { adherenceController } from '../controllers/adherence.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate, requireRole(['PATIENT']));

router.get('/today', (req, res) => adherenceController.getToday(req, res));
router.get('/weekly', (req, res) => adherenceController.getWeekly(req, res));
router.get('/monthly', (req, res) => adherenceController.getMonthly(req, res));

export default router;
