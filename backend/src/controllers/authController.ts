import { Request, Response } from 'express'
import { ResponseHelper, AuthHelper } from '@/helpers'
import { AuthService } from '@/services' // Assuming this exports AuthService class

export default class AuthController {
    static addCookies = async (res: Response, refreshToken: string) => {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
        })
    }
    static removeCookies = async (res: Response) => {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
        })
    }

    static register = async (req: Request, res: Response) => {
        try {
            const { email, password, name } = req.body

            const { user, token, refreshToken } = await AuthService.register({
                email,
                passwordPlain: password,
                name,
            })
            AuthController.addCookies(res, refreshToken)

            ResponseHelper.success(res, { user, token })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const { refreshToken, ...payload } = await AuthService.login(
                email,
                password
            )
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
            if (!req.user)
                return ResponseHelper.unauthorized(
                    res,
                    'User not authenticated'
                )
            const userId = req.user.id

            const user = await AuthService.me(userId)
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
                return ResponseHelper.unauthorized(
                    res,
                    'No refresh token provided'
                )
            }
            const { token } = await AuthService.refreshToken(refreshToken)

            ResponseHelper.success(res, { token })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static verifyEmail = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            if (!token) {
                return ResponseHelper.error(res, new Error('Token is required'))
            }

            await AuthService.verifyEmail(token)
            ResponseHelper.success(res, {
                message: 'Email verified successfully',
            })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            if (!email) {
                return ResponseHelper.error(res, new Error('Email is required'))
            }

            await AuthService.forgotPassword(email)
            // Always return success to prevent email enumeration
            ResponseHelper.success(res, {
                message:
                    'If an account exists, a password reset email has been sent.',
            })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static resetPassword = async (req: Request, res: Response) => {
        try {
            const { token, newPassword } = req.body
            if (!token || !newPassword) {
                return ResponseHelper.error(
                    res,
                    new Error('Token and new password are required')
                )
            }

            await AuthService.resetPassword(token, newPassword)
            ResponseHelper.success(res, {
                message: 'Password reset successfully',
            })
        } catch (error) {
            ResponseHelper.error(res, error)
        }
    }

    static googleCallback = async (req: Request, res: Response) => {
        try {
            // req.user is populated by passport
            const user = req.user
            if (!user)
                return res.redirect(
                    `${process.env.FRONTEND_URL}/login?error=auth_failed`
                )

            const token = AuthHelper.generateJwtToken({
                id: user.id,
                email: user.email,
            })
            const refreshToken = AuthHelper.generateRefreshToken({
                id: user.id,
                email: user.email,
            })

            AuthController.addCookies(res, refreshToken)

            // Redirect to frontend with token
            const frontendUrl =
                process.env.FRONTEND_URL || 'http://localhost:3000'
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
        } catch (error) {
            const frontendUrl =
                process.env.FRONTEND_URL || 'http://localhost:3000'
            res.redirect(`${frontendUrl}/login?error=server_error`)
        }
    }
}
