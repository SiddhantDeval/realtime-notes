import prisma from '@/models/client'
import { AuthHelper } from '@/helpers'
import { User } from '@prisma-client/prisma'
import CustomError from '@/helpers/customError'

export default class AuthService {
    static register = async (data: { email: string; passwordPlain: string; full_name: string }) => {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        const hashedPassword = await AuthHelper.hashPassword(data.passwordPlain)

        const user = await prisma.user.create({
            data: {
                email: data.email,
                full_name: data.full_name,
                password_hash: hashedPassword,
            },
        })

        const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })
        return { user, token }
    }

    static login = async (email: string, passwordPlain: string) => {
        const user = await prisma.user.findUnique({
            where: { email },
            omit: {
                password_hash: false, // The password_hash field is now selected.
            },
        })

        if (!user) {
            throw new CustomError('user_not_found', 401, 'User not found')
        }

        const isPasswordValid = await AuthHelper.comparePassword(passwordPlain, user.password_hash)
        if (!isPasswordValid) {
            throw new CustomError('invalid_credentials', 401, 'Invalid email or password')
        }

        const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })
        const refreshToken = AuthHelper.generateRefreshToken({ id: user.id, email: user.email })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...rest } = user

        return { user: rest, token, refreshToken }
    }

    static logout = async () => {
        // Invalidate the refresh token by deleting it from the database
        // await prisma.refreshToken.deleteMany({
        //     where: {
        //         userId: userId,
        //     },
        // })

        return true
    }

    static refreshToken = async (refreshToken: string) => {
        const decoded = AuthHelper.verifyJwtToken(refreshToken)
        if (!decoded || typeof decoded === 'string') {
            throw new CustomError('invalid_refresh_token', 401, 'Invalid refresh token')
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true },
        })

        if (!user) {
            throw new CustomError('user_not_found', 404, 'User not found')
        }

        const token = AuthHelper.generateJwtToken({ id: decoded.userId, email: decoded.email })
        // const newRefreshToken = AuthHelper.generateRefreshToken({ id: user.id, email: user.email })

        return { token }
    }

    static me = async (userId: User['id']) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                full_name: true,
                created_at: true,
                updated_at: true,
            },
        })
        return user
    }
}
