import { z } from 'zod';

export const createMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').max(255),
  genericName: z.string().max(255).optional().nullable(),
  dosage: z.string().min(1, 'Dosage is required').max(100),
  dosageUnit: z.string().min(1, 'Dosage unit is required').max(50),
  medicineType: z.string().min(1, 'Medicine type is required').max(50),
  instructions: z.string().optional().nullable(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  schedules: z
    .array(
      z.object({
        scheduleTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Invalid time format (HH:MM or HH:MM:SS)'),
        frequencyType: z.enum(['DAILY', 'WEEKLY', 'SPECIFIC_DAYS']).default('DAILY'),
        daysOfWeek: z.string().optional().nullable(),
      })
    )
    .min(1, 'At least one schedule time is required'),
});

export const updateMedicineSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  genericName: z.string().max(255).optional().nullable(),
  dosage: z.string().min(1).max(100).optional(),
  dosageUnit: z.string().min(1).max(50).optional(),
  medicineType: z.string().min(1).max(50).optional(),
  instructions: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});
