import http from 'http'
import createApp from '@/app'
import { serverConfig } from '@/config'
import prisma from '@/models/client'

const app = createApp()
const server = http.createServer(app)

const PORT = serverConfig?.port ?? Number(process.env.PORT ?? 4000)
const ENV = serverConfig?.env ?? process.env.NODE_ENV ?? 'development'

const logger = {
    info: (...args: any[]) => console.log('[info]', ...args),
    warn: (...args: any[]) => console.warn('[warn]', ...args),
    error: (...args: any[]) => console.error('[error]', ...args),
}

let isShuttingDown = false

async function start() {
    try {
        // Connect Prisma (or any infra that must be ready before accepting requests)
        if (prisma?.$connect) {
            logger.info('Connecting to database...')
            await prisma.$connect()
            logger.info('Database connected')
        }

        server.listen(PORT, () => {
            logger.info(`Server listening on port ${PORT} (${ENV})`)
        })

        // Graceful shutdown handlers
        process.on('SIGINT', () => shutdown('SIGINT'))
        process.on('SIGTERM', () => shutdown('SIGTERM'))

        // Capture unhandled exceptions / rejections to log & shutdown gracefully
        process.on('uncaughtException', (err) => {
            logger.error('uncaughtException', err)
            // Attempt graceful shutdown, then exit 1
            shutdown('uncaughtException', err)
        })

        process.on('unhandledRejection', (reason) => {
            logger.error('unhandledRejection', reason)
            // You may choose to shutdown depending on severity
        })
    } catch (err) {
        logger.error('Failed to start server:', err)
        await forceExit(1)
    }
}

async function shutdown(signal?: string, err?: any) {
    if (isShuttingDown) return
    isShuttingDown = true

    logger.info(`Shutdown initiated${signal ? ` by ${signal}` : ''}`)
    if (err) {
        logger.error('Shutdown cause:', err)
    }

    // stop accepting new connections
    server.close(async (closeErr) => {
        if (closeErr) {
            logger.error('Error while closing HTTP server', closeErr)
        } else {
            logger.info('HTTP server closed')
        }

        // disconnect Prisma
        try {
            if (prisma?.$disconnect) {
                logger.info('Disconnecting database...')
                await prisma.$disconnect()
                logger.info('Database disconnected')
            }
        } catch (dbErr) {
            logger.error('Error disconnecting database', dbErr)
        }

        // All cleanup done — exit
        await forceExit(closeErr ? 1 : 0)
    })

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
        logger.warn('Forcing shutdown due to timeout')
        forceExit(1)
    }, 30_000).unref()
}

async function forceExit(code = 0) {
    try {
        // Allow logs to flush
        logger.info('Exiting process with code', code)
    } finally {
        // ensure immediate exit
        process.exit(code)
    }
}

// Start the server
start()
