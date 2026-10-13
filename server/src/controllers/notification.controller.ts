import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { notificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';
import { PlatformType as Platform } from '../types';

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.id);
      return sendSuccess(res, notifications);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id, req.user!.id);
      return sendSuccess(res, null, 'Notification marked as read');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(id, req.user!.id);
      return sendSuccess(res, null, 'Notification deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async registerDevice(req: AuthenticatedRequest, res: Response) {
    try {
      const { pushToken, platform } = req.body;
      if (!pushToken) {
        return sendError(res, 'Push token is required', 400);
      }
      const devicePlatform = (platform?.toUpperCase() || 'ANDROID') as Platform;
      const device = await notificationService.registerDevice(req.user!.id, pushToken, devicePlatform);
      return sendSuccess(res, device, 'Device registered successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}

export const notificationController = new NotificationController();
