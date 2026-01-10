import { StatusCodes } from 'http-status-codes';

class ApiError extends Error {
      constructor(message, statusCode, explanation = null, errors = []) {
            super(message);
            this.name = 'ApiError';
            this.statusCode = statusCode;
            this.explanation = explanation || message;
            this.errors = errors;
            this.isOperational = true;

            Error.captureStackTrace(this, this.constructor);
      }

      static badRequest(message, errors = []) {
            return new ApiError(message, StatusCodes.BAD_REQUEST, message, errors);
      }

      static unauthorized(message = 'Unauthorized') {
            return new ApiError(message, StatusCodes.UNAUTHORIZED, message);
      }

      static forbidden(message = 'Forbidden') {
            return new ApiError(message, StatusCodes.FORBIDDEN, message);
      }

      static notFound(message = 'Resource not found') {
            return new ApiError(message, StatusCodes.NOT_FOUND, message);
      }

      static conflict(message = 'Conflict') {
            return new ApiError(message, StatusCodes.CONFLICT, message);
      }

      static unprocessableEntity(message, errors = []) {
            return new ApiError(message, StatusCodes.UNPROCESSABLE_ENTITY, message, errors);
      }

      static internal(message = 'Internal server error') {
            return new ApiError(message, StatusCodes.INTERNAL_SERVER_ERROR, message);
      }

      static serviceUnavailable(message = 'Service unavailable') {
            return new ApiError(message, StatusCodes.SERVICE_UNAVAILABLE, message);
      }

      toJSON() {
            return {
                  name: this.name,
                  message: this.message,
                  statusCode: this.statusCode,
                  explanation: this.explanation,
                  errors: this.errors,
                  stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
            };
      }
}

export default ApiError;
