import { prisma } from '../config/prisma';
import { ConnectionStatus } from '../types';

export class CaregiverRepository {
  // Connection Codes
  async createConnectionCode(patientId: string, code: string, expiresAt: Date) {
    // Invalidate previous active codes for this patient
    await prisma.connectionCode.updateMany({
      where: { patient_id: patientId, is_active: true },
      data: { is_active: false },
    });

    return prisma.connectionCode.create({
      data: {
        patient_id: patientId,
        code,
        expires_at: expiresAt,
        is_active: true,
      },
    });
  }

  async findActiveCode(code: string) {
    return prisma.connectionCode.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        is_active: true,
        expires_at: { gt: new Date() },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async markCodeUsed(id: string) {
    return prisma.connectionCode.update({
      where: { id },
      data: {
        is_active: false,
        used_at: new Date(),
      },
    });
  }

  // Caregiver Connections
  async findConnectionsByPatient(patientId: string) {
    return prisma.caregiverConnection.findMany({
      where: { patient_id: patientId },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile_image_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findConnectionsByCaregiver(caregiverId: string) {
    return prisma.caregiverConnection.findMany({
      where: { caregiver_id: caregiverId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            date_of_birth: true,
            gender: true,
            emergency_contact_name: true,
            emergency_contact_phone: true,
            profile_image_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findActiveConnection(patientId: string, caregiverId: string) {
    return prisma.caregiverConnection.findFirst({
      where: {
        patient_id: patientId,
        caregiver_id: caregiverId,
        status: 'ACTIVE',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            date_of_birth: true,
            gender: true,
            emergency_contact_name: true,
            emergency_contact_phone: true,
            profile_image_url: true,
          },
        },
      },
    });
  }

  async findConnection(patientId: string, caregiverId: string) {
    return prisma.caregiverConnection.findUnique({
      where: {
        uq_patient_caregiver: {
          patient_id: patientId,
          caregiver_id: caregiverId,
        },
      },
    });
  }

  async createConnection(patientId: string, caregiverId: string) {
    return prisma.caregiverConnection.create({
      data: {
        patient_id: patientId,
        caregiver_id: caregiverId,
        status: 'PENDING',
      },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
        caregiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateConnectionStatus(id: string, status: ConnectionStatus) {
    return prisma.caregiverConnection.update({
      where: { id },
      data: {
        status,
        ...(status === 'ACTIVE' && { approved_at: new Date() }),
        ...(status === 'REMOVED' && { removed_at: new Date() }),
      },
    });
  }

  async deleteConnection(id: string) {
    return prisma.caregiverConnection.delete({
      where: { id },
    });
  }

  async findConnectionById(id: string) {
    return prisma.caregiverConnection.findUnique({
      where: { id },
      include: {
        patient: true,
        caregiver: true,
      },
    });
  }
}

export const caregiverRepository = new CaregiverRepository();
