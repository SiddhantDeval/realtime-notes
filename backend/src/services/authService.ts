import { AuthHelper } from '@/helpers'
import CustomError from '@/helpers/customError'
import EmailService from './emailService'
import nodeCrypto from 'crypto'
import prisma from '@/models/client'

export default class AuthService {
    static register = async (data: {
        email: string
        passwordPlain: string
        name: string
    }) => {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        const hashedPassword = await AuthHelper.hashPassword(data.passwordPlain)

        // Generate verification token
        const verificationToken = nodeCrypto.randomBytes(32).toString('hex')
        const verificationTokenExpiry = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ) // 24 hours

        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                verificationToken,
                verificationTokenExpiry,
                isVerified: false,
            },
        })

        const token = AuthHelper.generateJwtToken({
            id: user.id,
            email: user.email,
        })
        const refreshToken = AuthHelper.generateRefreshToken({
            id: user.id,
            email: user.email,
        })

        // Send verification email
        await EmailService.sendVerificationEmail(
            user.email,
            user.name || 'User',
            verificationToken
        )

        return { user, token, refreshToken }
    }

    static login = async (email: string, passwordPlain: string) => {
        const userWithPassword = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                avatarUrl: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!userWithPassword) {
            throw new CustomError('user_not_found', 401, 'User not found')
        }

        const isPasswordValid = await AuthHelper.comparePassword(
            passwordPlain,
            userWithPassword.password
        )
        if (!isPasswordValid) {
            throw new CustomError(
                'invalid_credentials',
                401,
                'Invalid email or password'
            )
        }

        const token = AuthHelper.generateJwtToken({
            id: userWithPassword.id,
            email: userWithPassword.email,
        })
        const refreshToken = AuthHelper.generateRefreshToken({
            id: userWithPassword.id,
            email: userWithPassword.email,
        })

        const { password, ...rest } = userWithPassword

        return { user: rest, token, refreshToken }
    }

    static verifyEmail = async (token: string) => {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: { gt: new Date() },
            },
        })

        if (!user) {
            throw new CustomError(
                'invalid_token',
                400,
                'Invalid or expired verification token'
            )
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        })

        // Send welcome email after verification
        await EmailService.sendWelcomeEmail(user.email, user.name || 'User')

        return true
    }

    static forgotPassword = async (email: string) => {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return false // Return silent success

        const resetToken = nodeCrypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpiry: resetTokenExpiry,
            },
        })

        await EmailService.sendPasswordResetEmail(
            user.email,
            user.name || 'User',
            resetToken
        )
        return true
    }

    static resetPassword = async (token: string, newPasswordPlain: string) => {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiry: { gt: new Date() },
            },
        })

        if (!user) {
            throw new CustomError(
                'invalid_token',
                400,
                'Invalid or expired reset token'
            )
        }

        const hashedPassword = await AuthHelper.hashPassword(newPasswordPlain)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiry: null,
            },
        })

        return true
    }

    static logout = async () => true

    static refreshToken = async (refreshToken: string) => {
        const decoded = AuthHelper.verifyJwtToken(refreshToken)
        if (!decoded || typeof decoded === 'string') {
            throw new CustomError(
                'invalid_refresh_token',
                401,
                'Invalid refresh token'
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true },
        })

        if (!user) {
            throw new CustomError('user_not_found', 404, 'User not found')
        }

        const token = AuthHelper.generateJwtToken({
            id: user.id,
            email: user.email,
        })

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
                isActive: true,
                isVerified: true,
            },
        })
        return user
    }
}
