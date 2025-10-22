import { Prisma } from '@prisma-client/prisma'
import { Response } from 'express'

export default class ErrorHelper {
    static handleError(res: Response, error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error)
        if (
            error instanceof Prisma.PrismaClientKnownRequestError ||
            error instanceof Prisma.PrismaClientValidationError ||
            error instanceof Prisma.PrismaClientInitializationError ||
            error instanceof Prisma.PrismaClientUnknownRequestError ||
            error instanceof Prisma.PrismaClientRustPanicError
        ) {
            return ErrorHelper.handlePrismaError(res, error)
        }

        // Generic error response for unhandled errors
        return res.status(500).json({ error: 'An unexpected error occurred.' })
    }

    static handlePrismaError(res: Response, error: unknown) {
        // Prisma Known Request Error (e.g., constraint violations)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    return res.status(409).json({
                        error: `Unique constraint failed on the field: ${error.meta?.target}`,
                    })

                case 'P2003':
                    return res.status(400).json({
                        error: `Foreign key constraint failed on field: ${error.meta?.field_name}`,
                    })

                case 'P2000':
                    return res.status(400).json({
                        error: `Value too long for field: ${error.meta?.target}`,
                    })

                case 'P2001':
                    return res.status(404).json({
                        error: `Record not found for where condition: ${JSON.stringify(error.meta)}`,
                    })

                case 'P2004':
                    return res.status(400).json({
                        error: 'A database constraint failed.',
                    })

                case 'P2005':
                    return res.status(400).json({
                        error: `Invalid value for field: ${error.meta?.field_name}`,
                    })

                case 'P2010':
                    return res.status(500).json({
                        error: `Raw query failed. ${error.message}`,
                    })

                case 'P2014':
                    return res.status(400).json({
                        error: `Invalid relation between records. ${error.message}`,
                    })

                case 'P2025':
                    return res.status(404).json({
                        error: 'Operation failed because the record was not found.',
                    })

                default:
                    return res.status(400).json({
                        error: `Prisma error (${error.code}): ${error.message}`,
                    })
            }
        }

        // Validation error (e.g., missing required field or wrong type)
        if (error instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).json({
                error: 'Invalid input data. Check the provided fields and types.',
                details: error.message,
            })
        }

        // Initialization error (e.g., DB connection or schema issues)
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return res.status(500).json({
                error: 'Prisma failed to initialize. Check database connection or configuration.',
                details: error.message,
            })
        }

        // Unknown request error
        if (error instanceof Prisma.PrismaClientUnknownRequestError) {
            return res.status(500).json({
                error: 'Unknown Prisma request error.',
                details: error.message,
            })
        }

        // Rust panic (engine crash)
        if (error instanceof Prisma.PrismaClientRustPanicError) {
            return res.status(500).json({
                error: 'Prisma query engine crashed. Restart application and check logs.',
                details: error.message,
            })
        }
    }

    static handleValidationError(res: Response, message: string) {
        return res.status(400).json({ error: message })
    }

    static handleAuthenticationError(res: Response, message: string) {
        return res.status(401).json({ error: message })
    }

    static handleAuthorizationError(res: Response, message: string) {
        return res.status(403).json({ error: message })
    }

    static handleNotFound(res: Response, message: string) {
        return res.status(404).json({ error: message })
    }
}
