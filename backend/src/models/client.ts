import { PrismaClient } from '@prisma-client/prisma'

const omitConfig = {
    user: { password_hash: true },
} as const

const prisma = new PrismaClient({ omit: omitConfig })

export default prisma

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})
