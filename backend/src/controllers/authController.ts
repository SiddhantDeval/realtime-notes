import { Request, Response } from 'express'
import { ResponseHelper } from '@/helpers'
import { AuthService } from '@/services'

export default class AuthController {
    static register = async (req: Request, res: Response) => {
        try {
            const { email, password, full_name } = req.body

            const { user, token } = await AuthService.register({ email, passwordPlain: password, full_name })
            // res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' })

            ResponseHelper.success(res, { user, token })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const { refreshToken, ...payload } = await AuthService.login(email, password)
            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' })

            ResponseHelper.success(res, payload)
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static me = async (req: Request, res: Response) => {
        try {
            if (!req.user) return ResponseHelper.unauthorized(res, 'User not authenticated')

            const user = AuthService.getUserById(req.user.userId)
            if (!user) return ResponseHelper.notFound(res, 'User not found')
            ResponseHelper.success(res, user)
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }
}
