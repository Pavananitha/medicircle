import { z } from 'zod';

export const createScheduleSchema = z.object({
  scheduleTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Invalid time format (HH:MM or HH:MM:SS)'),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'SPECIFIC_DAYS']).default('DAILY'),
  daysOfWeek: z.string().optional().nullable(),
});

export const updateScheduleSchema = z.object({
  scheduleTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).optional(),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'SPECIFIC_DAYS']).optional(),
  daysOfWeek: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});
