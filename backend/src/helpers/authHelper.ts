import jwt, {type SignOptions} from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { type User } from '@prisma-client/prisma'
import { authConfig } from '@/config'
import CustomError from './customError'
export default class AuthHelper {
    static jwtSecret = authConfig.jwtSecret
    static jwtExpiresIn = authConfig.jwtExpiresIn as SignOptions['expiresIn']
    static jwtRefreshExpiresIn = authConfig.jwtRefreshExpiresIn as SignOptions['expiresIn']

    static generateJwtToken = (user: Pick<User, 'id' | 'email'>) => {
        const token = jwt.sign({ userId: user.id, email: user.email }, AuthHelper.jwtSecret, {
            expiresIn: AuthHelper.jwtExpiresIn,
        })
        return token
    }
    static generateRefreshToken = (user: Pick<User, 'id' | 'email'>) => {
        const token = jwt.sign({ userId: user.id, email: user.email }, AuthHelper.jwtSecret, {
            expiresIn: AuthHelper.jwtRefreshExpiresIn,
        })
        return token
    }

    static verifyJwtToken = (token: string) => {
        try {
            const decoded = jwt.verify(token, AuthHelper.jwtSecret)
            return decoded as DECODED
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new CustomError('token_expired', 401, 'Token expired')
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new CustomError('invalid_token', 401, 'Invalid token')
            }
            throw new CustomError('failed_to_authenticate_token', 401, 'Failed to authenticate token')
        }
    }

    static decodeJwtToken = (token: string) => {
        try {
            const decoded = jwt.decode(token)
            return decoded
        } catch (_error) {
            return null
        }
    }
    static hashPassword = async (password: string) => {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = bcrypt.hash(password, salt)
        return hashedPassword
    }
    static comparePassword = (password: string, hashedPassword: string) => {
        const isPasswordValid = bcrypt.compare(password, hashedPassword)
        return isPasswordValid
    }
}
