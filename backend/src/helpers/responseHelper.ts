import { Response } from 'express'

export default class ResponseHelper {
    /**
     * Sends a standardized JSON success response.
     * @template T - Type of data payload being returned.
     * @param res - Express response object.
     * @param data - The data to send in the response body.
     * @param status - HTTP status code (default: 200).
     * @returns JSON response: { success: true, status, data }
     */
    static success<T>(res: Response, data: T, status: number = 200) {
        return res.status(status).json({ success: true, status, data })
    }

    /**
     * Sends a standardized JSON error response.
     * @param res - Express response object.
     * @param message - Error message for the client.
     * @param status - HTTP status code (default: 500).
     * @param details - Optional additional details (e.g., stack trace or validation errors).
     * @returns JSON response: { success: false, error, status, details }
     */
    static error(res: Response, message: string, status: number = 500, details?: unknown) {
        return res.status(status).json({ success: false, error: message, status, details })
    }

    /**
     * Sends a standardized 400 Bad Request response.
     * @param res - Express response object.
     * @param message - Optional error message (default: 'Bad Request').
     * @param details - Optional details about the error.
     */
    static badRequest(res: Response, message: string = 'Bad Request', details?: unknown) {
        return ResponseHelper.error(res, message, 400, details)
    }

    /**
     * Sends a standardized 401 Unauthorized response.
     * @param res - Express response object.
     * @param message - Optional error message (default: 'Unauthorized').
     * @param details - Optional details about the error.
     */
    static unauthorized(res: Response, message: string = 'Unauthorized', details?: unknown) {
        return ResponseHelper.error(res, message, 401, details)
    }

    /**
     * Sends a standardized 403 Forbidden response.
     * @param res - Express response object.
     * @param message - Optional error message (default: 'Forbidden').
     * @param details - Optional details about the error.
     */
    static forbidden(res: Response, message: string = 'Forbidden', details?: unknown) {
        return ResponseHelper.error(res, message, 403, details)
    }

    /**
     * Sends a standardized 404 Not Found response.
     * @param res - Express response object.
     * @param message - Optional error message (default: 'Not Found').
     * @param details - Optional details about the error.
     */
    static notFound(res: Response, message: string = 'Not Found', details?: unknown) {
        return ResponseHelper.error(res, message, 404, details)
    }

    /**
     * Sends a standardized 409 Conflict response.
     * @param res - Express response object.
     * @param message - Optional error message (default: 'Conflict').
     * @param details - Optional details about the error.
     */
    static conflict(res: Response, message: string = 'Conflict', details?: unknown) {
        return ResponseHelper.error(res, message, 409, details)
    }

    /**
     * Sends a standardized 500 Internal Server Error response.
     * @param res - Express response object.
     * @param message - Optional error message (default: 'Internal Server Error').
     * @param details - Optional details about the error.
     */
    static internalServerError(res: Response, message: string = 'Internal Server Error', details?: unknown) {
        return ResponseHelper.error(res, message, 500, details)
    }

    /**
     * Sends a standardized 422 Validation Error response.
     * Commonly used for invalid user input or schema validation failures.
     * @param res - Express response object.
     * @param message - Optional error message (default: 'Validation Error').
     * @param details - Optional validation details.
     */
    static validationError(res: Response, message: string = 'Validation Error', details?: unknown) {
        return ResponseHelper.error(res, message, 422, details)
    }
}
