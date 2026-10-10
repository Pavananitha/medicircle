import { prisma } from '../config/prisma';
import { LogStatus } from '../types';

export class MedicationLogRepository {
  async findById(id: string) {
    return prisma.medicationLog.findUnique({
      where: { id },
      include: {
        medicine: true,
        schedule: true,
      },
    });
  }

  async findByPatientAndDateRange(patientId: string, startDate: Date, endDate: Date) {
    return prisma.medicationLog.findMany({
      where: {
        patient_id: patientId,
        scheduled_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        medicine: true,
        schedule: true,
      },
      orderBy: [
        { scheduled_date: 'desc' },
        { scheduled_time: 'asc' },
      ],
    });
  }

  async findTodayLogs(patientId: string, todayDate: Date) {
    return prisma.medicationLog.findMany({
      where: {
        patient_id: patientId,
        scheduled_date: todayDate,
      },
      include: {
        medicine: true,
        schedule: true,
      },
      orderBy: { scheduled_time: 'asc' },
    });
  }

  async updateStatus(id: string, status: LogStatus, actionTime?: Date) {
    return prisma.medicationLog.update({
      where: { id },
      data: {
        status,
        action_time: actionTime || (status === 'TAKEN' || status === 'SKIPPED' ? new Date() : null),
      },
      include: {
        medicine: true,
        schedule: true,
      },
    });
  }

  async upsertLog(data: {
    patient_id: string;
    medicine_id: string;
    schedule_id: string;
    scheduled_date: Date;
    scheduled_time: Date;
    status?: LogStatus;
  }) {
    return prisma.medicationLog.upsert({
      where: {
        uq_medication_log_occurrence: {
          patient_id: data.patient_id,
          medicine_id: data.medicine_id,
          schedule_id: data.schedule_id,
          scheduled_date: data.scheduled_date,
          scheduled_time: data.scheduled_time,
        },
      },
      update: {},
      create: {
        patient_id: data.patient_id,
        medicine_id: data.medicine_id,
        schedule_id: data.schedule_id,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        status: data.status || 'PENDING',
      },
      include: {
        medicine: true,
        schedule: true,
      },
    });
  }

  async findPendingExpiredLogs(thresholdDateTime: Date, todayDate: Date) {
    return prisma.medicationLog.findMany({
      where: {
        status: 'PENDING',
        scheduled_date: {
          lte: todayDate,
        },
      },
      include: {
        medicine: true,
        schedule: true,
        patient: {
          select: {
            id: true,
            name: true,
            caregiver_connections_as_patient: {
              where: { status: 'ACTIVE' },
              include: {
                caregiver: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

export const medicationLogRepository = new MedicationLogRepository();
