import { medicineRepository } from '../repositories/medicine.repository';
import { scheduleRepository } from '../repositories/schedule.repository';
import { medicationLogRepository } from '../repositories/medicationLog.repository';
import { FrequencyType } from '../types';
import { getWallClockTime } from '../utils/date';

export class MedicineService {
  async getMedicinesByPatient(patientId: string) {
    return medicineRepository.findByPatientId(patientId);
  }

  async getMedicineById(id: string, patientId: string) {
    const medicine = await medicineRepository.findByIdAndPatientId(id, patientId);
    if (!medicine) {
      throw new Error('Medicine not found or access denied.');
    }
    return medicine;
  }

  async createMedicine(
    patientId: string,
    data: {
      name: string;
      genericName?: string | null;
      dosage: string;
      dosageUnit: string;
      medicineType: string;
      instructions?: string | null;
      startDate: string;
      endDate?: string | null;
      notes?: string | null;
      schedules: Array<{
        scheduleTime: string; // HH:MM or HH:MM:SS
        frequencyType?: FrequencyType;
        daysOfWeek?: string | null;
      }>;
    }
  ) {
    // 1. Create Medicine record
    const medicine = await medicineRepository.create({
      patient_id: patientId,
      name: data.name,
      generic_name: data.genericName,
      dosage: data.dosage,
      dosage_unit: data.dosageUnit,
      medicine_type: data.medicineType,
      instructions: data.instructions,
      start_date: new Date(data.startDate),
      end_date: data.endDate ? new Date(data.endDate) : null,
      notes: data.notes,
    });

    // 2. Create Schedules
    const createdSchedules = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const sched of data.schedules) {
      // Normalize time to a valid Date object for Prisma Time mapping
      const timeParts = sched.scheduleTime.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const timeDate = new Date('1970-01-01T00:00:00Z');
      timeDate.setUTCHours(hours, minutes, 0, 0);

      const schedule = await scheduleRepository.create({
        medicine_id: medicine.id,
        schedule_time: timeDate,
        frequency_type: sched.frequencyType || 'DAILY',
        days_of_week: sched.daysOfWeek || 'MON,TUE,WED,THU,FRI,SAT,SUN',
      });
      createdSchedules.push(schedule);

      // Create initial today log only if today is within start_date and end_date
      const startDateLocal = new Date(medicine.start_date).toISOString().split('T')[0];
      const endDateLocal = medicine.end_date ? new Date(medicine.end_date).toISOString().split('T')[0] : null;
      const todayLocal = getWallClockTime().toISOString().split('T')[0];

      if (startDateLocal <= todayLocal && (!endDateLocal || endDateLocal >= todayLocal)) {
        await medicationLogRepository.upsertLog({
          patient_id: patientId,
          medicine_id: medicine.id,
          schedule_id: schedule.id,
          scheduled_date: today,
          scheduled_time: timeDate,
        });
      }
    }

    return {
      ...medicine,
      schedules: createdSchedules,
    };
  }

  async updateMedicine(
    id: string,
    patientId: string,
    data: {
      name?: string;
      genericName?: string | null;
      dosage?: string;
      dosageUnit?: string;
      medicineType?: string;
      instructions?: string | null;
      startDate?: string;
      endDate?: string | null;
      notes?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await medicineRepository.findByIdAndPatientId(id, patientId);
    if (!existing) {
      throw new Error('Medicine not found or access denied.');
    }

    return medicineRepository.update(id, {
      ...(data.name && { name: data.name }),
      ...(data.genericName !== undefined && { generic_name: data.genericName }),
      ...(data.dosage && { dosage: data.dosage }),
      ...(data.dosageUnit && { dosage_unit: data.dosageUnit }),
      ...(data.medicineType && { medicine_type: data.medicineType }),
      ...(data.instructions !== undefined && { instructions: data.instructions }),
      ...(data.startDate && { start_date: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { end_date: data.endDate ? new Date(data.endDate) : null }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.isActive !== undefined && { is_active: data.isActive }),
    });
  }

  async deleteMedicine(id: string, patientId: string) {
    const existing = await medicineRepository.findByIdAndPatientId(id, patientId);
    if (!existing) {
      throw new Error('Medicine not found or access denied.');
    }

    return medicineRepository.delete(id);
  }
}

export const medicineService = new MedicineService();
