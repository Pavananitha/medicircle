import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import medicineRoutes from './medicine.routes';
import scheduleRoutes from './schedule.routes';
import medicationLogRoutes from './medicationLog.routes';
import caregiverRoutes from './caregiver.routes';
import adherenceRoutes from './adherence.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Authentication Routes
router.use('/auth', authRoutes);

// Core Feature Routes
router.use('/profile', profileRoutes);
router.use('/medicines', medicineRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/medication-logs', medicationLogRoutes);
router.use('/caregiver', caregiverRoutes);
router.use('/adherence', adherenceRoutes);
router.use('/', notificationRoutes); // Has /notifications and /devices/register inside

export default router;
