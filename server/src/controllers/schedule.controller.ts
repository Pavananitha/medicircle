import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { scheduleService } from '../services/schedule.service';
import { sendSuccess, sendError } from '../utils/response';

export class ScheduleController {
  async getSchedulesByMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      const { medicineId } = req.params;
      const schedules = await scheduleService.getSchedulesByMedicine(medicineId, req.user!.id);
      return sendSuccess(res, schedules);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async createSchedule(req: AuthenticatedRequest, res: Response) {
    try {
      const { medicineId } = req.params;
      const schedule = await scheduleService.createSchedule(medicineId, req.user!.id, req.body);
      return sendSuccess(res, schedule, 'Schedule created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async updateSchedule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await scheduleService.updateSchedule(id, req.user!.id, req.body);
      return sendSuccess(res, updated, 'Schedule updated successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async deleteSchedule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await scheduleService.deleteSchedule(id, req.user!.id);
      return sendSuccess(res, null, 'Schedule deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const scheduleController = new ScheduleController();
