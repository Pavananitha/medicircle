import { medicationLogRepository } from '../repositories/medicationLog.repository';

export interface AdherenceStats {
  period: 'today' | 'weekly' | 'monthly';
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  pendingDoses: number;
  percentage: number;
  disclaimer: string;
}

const MEDICAL_DISCLAIMER =
  'MediCircle is a medication reminder and management application. It does not provide medical diagnosis, prescribe medication, or replace professional medical advice.';

export class AdherenceService {
  async calculateAdherence(patientId: string, days: number, periodName: 'today' | 'weekly' | 'monthly'): Promise<AdherenceStats> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(today.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const logs = await medicationLogRepository.findByPatientAndDateRange(patientId, startDate, today);

    let taken = 0;
    let missed = 0;
    let skipped = 0;
    let pending = 0;

    for (const log of logs) {
      if (log.status === 'TAKEN') taken++;
      else if (log.status === 'MISSED') missed++;
      else if (log.status === 'SKIPPED') skipped++;
      else if (log.status === 'PENDING') pending++;
    }

    // Only count completed/evaluated doses (taken, missed, skipped) or total scheduled evaluated
    const evaluatedTotal = taken + missed + skipped;
    const percentage = evaluatedTotal > 0 ? Math.round((taken / evaluatedTotal) * 100) : 100;

    return {
      period: periodName,
      totalDoses: logs.length,
      takenDoses: taken,
      missedDoses: missed,
      skippedDoses: skipped,
      pendingDoses: pending,
      percentage,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  async getTodayAdherence(patientId: string): Promise<AdherenceStats> {
    return this.calculateAdherence(patientId, 1, 'today');
  }

  async getWeeklyAdherence(patientId: string): Promise<AdherenceStats> {
    return this.calculateAdherence(patientId, 7, 'weekly');
  }

  async getMonthlyAdherence(patientId: string): Promise<AdherenceStats> {
    return this.calculateAdherence(patientId, 30, 'monthly');
  }
}

export const adherenceService = new AdherenceService();
