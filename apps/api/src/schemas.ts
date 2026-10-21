import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['receptionist', 'manager', 'admin']).default('receptionist'),
});

export const EnquiryCreateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional(),
  preferredContactMethod: z.enum(['email', 'phone']).default('email'),
  preferredContactTime: z.string().max(100).optional(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  treatmentId: z.string().uuid('Invalid treatment ID').optional(),
  message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional(),
  // Zod v4 syntax for custom validation messages on literals:
  consentGranted: z.literal(true, {
    message: 'You must grant consent to submit an enquiry',
  }),
});

export const EnquiryStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'follow_up_required', 'appointment_requested', 'converted', 'closed']),
});