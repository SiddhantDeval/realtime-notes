import { Prisma } from '@prisma-client/prisma'
import { Response } from 'express'
import ResponseHelper from './responseHelper'

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

        if (error instanceof Error) {
            return ResponseHelper.badRequest(res, error.message)
        }
        return ResponseHelper.internalServerError(res, 'An unexpected error occurred.')
    }

    static handlePrismaError(res: Response, error: unknown) {
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
    }
}
