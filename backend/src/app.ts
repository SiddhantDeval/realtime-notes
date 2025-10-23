import express, { Request, Response, NextFunction } from 'express'
// import helmet from 'helmet'
// import cors from 'cors'
// import compression from 'compression'

// NOTE: Expect this file to export at least { serverConfig }
// e.g. export const serverConfig = { port: 4000, env: 'development' }
import { serverConfig } from '@/config'

// Example route imports (adjust to your project)
import apiRoutes from '@/routes' // your router that mounts /api/v1
// If you don't have ./routes, replace with a simple router below

// Simple structured logger - replace with pino/winston as needed
const logger = {
    info: (...args: any[]) => console.log('[info]', ...args),
    warn: (...args: any[]) => console.warn('[warn]', ...args),
    error: (...args: any[]) => console.error('[error]', ...args),
    debug: (...args: any[]) => {
        if ((serverConfig?.env ?? process.env.NODE_ENV) !== 'production') {
            console.debug('[debug]', ...args)
        }
    },
}

export function createApp() {
    const app = express()

    // Security, compression, CORS
    // app.use(helmet())
    // app.use(compression())
    // app.use(cors(serverConfig?.cors ?? { origin: '*' }))

    // Body parsers
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true }))

    // Simple request logger (for dev)
    app.use((req: Request, _res: Response, next: NextFunction) => {
        logger.info(`${req.method} ${req.originalUrl}`)
        next()
    })

    // Mount API routes. If you don't have a routes file, create a quick example below.
    if (apiRoutes) {
        app.use('/api/v1', apiRoutes)
    } else {
        const router = express.Router()
        router.get('/health', (_req, res) => res.json({ status: 'ok' }))
        app.use('/api/v1', router)
    }

    // 404 handler
    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Not Found' })
    })

    // Central error handler
    // Keep signature with 4 args so Express recognizes it as error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        logger.error('Unhandled error in request handler:', err?.message ?? err)
        const status = err?.statusCode || err?.status || 500
        const payload: any = { error: err?.message || 'Internal Server Error' }
        if (serverConfig?.env !== 'production') {
            payload.stack = err?.stack
            payload.meta = err?.meta
        }
        res.status(status).json(payload)
    })

    return app
}

// export default createApp if you prefer default export
export default createApp
