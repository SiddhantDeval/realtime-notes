import { Request, Response } from 'express'
import prisma from '@/models/client'
import { AuthHelper, ResponseHelper, ErrorHelper } from '@/helpers'


export default class AuthController {
    static register = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' })
            }

            const hashedPassword = await AuthHelper.hashPassword(password)

            const user = await prisma.user.create({
                data: {
                    email,
                    password_hash: hashedPassword,
                },
            })

            const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })

            ResponseHelper.success(res, { user, token })
        } catch (error) {
            ErrorHelper.handleError(res, error)
        }
    }
    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await prisma.user.findUnique({
                where: { email },
            })

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' })
            }

            const isPasswordValid = AuthHelper.comparePassword(password, user.password_hash)
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password' })
            }

            const token = AuthHelper.generateJwtToken({ id: user.id, email: user.email })
            ResponseHelper.success(res, { user, token })
        } catch (error) {
            ErrorHelper.handleError(res, error)
        }
    }
    static me = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return ResponseHelper.unauthorized(res, 'User not authenticated')
            }

            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                select: {
                    id: true,
                    email: true,
                    created_at: true,
                    updated_at: true,
                },
            })

            if (!user) {
                return ResponseHelper.notFound(res, 'User not found')
            }

            ResponseHelper.success(res, user)
        } catch (error) {
            ErrorHelper.handleError(res, error)
        }
    }
}
