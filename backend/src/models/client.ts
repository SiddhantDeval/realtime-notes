import { PrismaClient } from '../../generated/prisma/client'

const prisma =  new PrismaClient()

export default prisma

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})
