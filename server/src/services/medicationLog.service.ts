import { medicationLogRepository } from '../repositories/medicationLog.repository';
import { medicineRepository } from '../repositories/medicine.repository';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { LogStatus } from '../types';
import { getWallClockTime } from '../utils/date';
import { checkAndProcessMissedDoses } from '../cron/missedDose.cron';

export class MedicationLogService {
  async ensureLogsForDateRange(patientId: string, days = 30) {
    const localWallClock = getWallClockTime();
    const todayLocal = localWallClock.toISOString().split('T')[0];

    const medicines = await medicineRepository.findByPatientId(patientId);

    for (const med of medicines) {
      const startDateLocal = med.start_date.toISOString().split('T')[0];
      const endDateLocal = med.end_date ? med.end_date.toISOString().split('T')[0] : null;

      // Clean up invalid logs recorded before start_date
      await prisma.medicationLog.deleteMany({
        where: {
          patient_id: patientId,
          medicine_id: med.id,
          scheduled_date: {
            lt: new Date(startDateLocal + 'T00:00:00.000Z'),
          },
        },
      });

      // Clean up invalid logs recorded after end_date
      if (endDateLocal) {
        await prisma.medicationLog.deleteMany({
          where: {
            patient_id: patientId,
            medicine_id: med.id,
            scheduled_date: {
              gt: new Date(endDateLocal + 'T23:59:59.999Z'),
            },
          },
        });
      }

      if (!med.is_active) continue;

      // Populate logs for each day from (today - days) to today
      for (let i = days; i >= 0; i--) {
        const d = new Date(localWallClock);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const dayPrisma = new Date(dayStr + 'T00:00:00.000Z');

        // Check if date is within medicine bounds
        if (dayStr < startDateLocal) continue;
        if (endDateLocal && dayStr > endDateLocal) continue;

        // Check day of week matching
        const dayOfWeekNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const dayName = dayOfWeekNames[d.getDay()];

        for (const sched of med.schedules) {
          if (!sched.is_active) continue;

          if (sched.frequency_type === 'SPECIFIC_DAYS' && sched.days_of_week) {
            const allowedDays = sched.days_of_week.split(',').map((s: string) => s.trim().toUpperCase());
            if (!allowedDays.includes(dayName)) continue;
          }

          // Construct target time to determine if already in the past
          const timeStr = sched.schedule_time.toISOString().split('T')[1];
          const targetTime = new Date(`${dayStr}T${timeStr}`);
          const graceMs = (config.missedDoseGracePeriodMinutes || 30) * 60000;
          const expiryTime = new Date(targetTime.getTime() + graceMs);

          // If in the past beyond grace period -> MISSED, otherwise PENDING
          const initialStatus: LogStatus = localWallClock > expiryTime ? 'MISSED' : 'PENDING';

          await medicationLogRepository.upsertLog({
            patient_id: patientId,
            medicine_id: med.id,
            schedule_id: sched.id,
            scheduled_date: dayPrisma,
            scheduled_time: sched.schedule_time,
            status: initialStatus,
          });
        }
      }
    }

    // Process any pending doses that have expired or missed doses needing alerts
    await checkAndProcessMissedDoses();
  }

  async ensureTodayLogs(patientId: string) {
    return this.ensureLogsForDateRange(patientId, 1);
  }

  async getTodayLogs(patientId: string) {
    await this.ensureTodayLogs(patientId);
    const todayLocal = getWallClockTime().toISOString().split('T')[0];
    const todayPrisma = new Date(todayLocal + 'T00:00:00.000Z');

    return medicationLogRepository.findTodayLogs(patientId, todayPrisma);
  }

  async getHistoryLogs(patientId: string, days = 30) {
    await this.ensureLogsForDateRange(patientId, days);
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
