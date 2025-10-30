import { ResponseHelper, AuthHelper } from '@/helpers'
import { Request, Response, NextFunction } from 'express'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers['authorization']
    if (!authorization) {
        return ResponseHelper.unauthorized(res, 'No authorization header')
    }

    const token = authorization?.split(' ')[1] // Example: Bearer Token
    if (!token) {
        return ResponseHelper.unauthorized(res, 'No token provided')
    }
    try {
        const decoded = AuthHelper.verifyJwtToken(token)
        if (!decoded) {
            return ResponseHelper.unauthorized(res, 'Failed to authenticate token')
        }
        req.user = decoded // Assign the user to the request object
    } catch (error) {
        return ResponseHelper.error(res, error)
    }

    next()
}
