import { Request, Response } from 'express'
import { ResponseHelper, ErrorHelper } from '@/helpers'
import { AuthService } from '@/services'

export default class AuthController {
    static register = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            const payload = await AuthService.register(email, password)

            ResponseHelper.success(res, payload)
        } catch (error) {
            ErrorHelper.handleError(res, error)
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const payload = await AuthService.login(email, password)
            ResponseHelper.success(res, payload)
        } catch (error) {
            ErrorHelper.handleError(res, error)
        }
    }

    static me = async (req: Request, res: Response) => {
        try {
            if (!req.user) return ResponseHelper.unauthorized(res, 'User not authenticated')

            const user = AuthService.getUserById(req.user.userId)
            if (!user) return ResponseHelper.notFound(res, 'User not found')
            ResponseHelper.success(res, user)
        } catch (error) {
            ErrorHelper.handleError(res, error)
        }
    }
}
