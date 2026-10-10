import { apiClient } from './api';
import { CaregiverConnection, ConnectionCode, User, Medicine, MedicationLog } from '../types';

export const CaregiverService = {
  // Patient code generation
  async generateCode(): Promise<ConnectionCode> {
    const res = await apiClient.post('/caregiver/code');
    return res.data.data;
  },

  // Connections list
  async getConnections(): Promise<CaregiverConnection[]> {
    const res = await apiClient.get('/caregiver/connections');
    return res.data.data;
  },

  // Caregiver connects with code
  async connectWithCode(code: string): Promise<CaregiverConnection> {
    const res = await apiClient.post('/caregiver/connect', { code });
    return res.data.data;
  },

  // Patient approvals
  async approveConnection(connectionId: string): Promise<CaregiverConnection> {
    const res = await apiClient.post(`/caregiver/connections/${connectionId}/approve`);
    return res.data.data;
  },

  async rejectConnection(connectionId: string): Promise<CaregiverConnection> {
    const res = await apiClient.post(`/caregiver/connections/${connectionId}/reject`);
    return res.data.data;
  },

  async removeConnection(connectionId: string): Promise<void> {
    await apiClient.delete(`/caregiver/connections/${connectionId}`);
  },

  // Caregiver Patient Views (Read-only)
  async getConnectedPatients(): Promise<User[]> {
    const res = await apiClient.get('/caregiver/patients');
    return res.data.data;
  },

  async getPatientDetails(patientId: string): Promise<User> {
    const res = await apiClient.get(`/caregiver/patients/${patientId}`);
    return res.data.data;
  },

  async getPatientMedications(patientId: string): Promise<Medicine[]> {
    const res = await apiClient.get(`/caregiver/patients/${patientId}/medications`);
    return res.data.data;
  },

  async getPatientHistory(patientId: string, days = 30): Promise<MedicationLog[]> {
    const res = await apiClient.get(`/caregiver/patients/${patientId}/history?days=${days}`);
    return res.data.data;
  },

  async getPatientAdherence(patientId: string): Promise<any> {
    const res = await apiClient.get(`/caregiver/patients/${patientId}/adherence`);
    return res.data.data;
  },
};
