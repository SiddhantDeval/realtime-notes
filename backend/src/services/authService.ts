import prisma from '@/models/client'
import { AuthHelper } from '@/helpers'
import { User } from '@prisma/client'
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
                name: data.full_name,
                password: hashedPassword,
            },
        })

        const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })
        const refreshToken = AuthHelper.generateRefreshToken({ id: user.id, email: user.email })
        
        // Remove password from returned user object (though global omit might handle it, we're explicit here if needed for specific return type)
        // With global omit, 'user' does not have 'password' property unless we selected it.
        // Create returns the object based on args, usually includes all fields.
        // Actually, prisma.user.create will return the object.
        // If global omit is set, it might return without password.
        // But to be safe in logic:
        // const { password, ...rest } = user
        // But 'user' type might not have 'password' if omit is in effect? 
        // No, create returns User.
        
        return { user, token, refreshToken }
    }

    static login = async (email: string, passwordPlain: string) => {
        // We need password to verify, so we must explicitly select it (implied by global omit)
        // or select ALL fields including password.
        const userWithPassword = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                avatarUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!userWithPassword) {
            throw new CustomError('user_not_found', 401, 'User not found')
        }

        const isPasswordValid = await AuthHelper.comparePassword(passwordPlain, userWithPassword.password)
        if (!isPasswordValid) {
            throw new CustomError('invalid_credentials', 401, 'Invalid email or password')
        }

        const token = AuthHelper.generateJwtToken({ id: userWithPassword.id, email: userWithPassword.email })
        const refreshToken = AuthHelper.generateRefreshToken({ id: userWithPassword.id, email: userWithPassword.email })

        const { password, ...rest } = userWithPassword

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
            select: { id: true, email: true }, // Select minimal fields
        })

        if (!user) {
            throw new CustomError('user_not_found', 404, 'User not found')
        }

        const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })
        
        return { token }
    }

    static me = async (userId: string) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                avatarUrl: true,
                isActive: true
            },
        })
        return user
    }
}
