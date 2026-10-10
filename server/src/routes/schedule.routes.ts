import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateScheduleSchema } from '../validators/schedule.validator';
import { Role } from '../types';

const router = Router();

router.use(authenticate, requireRole(['PATIENT']));

router.put('/:id', validateBody(updateScheduleSchema), (req, res) => scheduleController.updateSchedule(req, res));
router.delete('/:id', (req, res) => scheduleController.deleteSchedule(req, res));

export default router;
