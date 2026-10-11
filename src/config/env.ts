import { z } from 'zod'

const envSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default('React Starter Kit'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000/api/v1'),
  VITE_APP_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

const parsedEnv = envSchema.safeParse(import.meta.env)

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration: ${parsedEnv.error.message}`,
  )
}

export const env = Object.freeze({
  appName: parsedEnv.data.VITE_APP_NAME,
  apiBaseUrl: parsedEnv.data.VITE_API_BASE_URL,
  appEnv: parsedEnv.data.VITE_APP_ENV,
  enableMocks: parsedEnv.data.VITE_ENABLE_MOCKS,
})
