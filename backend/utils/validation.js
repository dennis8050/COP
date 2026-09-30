import { z } from 'zod';
import { HttpError } from './http.js';

export const memberSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.union([z.string().email().max(320), z.literal('')]).optional().nullable(),
  phone: z.union([z.string().trim().min(7).max(40), z.literal('')]).optional().nullable(),
  date_of_birth: z.string().date().optional().nullable(),
  address: z.string().max(2000).optional().nullable(),
  gender: z.string().max(32).optional().nullable(),
  membership_date: z.string().date(),
  status: z.enum(['active','inactive']).default('active')
});

export const attendanceSchema = z.object({
  member_id: z.string().uuid(),
  attendance_date: z.string().date(),
  service_type: z.string().trim().min(1).max(100).default('Sunday Service'),
  status: z.enum(['present','absent','excused'])
});

export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(400, result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  }
  return result.data;
}
