import { Router } from 'express';
import { medicineController } from '../controllers/medicine.controller';
import { scheduleController } from '../controllers/schedule.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createMedicineSchema, updateMedicineSchema } from '../validators/medicine.validator';
import { createScheduleSchema } from '../validators/schedule.validator';
import { Role } from '../types';

const router = Router();

// Only patients own and manage their medications
router.use(authenticate, requireRole(['PATIENT']));

router.get('/', (req, res) => medicineController.getMedicines(req, res));
router.post('/', validateBody(createMedicineSchema), (req, res) => medicineController.createMedicine(req, res));
router.get('/:id', (req, res) => medicineController.getMedicineById(req, res));
router.put('/:id', validateBody(updateMedicineSchema), (req, res) => medicineController.updateMedicine(req, res));
router.delete('/:id', (req, res) => medicineController.deleteMedicine(req, res));

// Medicine schedule routes
router.get('/:medicineId/schedules', (req, res) => scheduleController.getSchedulesByMedicine(req, res));
router.post('/:medicineId/schedules', validateBody(createScheduleSchema), (req, res) => scheduleController.createSchedule(req, res));

export default router;
