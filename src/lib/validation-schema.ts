import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, 'Old password must be at least 6 characters'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'New passwords do not match',
  });

export const changeNameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const changeEmailSchema = z.object({
  email: z.email('Invalid email format'),
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type ChangeNameForm = z.infer<typeof changeNameSchema>;
export type ChangeEmailForm = z.infer<typeof changeEmailSchema>;
