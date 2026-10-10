import { Router } from 'express';
import { caregiverController } from '../controllers/caregiver.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { connectCodeSchema } from '../validators/caregiver.validator';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

// Connection Management
router.post('/code', requireRole(['PATIENT']), (req, res) => caregiverController.generateCode(req, res));
router.get('/connections', (req, res) => caregiverController.getConnections(req, res));
router.post('/connect', requireRole(['CAREGIVER']), validateBody(connectCodeSchema), (req, res) => caregiverController.connectWithCode(req, res));
router.post('/connections/:id/approve', requireRole(['PATIENT']), (req, res) => caregiverController.approveConnection(req, res));
router.post('/connections/:id/reject', requireRole(['PATIENT']), (req, res) => caregiverController.rejectConnection(req, res));
router.delete('/connections/:id', (req, res) => caregiverController.removeConnection(req, res));

// Caregiver Patient Access (Strictly CAREGIVER role and ACTIVE connection verification)
router.get('/patients', requireRole(['CAREGIVER']), (req, res) => caregiverController.getConnectedPatients(req, res));
router.get('/patients/:patientId', requireRole(['CAREGIVER']), (req, res) => caregiverController.getPatientDetails(req, res));
router.get('/patients/:patientId/medications', requireRole(['CAREGIVER']), (req, res) => caregiverController.getPatientMedications(req, res));
router.get('/patients/:patientId/history', requireRole(['CAREGIVER']), (req, res) => caregiverController.getPatientHistory(req, res));
router.get('/patients/:patientId/adherence', requireRole(['CAREGIVER']), (req, res) => caregiverController.getPatientAdherence(req, res));

export default router;
