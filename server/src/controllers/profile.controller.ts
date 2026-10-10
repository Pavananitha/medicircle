import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { profileService } from '../services/profile.service';
import { sendSuccess, sendError } from '../utils/response';

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await profileService.getProfile(req.user!.id);
      return sendSuccess(res, profile);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await profileService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const profileController = new ProfileController();
