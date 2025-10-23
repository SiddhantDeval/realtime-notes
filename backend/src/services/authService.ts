import prisma from '@/models/client'
import { AuthHelper } from '@/helpers'
import { User } from '@prisma-client/prisma'

export default class AuthService {
    static register = async (email: string, passwordPlain: string) => {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        const hashedPassword = await AuthHelper.hashPassword(passwordPlain)

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
            },
        })

        const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })
        return { user, token }
    }

    static login = async (email: string, passwordPlain: string) => {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            throw new Error('Invalid email or password')
        }

        const isPasswordValid = await AuthHelper.comparePassword(passwordPlain, user.password_hash)
        if (!isPasswordValid) {
            throw new Error('Invalid email or password')
        }

        const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })
        return { user, token }
    }

    static getUserById = async (userId: User['id']) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                created_at: true,
                updated_at: true,
            },
        })
        return user
    }
}