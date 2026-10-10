import { prisma } from '../config/prisma';
import { FrequencyType } from '../types';

export class ScheduleRepository {
  async findByMedicineId(medicineId: string) {
    return prisma.medicineSchedule.findMany({
      where: { medicine_id: medicineId },
      orderBy: { schedule_time: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.medicineSchedule.findUnique({
      where: { id },
      include: {
        medicine: true,
      },
    });
  }

  async create(data: {
    medicine_id: string;
    schedule_time: Date;
    frequency_type: FrequencyType;
    days_of_week?: string | null;
  }) {
    return prisma.medicineSchedule.create({
      data,
    });
  }

  async update(id: string, data: Partial<{
    schedule_time: Date;
    frequency_type: FrequencyType;
    days_of_week: string | null;
    is_active: boolean;
  }>) {
    return prisma.medicineSchedule.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.medicineSchedule.delete({
      where: { id },
    });
  }
}

export const scheduleRepository = new ScheduleRepository();
