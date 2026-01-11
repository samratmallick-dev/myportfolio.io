import ApiError from "../utilities/error/apiError.js";
import { ApiResponse } from "../utilities/response/apiResponse.js";
import Logger from "../config/logger/logger.config.js";
import { StatusCodes } from "http-status-codes";

const errorHandler = (err, req, res, next) => {
      let error = { ...err };
      error.message = err.message;

      Logger.error("Error:", {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            ip: req.ip,
      });

      if (err.name === "ValidationError") {
            const message = Object.values(err.errors).map(val => val.message).join(", ");
            error = new ApiError(message, StatusCodes.BAD_REQUEST);
      }

      if (err.code === 11000) {
            const message = "Duplicate field value entered";
            error = new ApiError(message, StatusCodes.BAD_REQUEST);
      }

      if (err.name === "CastError") {
            const message = "Resource not found";
            error = new ApiError(message, StatusCodes.NOT_FOUND);
      }

      if (err.name === "JsonWebTokenError") {
            const message = "Invalid token";
            error = new ApiError(message, StatusCodes.UNAUTHORIZED);
      }

      if (err.name === "TokenExpiredError") {
            const message = "Token expired";
            error = new ApiError(message, StatusCodes.UNAUTHORIZED);
      }

      if (err.name === "MulterError") {
            if (err.code === "LIMIT_FILE_SIZE") {
                  error = new ApiError("File size too large. Maximum size is 5MB.", StatusCodes.BAD_REQUEST);
            } else if (err.code === "LIMIT_FILE_COUNT") {
                  error = new ApiError("Too many files uploaded. Maximum is 10 files.", StatusCodes.BAD_REQUEST);
            } else {
                  error = new ApiError(`File upload error: ${err.message}`, StatusCodes.BAD_REQUEST);
            }
      }

      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(
            ApiResponse.error(
                  error.message || "Internal Server Error",
                  process.env.NODE_ENV === "development" ? [error.stack] : [],
                  error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
            ).toJSON()
      );
};

export { errorHandler };
