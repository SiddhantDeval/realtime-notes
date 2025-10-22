import jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { type User } from '@prisma-client/prisma'

export default class AuthHelper {
    static secret = () => process.env.JWT_SECRET as string
    static jwtExpiratrionTime = () => Number(process.env.JWT_TOKEN_EXPIRATION)

    static generateJwtToken = (user: Pick<User, 'id' | 'email'>) => {
        const token = jwt.sign({ userId: user.id, email: user.email }, AuthHelper.secret(), {
            expiresIn: AuthHelper.jwtExpiratrionTime(),
        })
        return token
    }
    static verifyJwtToken = (token: string) => {
        try {
            const decoded = jwt.verify(token, AuthHelper.secret())
            return decoded as DECODED
        } catch (_error) {
            return null
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
