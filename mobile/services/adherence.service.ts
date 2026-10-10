import { apiClient } from './api';
import { AdherenceData, NotificationItem } from '../types';

export const AdherenceService = {
  async getToday(): Promise<AdherenceData> {
    const res = await apiClient.get('/adherence/today');
    return res.data.data;
  },

  async getWeekly(): Promise<AdherenceData> {
    const res = await apiClient.get('/adherence/weekly');
    return res.data.data;
  },

  async getMonthly(): Promise<AdherenceData> {
    const res = await apiClient.get('/adherence/monthly');
    return res.data.data;
  },
};

export const NotificationApiService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await apiClient.get('/notifications');
    return res.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async registerDevice(pushToken: string, platform: 'ANDROID' | 'IOS' | 'WEB'): Promise<void> {
    await apiClient.post('/devices/register', { pushToken, platform });
  },
};
