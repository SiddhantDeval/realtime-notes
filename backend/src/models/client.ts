import { PrismaClient } from 'prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { databaseConfig } from '@/config'

const omitConfig = {
    user: { password: true },
} as const

const DATABASE_URL = databaseConfig.url

const adapter = new PrismaPg({
    connectionString: DATABASE_URL,
})
const prisma = new PrismaClient({
    omit: omitConfig,
    adapter,
})

export default prisma

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})
