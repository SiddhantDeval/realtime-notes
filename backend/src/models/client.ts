import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const omitConfig = {
    user: { password: true },
} as const

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ 
    omit: omitConfig,
    adapter
})

export default prisma

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})
