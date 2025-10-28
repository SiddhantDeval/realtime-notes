import { Response } from 'express'
import { Prisma } from '@prisma-client/prisma'
import CustomError from './customError'

type PrismaErrors =
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientValidationError
    | Prisma.PrismaClientInitializationError
    | Prisma.PrismaClientUnknownRequestError
    | Prisma.PrismaClientRustPanicError

type ResponseSuccessType<T> = {
    success: boolean
    status: number
    data: T
}

type ResponseErrorType = {
    success: boolean
    error: string
    status: number
    details?: unknown
}

export default class ResponseHelper {
    /**
     * Sends a standardized JSON success response.
     * @template T - Type of data payload being returned.
     * @param res - Express response object.
     * @param data - The data to send in the response body.
     * @param status - HTTP status code (default: 200).
     * @returns JSON response: { success: true, status, data }
     */
    static success<T>(res: Response, data: T, status: number = 200): Response<ResponseSuccessType<T>> {
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
    static error(
        res: Response,
        error: unknown | typeof CustomError | PrismaErrors | Error | string,
        status: number = 500,
        details?: unknown
    ): Response<ResponseErrorType> {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError ||
            error instanceof Prisma.PrismaClientValidationError ||
            error instanceof Prisma.PrismaClientInitializationError ||
            error instanceof Prisma.PrismaClientUnknownRequestError ||
            error instanceof Prisma.PrismaClientRustPanicError
        ) {
            return ResponseHelper.prismaErrors(res, error)
        }
        if (error instanceof CustomError) {
            return res.status(error.status).json({ success: false, error: error.message, status: error.status, details: error.details })
        }
        if (error instanceof Error) {
            return res.status(status).json({ success: false, error: error.message, status, details })
        }
        if (typeof error === 'string') {
            return res.status(status).json({ success: false, error, status, details })
        }
        return res.status(status).json({ success: false, error: 'An unexpected error occurred.', status, details })
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

    static prismaErrors(res: Response, error: PrismaErrors) {
        // Prisma Known Request Error (e.g., constraint violations)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    return ResponseHelper.conflict(res, `Unique constraint failed on the field: ${error.meta?.target}`)

                case 'P2003':
                    return ResponseHelper.badRequest(res, `Foreign key constraint failed on field: ${error.meta?.field_name}`)

                case 'P2000':
                    return ResponseHelper.badRequest(res, `The provided value for a column is too long. Field: ${error.meta?.column_name}`)

                case 'P2001':
                    return ResponseHelper.notFound(
                        res,
                        `Record not found. ${error.meta?.modelName ? `Model: ${error.meta?.modelName}.` : ''} ${error.meta?.details || ''}`
                    )

                case 'P2004':
                    return ResponseHelper.internalServerError(res, `The constraint failed on the database: ${error.meta?.constraint}`)

                case 'P2005':
                    return ResponseHelper.badRequest(res, `The data in the ${error.meta?.field_name} field does not match the expected type.`)

                case 'P2010':
                    return ResponseHelper.internalServerError(res, `Raw query failed. ${error.message}`)

                case 'P2014':
                    return ResponseHelper.badRequest(res, `Invalid relation between records. ${error.message}`)

                case 'P2011':
                    return ResponseHelper.badRequest(res, `Null constraint violation on the  ${error.meta?.constraint} field.`)

                case 'P2012':
                    return ResponseHelper.badRequest(res, `Missing a required value at ${error.meta?.path}.`)

                case 'P2013':
                    return ResponseHelper.badRequest(
                        res,
                        `Missing the required argument ${error.meta?.argument_name} for the ${error.meta?.function_name} function.`
                    )

                case 'P2025':
                    return ResponseHelper.notFound(res, `Record to update or delete not found. ${error.meta?.cause || ''}`)

                default:
                    return ResponseHelper.internalServerError(res, `An unexpected Prisma error occurred. Code: ${error.code}`, error.message)
            }
        }

        // Validation error (e.g., missing required field or wrong type)
        if (error instanceof Prisma.PrismaClientValidationError) {
            return ResponseHelper.validationError(res, 'Invalid input data. Check the provided fields and types.', error.message)
        }

        // Initialization error (e.g., DB connection or schema issues)
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return ResponseHelper.internalServerError(res, 'Prisma failed to initialize. Check database connection or configuration.', error.message)
        }

        // Unknown request error
        if (error instanceof Prisma.PrismaClientUnknownRequestError) {
            return ResponseHelper.internalServerError(res, 'Unknown Prisma request error.', error.message)
        }

        // Rust panic (engine crash)
        if (error instanceof Prisma.PrismaClientRustPanicError) {
            return ResponseHelper.internalServerError(res, 'Prisma query engine crashed. Restart application and check logs.', error.message)
        }
        // Default case
        return ResponseHelper.error(res, 'An unexpected Prisma error occurred.')
    }
}
