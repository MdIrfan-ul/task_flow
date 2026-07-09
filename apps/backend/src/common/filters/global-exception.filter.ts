import {
    ArgumentsHost,
    Catch,
    ConflictException,
    ExceptionFilter,
    HttpException,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common"
import { Response } from "express"
import { UniqueConstraintError } from "sequelize"

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name)

    catch(error: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        if (error instanceof UniqueConstraintError) {
            const conflict = new ConflictException(this.buildUniqueConstraintMessage(error))
            const status = conflict.getStatus()
            const body = conflict.getResponse()
            this.logger.warn(`${status} - ${JSON.stringify(body)}`)
            return response.status(status).json(body)
        }

        const exception =
            error instanceof HttpException
                ? error
                : new InternalServerErrorException("Something went wrong. Please try again later.")

        const status = exception.getStatus()
        const body = exception.getResponse()

        if (error instanceof HttpException) {
            this.logger.warn(`${status} - ${JSON.stringify(body)}`)
        } else {
            this.logger.error(
                "Unhandled error",
                error instanceof Error ? error.stack : String(error),
            )
            if (error && typeof error === 'object' && 'original' in error) {
                this.logger.error('DB error detail:', (error as any).original)
            }
        }

        response.status(status).json(body)
    }

    private buildUniqueConstraintMessage(error: UniqueConstraintError): string {
        // error.errors is an array of ValidationErrorItem, each with a `path` (column name) and `value`
        const fields = error.errors?.map((e) => e.path).filter(Boolean) as string[]

        if (!fields || fields.length === 0) {
            return "This record already exists"
        }

        if (fields.length === 1) {
            const field = this.toReadableField(fields[0])
            return `${field} already in use`
        }

        // Composite unique constraint (multiple columns)
        const readableFields = fields.map((f) => this.toReadableField(f)).join(', ')
        return `${readableFields} combination already in use`
    }

    private toReadableField(field: string): string {
        // snake_case -> Title Case, e.g. "email" -> "Email", "user_name" -> "User name"
        return field
            .replace(/_/g, ' ')
            .replace(/^./, (char) => char.toUpperCase())
    }
}