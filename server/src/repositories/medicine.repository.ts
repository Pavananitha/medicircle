import { prisma } from '../config/prisma';

export class MedicineRepository {
  async findByPatientId(patientId: string) {
    return prisma.medicine.findMany({
      where: { patient_id: patientId },
      include: {
        schedules: {
          where: { is_active: true },
          orderBy: { schedule_time: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.medicine.findUnique({
      where: { id },
      include: {
        schedules: {
          orderBy: { schedule_time: 'asc' },
        },
      },
    });
  }

  async findByIdAndPatientId(id: string, patientId: string) {
    return prisma.medicine.findFirst({
      where: { id, patient_id: patientId },
      include: {
        schedules: {
          orderBy: { schedule_time: 'asc' },
        },
      },
    });
  }

  async create(data: {
    patient_id: string;
    name: string;
    generic_name?: string | null;
    dosage: string;
    dosage_unit: string;
    medicine_type: string;
    instructions?: string | null;
    start_date: Date;
    end_date?: Date | null;
    notes?: string | null;
  }) {
    return prisma.medicine.create({
      data,
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    generic_name: string | null;
    dosage: string;
    dosage_unit: string;
    medicine_type: string;
    instructions: string | null;
    start_date: Date;
    end_date: Date | null;
    notes: string | null;
    is_active: boolean;
  }>) {
    return prisma.medicine.update({
      where: { id },
      data,
      include: {
        schedules: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.medicine.delete({
      where: { id },
    });
  }
}

export const medicineRepository = new MedicineRepository();
