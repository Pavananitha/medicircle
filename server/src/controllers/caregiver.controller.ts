import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { caregiverService } from '../services/caregiver.service';
import { adherenceService } from '../services/adherence.service';
import { sendSuccess, sendError } from '../utils/response';

export class CaregiverController {
  // Generate Code (Patient only)
  async generateCode(req: AuthenticatedRequest, res: Response) {
    try {
      const codeRecord = await caregiverService.generateConnectionCode(req.user!.id);
      return sendSuccess(res, codeRecord, 'Connection code generated successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  // Get Connections
  async getConnections(req: AuthenticatedRequest, res: Response) {
    try {
      const connections = await caregiverService.getConnections(req.user!.id, req.user!.role);
      return sendSuccess(res, connections);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  // Connect via Code (Caregiver enters code)
  async connectWithCode(req: AuthenticatedRequest, res: Response) {
    try {
      const { code } = req.body;
      const connection = await caregiverService.connectWithCode(req.user!.id, code);
      return sendSuccess(res, connection, 'Connection request submitted to patient', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  // Approve Connection (Patient only)
  async approveConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const approved = await caregiverService.approveConnection(id, req.user!.id);
      return sendSuccess(res, approved, 'Caregiver connection approved');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  // Reject Connection (Patient only)
  async rejectConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const rejected = await caregiverService.rejectConnection(id, req.user!.id);
      return sendSuccess(res, rejected, 'Caregiver connection rejected');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  // Remove Connection
  async removeConnection(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await caregiverService.removeConnection(id, req.user!.id);
      return sendSuccess(res, null, 'Connection removed successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  // Caregiver views their active patients
  async getConnectedPatients(req: AuthenticatedRequest, res: Response) {
    try {
      const patients = await caregiverService.getConnectedPatients(req.user!.id);
      return sendSuccess(res, patients);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  // Caregiver views a specific patient profile
  async getPatientDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const patient = await caregiverService.getPatientDetails(patientId, req.user!.id);
      return sendSuccess(res, patient);
    } catch (error: any) {
      return sendError(res, error.message, 403);
    }
  }

  // Caregiver views patient medications (Read-only)
  async getPatientMedications(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const medications = await caregiverService.getPatientMedications(patientId, req.user!.id);
      return sendSuccess(res, medications);
    } catch (error: any) {
      return sendError(res, error.message, 403);
    }
  }

  // Caregiver views patient history
  async getPatientHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const history = await caregiverService.getPatientHistory(patientId, req.user!.id, days);
      return sendSuccess(res, history);
    } catch (error: any) {
      return sendError(res, error.message, 403);
    }
  }

  // Caregiver views patient adherence
  async getPatientAdherence(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId } = req.params;
      await caregiverService.verifyCaregiverAccess(patientId, req.user!.id);
      const weekly = await adherenceService.getWeeklyAdherence(patientId);
      return sendSuccess(res, weekly);
    } catch (error: any) {
      return sendError(res, error.message, 403);
    }
  }
}

export const caregiverController = new CaregiverController();
