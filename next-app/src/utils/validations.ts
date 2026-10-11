import { z } from 'zod';

export const phoneRegex = /^\+91[6-9]\d{9}$/;

// Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase(),
  phone: z.string().regex(phoneRegex, 'Invalid Indian phone number. Must be +91 followed by 10 digits.'),
  password: z.string().regex(passwordRegex, 'Password must be at least 8 characters, and include uppercase, lowercase, number, and special character.'),
  confirmPassword: z.string(),
  notificationChannel: z.enum(['WHATSAPP', 'EMAIL']).default('WHATSAPP'),
  promoOptIn: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});
