import dotenv from 'dotenv'
// import { z } from 'zod'

// Determine the environment
const environment = process.env.NODE_ENV || 'development'
// Loads from .env file
dotenv.config({ path: `.env.${environment}` })


// const envSchema = z.object({
//     NODE_ENV: z.enum(['development', 'production', 'test']),
//     PORT: z.string().default('4000'),
//     DATABASE_URL: z.string().url(),
//     JWT_SECRET: z.string(),
//     JWT_EXPIRES_IN: z.string().default('1h'),
//     SMTP_HOST: z.string().optional(),
//     SMTP_USER: z.string().optional(),
//     SMTP_PASS: z.string().optional(),
// })

// export const env = envSchema.parse(process.env)

export const env = process.env
