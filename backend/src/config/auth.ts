export const authConfig = {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_TOKEN_EXPIRATION,
    jwtRefreshExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
}
