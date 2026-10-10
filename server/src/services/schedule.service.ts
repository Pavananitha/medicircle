import { scheduleRepository } from '../repositories/schedule.repository';
import { medicineRepository } from '../repositories/medicine.repository';
import { FrequencyType } from '../types';

export class ScheduleService {
  async getSchedulesByMedicine(medicineId: string, patientId: string) {
    const medicine = await medicineRepository.findByIdAndPatientId(medicineId, patientId);
    if (!medicine) {
      throw new Error('Medicine not found or access denied.');
    }
    return scheduleRepository.findByMedicineId(medicineId);
  }

  async createSchedule(
    medicineId: string,
    patientId: string,
    data: {
      scheduleTime: string;
      frequencyType?: FrequencyType;
      daysOfWeek?: string | null;
    }
  ) {
    const medicine = await medicineRepository.findByIdAndPatientId(medicineId, patientId);
    if (!medicine) {
      throw new Error('Medicine not found or access denied.');
    }

    const timeParts = data.scheduleTime.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const timeDate = new Date('1970-01-01T00:00:00Z');
    timeDate.setUTCHours(hours, minutes, 0, 0);

    return scheduleRepository.create({
      medicine_id: medicineId,
      schedule_time: timeDate,
      frequency_type: data.frequencyType || 'DAILY',
      days_of_week: data.daysOfWeek || 'MON,TUE,WED,THU,FRI,SAT,SUN',
    });
  }

  async updateSchedule(
    scheduleId: string,
    patientId: string,
    data: {
      scheduleTime?: string;
      frequencyType?: FrequencyType;
      daysOfWeek?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await scheduleRepository.findById(scheduleId);
    if (!existing || existing.medicine.patient_id !== patientId) {
      throw new Error('Schedule not found or unauthorized.');
    }

    let timeDate: Date | undefined;
    if (data.scheduleTime) {
      const timeParts = data.scheduleTime.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      timeDate = new Date('1970-01-01T00:00:00Z');
      timeDate.setUTCHours(hours, minutes, 0, 0);
    }

    return scheduleRepository.update(scheduleId, {
      ...(timeDate && { schedule_time: timeDate }),
      ...(data.frequencyType && { frequency_type: data.frequencyType }),
      ...(data.daysOfWeek !== undefined && { days_of_week: data.daysOfWeek }),
      ...(data.isActive !== undefined && { is_active: data.isActive }),
    });
  }

  async deleteSchedule(scheduleId: string, patientId: string) {
    const existing = await scheduleRepository.findById(scheduleId);
    if (!existing || existing.medicine.patient_id !== patientId) {
      throw new Error('Schedule not found or unauthorized.');
    }

    return scheduleRepository.delete(scheduleId);
  }
}

export const scheduleService = new ScheduleService();
