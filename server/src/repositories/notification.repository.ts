import { prisma } from '../config/prisma';
import { NotificationType, PlatformType as Platform } from '../types';

export class NotificationRepository {
  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, user_id: userId },
      data: { is_read: true },
    });
  }

  async deleteNotification(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, user_id: userId },
    });
  }

  async create(data: {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    related_entity_id?: string | null;
  }) {
    return prisma.notification.create({
      data,
    });
  }

  async registerDevice(userId: string, pushToken: string, platform: Platform) {
    return prisma.notificationDevice.upsert({
      where: {
        uq_user_device: {
          user_id: userId,
          push_token: pushToken,
        },
      },
      update: {
        platform,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        push_token: pushToken,
        platform,
      },
    });
  }

  async getUserDevices(userId: string) {
    return prisma.notificationDevice.findMany({
      where: { user_id: userId },
    });
  }
}

export const notificationRepository = new NotificationRepository();
