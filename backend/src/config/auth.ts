import { env } from './env'

export const authConfig = {
    jwtSecret: env.JWT_SECRET,
    jwtExpirationTime: env.JWT_EXPIRATION_TIME,
    jwtRefreshExpirationTime: env.JWT_REFRESH_EXPIRATION_TIME,
}
