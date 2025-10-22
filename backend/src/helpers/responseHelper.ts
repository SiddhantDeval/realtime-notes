import { Response } from 'express'

export class ResponseHelper {
    static success<T>(res: Response, data: T, status: number = 200) {
        return res.status(status).json({ success: true, data })
    }

    static error(res: Response, message: string, status: number = 500, details?: unknown) {
        return res.status(status).json({ success: false, error: message, details })
    }

    static badRequest(res: Response, message: string = 'Bad Request', details?: unknown) {
        return ResponseHelper.error(res, message, 400, details)
    }

    static unauthorized(res: Response, message: string = 'Unauthorized', details?: unknown) {
        return ResponseHelper.error(res, message, 401, details)
    }

    static forbidden(res: Response, message: string = 'Forbidden', details?: unknown) {
        return ResponseHelper.error(res, message, 403, details)
    }

    static notFound(res: Response, message: string = 'Not Found', details?: unknown) {
        return ResponseHelper.error(res, message, 404, details)
    }

    static conflict(res: Response, message: string = 'Conflict', details?: unknown) {
        return ResponseHelper.error(res, message, 409, details)
    }

    static internalServerError(res: Response, message: string = 'Internal Server Error', details?: unknown) {
        return ResponseHelper.error(res, message, 500, details)
    }

    static validationError(res: Response, errors: Error, message: string = 'Validation Failed') {
        return res.status(422).json({ success: false, message, errors })
    }
}
