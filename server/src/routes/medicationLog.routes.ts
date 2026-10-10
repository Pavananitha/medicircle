import { Router } from 'express';
import { medicationLogController } from '../controllers/medicationLog.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

// Only patients modify and log their own doses
router.use(authenticate, requireRole(['PATIENT']));

router.get('/', (req, res) => medicationLogController.getLogs(req, res));
router.get('/today', (req, res) => medicationLogController.getTodayLogs(req, res));
router.get('/history', (req, res) => medicationLogController.getHistoryLogs(req, res));
router.post('/:id/taken', (req, res) => medicationLogController.markTaken(req, res));
router.post('/:id/skipped', (req, res) => medicationLogController.markSkipped(req, res));

export default router;
