import { medicationLogRepository } from '../repositories/medicationLog.repository';
import { medicineRepository } from '../repositories/medicine.repository';
import { LogStatus } from '../types';

export class MedicationLogService {
  async ensureTodayLogs(patientId: string) {
    const now = new Date();
    // 1. Get exact local date string (e.g. '2026-10-08')
    const todayLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    
    // 2. Create a Date object forced to UTC midnight of that local date.
    // This prevents Prisma from shifting 00:00 IST to 18:30 UTC the day prior.
    const todayPrisma = new Date(todayLocal + 'T00:00:00.000Z');

    const medicines = await medicineRepository.findByPatientId(patientId);
    for (const med of medicines) {
      if (!med.is_active) continue;
      
      const startDateLocal = med.start_date.toISOString().split('T')[0];
      const endDateLocal = med.end_date ? med.end_date.toISOString().split('T')[0] : null;

      // Check date bounds using strings
      if (startDateLocal > todayLocal) continue;
      if (endDateLocal && endDateLocal < todayLocal) continue;

      for (const sched of med.schedules) {
        if (!sched.is_active) continue;

        await medicationLogRepository.upsertLog({
          patient_id: patientId,
          medicine_id: med.id,
          schedule_id: sched.id,
          scheduled_date: todayPrisma,
          scheduled_time: sched.schedule_time,
          status: 'PENDING',
        });
      }
    }
  }

  async getTodayLogs(patientId: string) {
    await this.ensureTodayLogs(patientId);
    const now = new Date();
    const todayLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const todayPrisma = new Date(todayLocal + 'T00:00:00.000Z');
    
    return medicationLogRepository.findTodayLogs(patientId, todayPrisma);
  }

  async getHistoryLogs(patientId: string, days = 30) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return medicationLogRepository.findByPatientAndDateRange(patientId, startDate, today);
  }

  async getAllLogs(patientId: string) {
    return this.getHistoryLogs(patientId, 90);
  }

  async markTaken(logId: string, patientId: string) {
    const log = await medicationLogRepository.findById(logId);
    if (!log || log.patient_id !== patientId) {
      throw new Error('Medication log not found or unauthorized.');
    }

    return medicationLogRepository.updateStatus(logId, 'TAKEN');
  }

  async markSkipped(logId: string, patientId: string) {
    const log = await medicationLogRepository.findById(logId);
    if (!log || log.patient_id !== patientId) {
      throw new Error('Medication log not found or unauthorized.');
    }

    return medicationLogRepository.updateStatus(logId, 'SKIPPED');
  }
}

export const medicationLogService = new MedicationLogService();
