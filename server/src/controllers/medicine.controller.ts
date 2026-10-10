import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { medicineService } from '../services/medicine.service';
import { sendSuccess, sendError } from '../utils/response';

export class MedicineController {
  async getMedicines(req: AuthenticatedRequest, res: Response) {
    try {
      const medicines = await medicineService.getMedicinesByPatient(req.user!.id);
      return sendSuccess(res, medicines);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async getMedicineById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const medicine = await medicineService.getMedicineById(id, req.user!.id);
      return sendSuccess(res, medicine);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async createMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await medicineService.createMedicine(req.user!.id, req.body);
      return sendSuccess(res, result, 'Medicine added successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async updateMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await medicineService.updateMedicine(id, req.user!.id, req.body);
      return sendSuccess(res, updated, 'Medicine updated successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async deleteMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await medicineService.deleteMedicine(id, req.user!.id);
      return sendSuccess(res, null, 'Medicine deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const medicineController = new MedicineController();
