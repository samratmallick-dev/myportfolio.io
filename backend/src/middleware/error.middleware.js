import ApiError from "../utilities/error/apiError.js";
import { ApiResponse } from "../utilities/response/apiResponse.js";
import Logger from "../config/logger/logger.config.js";

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
    error = new ApiError(message, 400);
  }

  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ApiError(message, 400);
  }

  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ApiError(message, 404);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new ApiError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new ApiError(message, 401);
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new ApiError("File size too large. Maximum size is 5MB.", 400);
    } else if (err.code === "LIMIT_FILE_COUNT") {
      error = new ApiError("Too many files uploaded. Maximum is 10 files.", 400);
    } else {
      error = new ApiError(`File upload error: ${err.message}`, 400);
    }
  }

  res.status(error.statusCode || 500).json(
    ApiResponse.error(
      error.message || "Internal Server Error",
      process.env.NODE_ENV === "development" ? [error.stack] : [],
      error.statusCode || 500
    ).toJSON()
  );
};

export { errorHandler };
