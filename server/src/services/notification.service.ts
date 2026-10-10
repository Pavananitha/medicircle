import { notificationRepository } from '../repositories/notification.repository';
import { NotificationType, PlatformType as Platform } from '../types';

export class NotificationService {
  async getUserNotifications(userId: string) {
    return notificationRepository.findByUserId(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async deleteNotification(notificationId: string, userId: string) {
    return notificationRepository.deleteNotification(notificationId, userId);
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityId?: string | null;
  }) {
    return notificationRepository.create({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      related_entity_id: data.relatedEntityId,
    });
  }

  async registerDevice(userId: string, pushToken: string, platform: Platform) {
    return notificationRepository.registerDevice(userId, pushToken, platform);
  }
}

export const notificationService = new NotificationService();
