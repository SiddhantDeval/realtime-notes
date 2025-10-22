import { Request, Response } from 'express'
import prisma from '@/models/client'
import AuthHelper from '@/helpers/authHelper'
import { ErrorHelper } from '@/helpers/errorHelper'
import { ResponseHelper } from '@/helpers/responseHelper'

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
}
