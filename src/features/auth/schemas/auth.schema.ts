import { z } from 'zod'

export const authUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  roles: z.array(z.string()),
})

export const authPayloadSchema = z.object({
  user: authUserSchema,
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.literal('Bearer'),
  expires_at: z.string().datetime(),
  refresh_expires_at: z.string().datetime(),
})

export const authResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.string(),
  data: authPayloadSchema,
})

export const loginFormSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.').max(128),
})

export const registerFormSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(120),
  username: z
    .string()
    .trim()
    .min(3, 'Username minimal 3 karakter.')
    .max(64)
    .toLowerCase()
    .optional()
    .or(z.literal('')),
  email: z.string().email('Format email tidak valid.').trim().toLowerCase(),
  password: z.string().min(8, 'Password minimal 8 karakter.').max(128),
})

export type AuthUser = z.infer<typeof authUserSchema>
export type AuthPayload = z.infer<typeof authPayloadSchema>
export type LoginFormInput = z.infer<typeof loginFormSchema>
export type RegisterFormInput = z.infer<typeof registerFormSchema>
