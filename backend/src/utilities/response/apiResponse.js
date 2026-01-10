import { StatusCodes } from 'http-status-codes';

export class ApiResponse {
      constructor(success, message, data = {}, statusCode = StatusCodes.OK, errors = []) {
            this.success = success;
            this.message = message;
            this.data = data;
            this.statusCode = statusCode;
            this.errors = errors;
            this.timestamp = new Date().toISOString();
      }

      static success(message = 'Request successful', data = {}, statusCode = StatusCodes.OK) {
            return new ApiResponse(true, message, data, statusCode);
      }

      static created(message = 'Resource created successfully', data = {}) {
            return new ApiResponse(true, message, data, StatusCodes.CREATED);
      }

      static noContent(message = 'Request successful') {
            return new ApiResponse(true, message, {}, StatusCodes.NO_CONTENT);
      }

      static error(message = 'Request failed', errors = [], statusCode = StatusCodes.BAD_REQUEST) {
            return new ApiResponse(false, message, {}, statusCode, errors);
      }

      static notFound(message = 'Resource not found', errors = []) {
            return new ApiResponse(false, message, {}, StatusCodes.NOT_FOUND, errors);
      }

      static unauthorized(message = 'Unauthorized', errors = []) {
            return new ApiResponse(false, message, {}, StatusCodes.UNAUTHORIZED, errors);
      }

      static forbidden(message = 'Forbidden', errors = []) {
            return new ApiResponse(false, message, {}, StatusCodes.FORBIDDEN, errors);
      }

      static conflict(message = 'Conflict', errors = []) {
            return new ApiResponse(false, message, {}, StatusCodes.CONFLICT, errors);
      }

      static unprocessableEntity(message = 'Validation failed', errors = []) {
            return new ApiResponse(false, message, {}, StatusCodes.UNPROCESSABLE_ENTITY, errors);
      }

      static internal(message = 'Internal server error', errors = []) {
            return new ApiResponse(false, message, {}, StatusCodes.INTERNAL_SERVER_ERROR, errors);
      }

      static serviceUnavailable(message = 'Service unavailable', errors = []) {
            return new ApiResponse(false, message, {}, StatusCodes.SERVICE_UNAVAILABLE, errors);
      }

      static paginated(message = 'Request successful', data = [], pagination = {}, statusCode = StatusCodes.OK) {
            return new ApiResponse(true, message, {
                  items: data,
                  pagination: {
                        page: pagination.page || 1,
                        limit: pagination.limit || 10,
                        total: pagination.total || 0,
                        totalPages: pagination.totalPages || 0,
                        hasNext: pagination.hasNext || false,
                        hasPrev: pagination.hasPrev || false,
                        ...pagination
                  }
            }, statusCode);
      }

      toJSON() {
            const response = {
                  success: this.success,
                  message: this.message,
                  timestamp: this.timestamp
            };

            if (this.success && this.data && Object.keys(this.data).length > 0) {
                  response.data = this.data;
            }

            if (!this.success) {
                  response.errors = this.errors;
            }

            return response;
      }
}

export const sendResponse = (res, response) => {
      return res.status(response.statusCode).json(response.toJSON());
};

export const sendSuccess = (res, message, data = {}, statusCode = StatusCodes.OK) => {
      const response = ApiResponse.success(message, data, statusCode);
      return sendResponse(res, response);
};

export const sendCreated = (res, message, data = {}) => {
      const response = ApiResponse.created(message, data);
      return sendResponse(res, response);
};

export const sendError = (res, message, errors = [], statusCode = StatusCodes.BAD_REQUEST) => {
      const response = ApiResponse.error(message, errors, statusCode);
      return sendResponse(res, response);
};

export const sendNotFound = (res, message = 'Resource not found', errors = []) => {
      const response = ApiResponse.notFound(message, errors);
      return sendResponse(res, response);
};

export const sendUnauthorized = (res, message = 'Unauthorized', errors = []) => {
      const response = ApiResponse.unauthorized(message, errors);
      return sendResponse(res, response);
};

export const sendForbidden = (res, message = 'Forbidden', errors = []) => {
      const response = ApiResponse.forbidden(message, errors);
      return sendResponse(res, response);
};

export const sendConflict = (res, message = 'Conflict', errors = []) => {
      const response = ApiResponse.conflict(message, errors);
      return sendResponse(res, response);
};

export const sendUnprocessableEntity = (res, message = 'Validation failed', errors = []) => {
      const response = ApiResponse.unprocessableEntity(message, errors);
      return sendResponse(res, response);
};

export const sendInternal = (res, message = 'Internal server error', errors = []) => {
      const response = ApiResponse.internal(message, errors);
      return sendResponse(res, response);
};

export const sendServiceUnavailable = (res, message = 'Service unavailable', errors = []) => {
      const response = ApiResponse.serviceUnavailable(message, errors);
      return sendResponse(res, response);
};

export const sendPaginated = (res, message, data, pagination, statusCode = StatusCodes.OK) => {
      const response = ApiResponse.paginated(message, data, pagination, statusCode);
      return sendResponse(res, response);
};
