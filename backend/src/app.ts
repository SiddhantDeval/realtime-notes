import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import passport from 'passport'
import { configurePassport } from '@/config/passport'
import { serverConfig } from '@/config'
import apiRoutes from '@/routes'
import cookieParser from 'cookie-parser'

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

    configurePassport()
    app.use(passport.initialize())

    app.use(cors(serverConfig?.cors ?? { origin: '*' }))

    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser())

    app.use((req: Request, _res: Response, next: NextFunction) => {
        logger.info(`${req.method} ${req.originalUrl}`)
        next()
    })

    const apiVersion = process.env.API_VERSION || 'v1'

    if (apiRoutes) {
        app.use('/health', (req, res) => res.json({ status: 'ok' }))
        app.use(`/api/${apiVersion}`, apiRoutes)
    } else {
        const router = express.Router()
        router.get('/health', (_req, res) => res.json({ status: 'ok' }))
        app.use(`/api/${apiVersion}`, router)
    }

    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Not Found' })
    })

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

export default createApp
