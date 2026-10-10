import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(res: Response, data?: T, message?: string, statusCode = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(res: Response, error: string | Record<string, any>, statusCode = 400, message?: string) {
  const payload: ApiResponse = {
    success: false,
    message: message || (typeof error === 'string' ? error : 'An error occurred'),
    error,
  };
  return res.status(statusCode).json(payload);
}
