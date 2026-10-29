import { caregiverRepository } from '../repositories/caregiver.repository';
import { medicineRepository } from '../repositories/medicine.repository';
import { medicationLogRepository } from '../repositories/medicationLog.repository';
import { medicationLogService } from './medicationLog.service';
import { notificationRepository } from '../repositories/notification.repository';
import { ConnectionStatus, NotificationType, Role } from '../types';
import { getWallClockTime } from '../utils/date';
import crypto from 'crypto';

export class CaregiverService {
  // Generate random 5-character alphanumeric connection code: e.g., MC-8F4K2
  async generateConnectionCode(patientId: string) {
    const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 5);
    const code = `MC-${randomChars}`;

    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return caregiverRepository.createConnectionCode(patientId, code, expiresAt);
  }

  async getConnections(userId: string, role: Role) {
    if (role === 'PATIENT') {
      return caregiverRepository.findConnectionsByPatient(userId);
    } else {
      return caregiverRepository.findConnectionsByCaregiver(userId);
    }
  }

  async connectWithCode(caregiverId: string, code: string) {
    const codeRecord = await caregiverRepository.findActiveCode(code);
    if (!codeRecord) {
      throw new Error('Invalid or expired connection code.');
    }

    if (codeRecord.patient_id === caregiverId) {
      throw new Error('You cannot connect to yourself.');
    }

    // Check existing connection
    const existing = await caregiverRepository.findConnection(codeRecord.patient_id, caregiverId);
    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new Error('You are already connected to this patient.');
      }
      if (existing.status === 'PENDING') {
        throw new Error('A connection request is already pending approval.');
      }
      // If was rejected or removed, update to PENDING
      const updated = await caregiverRepository.updateConnectionStatus(existing.id, 'PENDING');
      await caregiverRepository.markCodeUsed(codeRecord.id);

      // Create notification for patient
      await notificationRepository.create({
        user_id: codeRecord.patient_id,
        type: 'CAREGIVER_REQUEST',
        title: 'New Caregiver Connection Request',
        message: 'A caregiver has requested to connect with your account using your connection code.',
        related_entity_id: updated.id,
      });

      return updated;
    }

    const connection = await caregiverRepository.createConnection(codeRecord.patient_id, caregiverId);
    await caregiverRepository.markCodeUsed(codeRecord.id);

    // Notify patient
    await notificationRepository.create({
      user_id: codeRecord.patient_id,
      type: 'CAREGIVER_REQUEST',
      title: 'New Caregiver Connection Request',
      message: `${connection.caregiver.name} has requested to connect as your caregiver.`,
      related_entity_id: connection.id,
    });

    return connection;
  }

  async approveConnection(connectionId: string, patientId: string) {
    const connection = await caregiverRepository.findConnectionById(connectionId);
    if (!connection || connection.patient_id !== patientId) {
      throw new Error('Connection request not found or unauthorized.');
    }

    const updated = await caregiverRepository.updateConnectionStatus(connectionId, 'ACTIVE');

    // Notify Caregiver
    await notificationRepository.create({
      user_id: connection.caregiver_id,
      type: 'CAREGIVER_APPROVED',
      title: 'Connection Approved',
      message: `${connection.patient.name} approved your caregiver connection request.`,
      related_entity_id: connection.id,
    });

    return updated;
  }

  async rejectConnection(connectionId: string, patientId: string) {
    const connection = await caregiverRepository.findConnectionById(connectionId);
    if (!connection || connection.patient_id !== patientId) {
      throw new Error('Connection request not found or unauthorized.');
    }

    return caregiverRepository.updateConnectionStatus(connectionId, 'REJECTED');
  }

  async removeConnection(connectionId: string, userId: string) {
    const connection = await caregiverRepository.findConnectionById(connectionId);
    if (!connection || (connection.patient_id !== userId && connection.caregiver_id !== userId)) {
      throw new Error('Connection not found or unauthorized.');
    }

    return caregiverRepository.updateConnectionStatus(connectionId, 'REMOVED');
  }

  // Caregiver Patient Access Methods (Enforces ACTIVE connection check)
  async verifyCaregiverAccess(patientId: string, caregiverId: string) {
    const connection = await caregiverRepository.findActiveConnection(patientId, caregiverId);
    if (!connection) {
      throw new Error('Access denied: You do not have an active caregiver connection with this patient.');
    }
    return connection;
  }

  async getConnectedPatients(caregiverId: string) {
    const connections = await caregiverRepository.findConnectionsByCaregiver(caregiverId);
    return connections
      .filter((c) => c.status === 'ACTIVE')
      .map((c) => c.patient);
  }

  async getPatientDetails(patientId: string, caregiverId: string) {
    await this.verifyCaregiverAccess(patientId, caregiverId);
    const connection = await caregiverRepository.findActiveConnection(patientId, caregiverId);
    return connection?.patient;
  }

  async getPatientMedications(patientId: string, caregiverId: string) {
    await this.verifyCaregiverAccess(patientId, caregiverId);
    return medicineRepository.findByPatientId(patientId);
  }

  async getPatientHistory(patientId: string, caregiverId: string, days = 30) {
    await this.verifyCaregiverAccess(patientId, caregiverId);
    await medicationLogService.ensureLogsForDateRange(patientId, days);
    
    // Fix timezone range for today
    const todayLocal = getWallClockTime().toISOString().split('T')[0];
    const startDate = new Date(todayLocal + 'T00:00:00.000Z');
    startDate.setDate(startDate.getDate() - days);
    
    const endDate = new Date(todayLocal + 'T23:59:59.999Z');

    return medicationLogRepository.findByPatientAndDateRange(patientId, startDate, endDate);
  }
}

export const caregiverService = new CaregiverService();
