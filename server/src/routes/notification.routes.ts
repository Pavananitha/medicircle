import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/notifications', (req, res) => notificationController.getNotifications(req, res));
router.put('/notifications/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.delete('/notifications/:id', (req, res) => notificationController.deleteNotification(req, res));
router.post('/devices/register', (req, res) => notificationController.registerDevice(req, res));

export default router;
