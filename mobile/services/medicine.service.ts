import { apiClient } from './api';
import { Medicine, MedicationLog } from '../types';

export const MedicineService = {
  // Medicines
  async getMedicines(): Promise<Medicine[]> {
    const res = await apiClient.get('/medicines');
    return res.data.data;
  },

  async getMedicineById(id: string): Promise<Medicine> {
    const res = await apiClient.get(`/medicines/${id}`);
    return res.data.data;
  },

  async createMedicine(data: any): Promise<Medicine> {
    const res = await apiClient.post('/medicines', data);
    return res.data.data;
  },

  async updateMedicine(id: string, data: any): Promise<Medicine> {
    const res = await apiClient.put(`/medicines/${id}`, data);
    return res.data.data;
  },

  async deleteMedicine(id: string): Promise<void> {
    await apiClient.delete(`/medicines/${id}`);
  },

  // Schedules
  async addSchedule(medicineId: string, data: { scheduleTime: string; frequencyType?: string; daysOfWeek?: string }): Promise<any> {
    const res = await apiClient.post(`/medicines/${medicineId}/schedules`, data);
    return res.data.data;
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    await apiClient.delete(`/schedules/${scheduleId}`);
  },

  // Medication Logs
  async getTodayLogs(): Promise<MedicationLog[]> {
    const res = await apiClient.get('/medication-logs/today');
    return res.data.data;
  },

  async getHistoryLogs(days = 30): Promise<MedicationLog[]> {
    const res = await apiClient.get(`/medication-logs/history?days=${days}`);
    return res.data.data;
  },

  async markTaken(logId: string): Promise<MedicationLog> {
    const res = await apiClient.post(`/medication-logs/${logId}/taken`);
    return res.data.data;
  },

  async markSkipped(logId: string): Promise<MedicationLog> {
    const res = await apiClient.post(`/medication-logs/${logId}/skipped`);
    return res.data.data;
  },
};
