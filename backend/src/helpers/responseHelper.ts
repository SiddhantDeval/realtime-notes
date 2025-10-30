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
    success: true
    status: number
    data: T
}

type ResponseErrorType = {
    success: false
    error: string
    status: number
    details?: unknown
    errorCode?: string | number
}

type ApiResponse<T> = Response<ResponseSuccessType<T> | ResponseErrorType>

const HTTP = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    SERVER_ERROR: 500,
} as const

// ---- helpers ---------------------------------------------------------------

const send = <T>(res: Response, status: number, body: ResponseSuccessType<T> | ResponseErrorType): ApiResponse<T> =>
    res.status(status).json(body)

const isPrismaKnown = (e: unknown): e is Prisma.PrismaClientKnownRequestError => e instanceof Prisma.PrismaClientKnownRequestError

const isAnyPrisma = (e: unknown): e is PrismaErrors =>
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientValidationError ||
    e instanceof Prisma.PrismaClientInitializationError ||
    e instanceof Prisma.PrismaClientUnknownRequestError ||
    e instanceof Prisma.PrismaClientRustPanicError

// Map of Prisma known error codes to status + message builder.
const PRISMA_KNOWN_MAP: Record<string, (err: Prisma.PrismaClientKnownRequestError) => { status: number; message: string }> = {
    P2002: (e) => ({
        status: HTTP.CONFLICT,
        message: `Unique constraint failed on field: ${e.meta?.target}`,
    }),
    P2003: (e) => ({
        status: HTTP.BAD_REQUEST,
        message: `Foreign key constraint failed on field: ${e.meta?.field_name}`,
    }),
    P2000: (e) => ({
        status: HTTP.BAD_REQUEST,
        message: `Value too long for: ${e.meta?.column_name}`,
    }),
    P2001: (e) => ({
        status: HTTP.NOT_FOUND,
        message: `Record not found. ${e.meta?.modelName ? `Model: ${e.meta?.modelName}.` : ''} ${e.meta?.details || ''}`.trim(),
    }),
    P2004: (e) => ({
        status: HTTP.SERVER_ERROR,
        message: `Constraint failed: ${e.meta?.constraint}`,
    }),
    P2005: (e) => ({
        status: HTTP.BAD_REQUEST,
        message: `Invalid data type in field: ${e.meta?.field_name}`,
    }),
    P2010: (e) => ({
        status: HTTP.SERVER_ERROR,
        message: `Raw query failed: ${e.message}`,
    }),
    P2011: (e) => ({
        status: HTTP.BAD_REQUEST,
        message: `Null constraint violation: ${e.meta?.constraint}`,
    }),
    P2012: (e) => ({
        status: HTTP.BAD_REQUEST,
        message: `Missing required value: ${e.meta?.path}`,
    }),
    P2013: (e) => ({
        status: HTTP.BAD_REQUEST,
        message: `Missing required argument ${e.meta?.argument_name} for ${e.meta?.function_name}`,
    }),
    P2014: (e) => ({
        status: HTTP.BAD_REQUEST,
        message: `Invalid relation between records: ${e.message}`,
    }),
    P2025: (e) => ({
        status: HTTP.NOT_FOUND,
        message: `Record to update or delete not found. ${e.meta?.cause || ''}`.trim(),
    }),
}

// ---- class -----------------------------------------------------------------

export default class ResponseHelper {
    // Success
    static success<T>(res: Response, data: T, status: number = HTTP.OK): ApiResponse<T> {
        return send<T>(res, status, { success: true, status, data })
    }

    // Public error facade (accepts unknown)
    static error(res: Response, error: unknown, status: number = HTTP.SERVER_ERROR, details?: unknown): ApiResponse<never> {
        // eslint-disable-next-line no-console
        console.error(error)

        return this.fromError(res, error, status, details)
    }

    // Thin convenience wrappers
    static badRequest(res: Response, message = 'Bad Request', details?: unknown) {
        return this.error(res, message, HTTP.BAD_REQUEST, details)
    }
    static unauthorized(res: Response, message = 'Unauthorized', details?: unknown) {
        return this.error(res, message, HTTP.UNAUTHORIZED, details)
    }
    static forbidden(res: Response, message = 'Forbidden', details?: unknown) {
        return this.error(res, message, HTTP.FORBIDDEN, details)
    }
    static notFound(res: Response, message = 'Not Found', details?: unknown) {
        return this.error(res, message, HTTP.NOT_FOUND, details)
    }
    static conflict(res: Response, message = 'Conflict', details?: unknown) {
        return this.error(res, message, HTTP.CONFLICT, details)
    }
    static internalServerError(res: Response, message = 'Internal Server Error', details?: unknown) {
        return this.error(res, message, HTTP.SERVER_ERROR, details)
    }
    static validationError(res: Response, message = 'Validation Error', details?: unknown) {
        return this.error(res, message, HTTP.UNPROCESSABLE, details)
    }

    // ---- internals -----------------------------------------------------------

    private static fromError(res: Response, error: unknown, fallbackStatus: number, details?: unknown): ApiResponse<never> {
        if (isAnyPrisma(error)) {
            return this.prismaErrors(res, error)
        }

        if (error instanceof CustomError) {
            const status = error.status || fallbackStatus
            return send(res, status, {
                success: false,
                status,
                error: error.message,
                errorCode: error.errorCode,
                details: error.details ?? details,
            })
        }

        if (error instanceof Error) {
            return send(res, fallbackStatus, {
                success: false,
                status: fallbackStatus,
                error: error.message,
                details,
            })
        }

        if (typeof error === 'string') {
            return send(res, fallbackStatus, {
                success: false,
                status: fallbackStatus,
                error,
                details,
            })
        }

        return send(res, fallbackStatus, {
            success: false,
            status: fallbackStatus,
            error: 'An unexpected error occurred.',
            details,
        })
    }

    private static prismaErrors(res: Response, error: PrismaErrors): ApiResponse<never> {
        // Known request errors by code
        if (isPrismaKnown(error)) {
            const build = PRISMA_KNOWN_MAP[error.code]
            if (build) {
                const { status, message } = build(error)
                return send(res, status, { success: false, status, error: message })
            }
            // Unknown known-code
            return send(res, HTTP.SERVER_ERROR, {
                success: false,
                status: HTTP.SERVER_ERROR,
                error: `Unexpected Prisma error: ${error.code}`,
                details: error.message,
            })
        }

        // Other Prisma error classes
        if (error instanceof Prisma.PrismaClientValidationError) {
            return send(res, HTTP.UNPROCESSABLE, {
                success: false,
                status: HTTP.UNPROCESSABLE,
                error: 'Invalid input data. Check the provided fields and types.',
                details: error.message,
            })
        }

        if (error instanceof Prisma.PrismaClientInitializationError) {
            return send(res, HTTP.SERVER_ERROR, {
                success: false,
                status: HTTP.SERVER_ERROR,
                error: 'Prisma failed to initialize. Check database connection or configuration.',
                details: error.message,
            })
        }

        if (error instanceof Prisma.PrismaClientUnknownRequestError) {
            return send(res, HTTP.SERVER_ERROR, {
                success: false,
                status: HTTP.SERVER_ERROR,
                error: 'Unknown Prisma request error.',
                details: error.message,
            })
        }

        if (error instanceof Prisma.PrismaClientRustPanicError) {
            return send(res, HTTP.SERVER_ERROR, {
                success: false,
                status: HTTP.SERVER_ERROR,
                error: 'Prisma query engine crashed. Restart application and check logs.',
                details: error.message,
            })
        }

        // Fallback
        return send(res, HTTP.SERVER_ERROR, {
            success: false,
            status: HTTP.SERVER_ERROR,
            error: 'An unexpected Prisma error occurred.',
        })
    }
}
