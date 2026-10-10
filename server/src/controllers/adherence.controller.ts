import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { adherenceService } from '../services/adherence.service';
import { sendSuccess, sendError } from '../utils/response';

export class AdherenceController {
  async getToday(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adherenceService.getTodayAdherence(req.user!.id);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getWeekly(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adherenceService.getWeeklyAdherence(req.user!.id);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getMonthly(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adherenceService.getMonthlyAdherence(req.user!.id);
      return sendSuccess(res, stats);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const adherenceController = new AdherenceController();
