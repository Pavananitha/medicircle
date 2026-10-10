export type Role = 'PATIENT' | 'CAREGIVER';

export type FrequencyType = 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';

export type LogStatus = 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED';

export type ConnectionStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REMOVED';

export type NotificationType =
  | 'MEDICINE_REMINDER'
  | 'MISSED_DOSE'
  | 'CAREGIVER_REQUEST'
  | 'CAREGIVER_APPROVED'
  | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  date_of_birth?: string | null;
  gender?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  profile_image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineSchedule {
  id: string;
  medicine_id: string;
  schedule_time: string; // ISO or HH:mm:ss
  frequency_type: FrequencyType;
  days_of_week?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  patient_id: string;
  name: string;
  generic_name?: string | null;
  dosage: string;
  dosage_unit: string;
  medicine_type: string;
  instructions?: string | null;
  start_date: string;
  end_date?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  schedules?: MedicineSchedule[];
}

export interface MedicationLog {
  id: string;
  patient_id: string;
  medicine_id: string;
  schedule_id: string;
  scheduled_date: string;
  scheduled_time: string;
  action_time?: string | null;
  status: LogStatus;
  created_at: string;
  updated_at: string;
  medicine?: Medicine;
  schedule?: MedicineSchedule;
}

export interface CaregiverConnection {
  id: string;
  patient_id: string;
  caregiver_id: string;
  status: ConnectionStatus;
  requested_at: string;
  approved_at?: string | null;
  removed_at?: string | null;
  created_at: string;
  updated_at: string;
  patient?: User;
  caregiver?: User;
}

export interface ConnectionCode {
  id: string;
  patient_id: string;
  code: string;
  expires_at: string;
  used_at?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AdherenceData {
  period: 'today' | 'weekly' | 'monthly';
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  skippedDoses: number;
  pendingDoses: number;
  percentage: number;
  disclaimer: string;
}
