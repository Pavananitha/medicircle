import { z } from 'zod';

export const connectCodeSchema = z.object({
  code: z.string().min(5, 'Connection code is required').max(20),
});
