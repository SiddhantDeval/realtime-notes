import { PrismaClient } from '@prisma/client'

const omitConfig = {
    user: { password: true },
} as const

const prisma = new PrismaClient({ omit: omitConfig })

export default prisma

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})
