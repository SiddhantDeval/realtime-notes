// What goes inside /config

// Here’s a breakdown of common files and what they manage:

// File	Purpose
// env.ts	Reads and validates environment variables (via dotenv / zod / joi)
// database.ts	Contains database connection settings (e.g., URL, pool size, Prisma config)
// server.ts	Port, host, CORS, rate-limit, logging, etc.
// auth.ts	JWT secrets, expiration times, OAuth keys
// mail.ts	SMTP credentials, mail templates directory
// index.ts	Aggregates and exports all configs as one object

export * from './database'
export * from './server'
export * from './auth'