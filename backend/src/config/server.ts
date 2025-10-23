import { env } from './env'

export const serverConfig = {
    port: Number(env.PORT ?? 4000) ,
    env: env.NODE_ENV,
}
