import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { medicationLogService } from '../services/medicationLog.service';
import { sendSuccess, sendError } from '../utils/response';

export class MedicationLogController {
  async getLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await medicationLogService.getAllLogs(req.user!.id);
      return sendSuccess(res, logs);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getTodayLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await medicationLogService.getTodayLogs(req.user!.id);
      return sendSuccess(res, logs);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getHistoryLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const logs = await medicationLogService.getHistoryLogs(req.user!.id, days);
      return sendSuccess(res, logs);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async markTaken(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await medicationLogService.markTaken(id, req.user!.id);
      return sendSuccess(res, updated, 'Medication marked as taken');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async markSkipped(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await medicationLogService.markSkipped(id, req.user!.id);
      return sendSuccess(res, updated, 'Medication marked as skipped');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const medicationLogController = new MedicationLogController();
