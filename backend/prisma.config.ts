import dotenv from 'dotenv'
const environment = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${environment}` })
dotenv.config({ path: '.env' })

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: env('DATABASE_URL'),
    },
})
