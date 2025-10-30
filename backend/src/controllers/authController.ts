import { Request, Response } from 'express'
import { ResponseHelper } from '@/helpers'
import { AuthService } from '@/services'

export default class AuthController {
    static addCookies = async (res: Response, refreshToken: string) => {
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' })
    }
    static removeCookies = async (res: Response) => {
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' })
    }

    static register = async (req: Request, res: Response) => {
        try {
            const { email, password, full_name } = req.body

            const { user, token, refreshToken } = await AuthService.register({ email, passwordPlain: password, full_name })
            AuthController.addCookies(res, refreshToken)

            ResponseHelper.success(res, { user, token })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const { refreshToken, ...payload } = await AuthService.login(email, password)
            AuthController.addCookies(res, refreshToken)
            ResponseHelper.success(res, payload)
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static logout = async (req: Request, res: Response) => {
        try {
            // Clear the refresh token cookie
            AuthController.removeCookies(res)

            // Optionally, invalidate the refresh token in the database if you're storing them
            // await AuthService.logout(req.user.userId); // Assuming userId is available from authMiddleware

            ResponseHelper.success(res, { message: 'Logged out successfully' })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static me = async (req: Request, res: Response) => {
        try {
            if (!req.user) return ResponseHelper.unauthorized(res, 'User not authenticated')

            const user = await AuthService.me(req.user.userId)
            if (!user) return ResponseHelper.notFound(res, 'User not found')

            ResponseHelper.success(res, user)
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static refreshToken = async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken
            if (!refreshToken) {
                return ResponseHelper.unauthorized(res, 'No refresh token provided')
            }
            const { token } = await AuthService.refreshToken(refreshToken)

            ResponseHelper.success(res, { token })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }
}
