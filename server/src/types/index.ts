import { Request } from 'express';

export type Role = 'PATIENT' | 'CAREGIVER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, any>;
}

export type FrequencyType = 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';
export type LogStatus = 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED';
export type ConnectionStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'REMOVED';
export type NotificationType = 'MEDICINE_REMINDER' | 'MISSED_DOSE' | 'CAREGIVER_REQUEST' | 'CAREGIVER_APPROVED' | 'SYSTEM';
export type PlatformType = 'ANDROID' | 'IOS' | 'WEB';
