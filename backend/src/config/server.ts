import { CorsOptions } from 'cors'
import { env } from './env'

const ALLOWED_ORIGINS: string[] = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : []
interface ServerConfig {
    port: number
    env: string
    cors: CorsOptions
}

export const serverConfig: ServerConfig = {
    port: Number(env.PORT ?? 4000),
    env: env.NODE_ENV ?? 'development',
    cors: {
        origin(origin, cb) {
            if (env.NODE_ENV === 'production') {
                if (!origin || ALLOWED_ORIGINS.indexOf(origin) === -1) {
                    const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
                    return cb(new Error(msg), false)
                }
                return cb(null, true)
            }
            return cb(null, true)
        },
        credentials: true, // required if you use cookies/auth
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        exposedHeaders: ['Content-Length', 'X-Request-Id'],
        optionsSuccessStatus: 204,
    },
}
