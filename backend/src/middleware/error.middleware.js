import ApiError from "../utilities/error/apiError.js";
import { ApiResponse } from "../utilities/response/apiResponse.js";
import Logger from "../config/logger/logger.config.js";
import { StatusCodes } from "http-status-codes";

const isOperational = (err) => err instanceof ApiError || err?.isOperational === true;

const errorHandler = (err, req, res, next) => {
      if (res.headersSent) {
            return next(err);
      }

      let message = err?.message || "Internal Server Error";
      let statusCode = err?.statusCode;

      if (err?.name === "ValidationError") {
            message = Object.values(err.errors || {}).map((val) => val.message).join(", ") || "Invalid data";
            statusCode = StatusCodes.BAD_REQUEST;
      } else if (err?.code === 11000) {
            message = "Duplicate value for a unique field";
            statusCode = StatusCodes.CONFLICT;
      } else if (err?.name === "CastError") {
            message = "Resource not found";
            statusCode = StatusCodes.NOT_FOUND;
      } else if (err?.name === "JsonWebTokenError") {
            message = "Invalid token";
            statusCode = StatusCodes.UNAUTHORIZED;
      } else if (err?.name === "TokenExpiredError") {
            message = "Token expired";
            statusCode = StatusCodes.UNAUTHORIZED;
      } else if (err?.name === "MulterError") {
            if (err.code === "LIMIT_FILE_SIZE") {
                  message = "File size too large. Maximum size is 5MB.";
            } else if (err.code === "LIMIT_FILE_COUNT") {
                  message = "Too many files uploaded. Maximum is 10 files.";
            } else {
                  message = `File upload error: ${err.message}`;
            }
            statusCode = StatusCodes.BAD_REQUEST;
      } else if (statusCode === undefined) {
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            message = "Internal Server Error";
      }

      if (statusCode >= 500) {
            Logger.error(
                  `Unhandled server error: ${err?.name || "Error"} - ${err?.message || "unknown"} ` +
                  `(${req.method} ${req.originalUrl || req.url})\n${err?.stack || ""}`
            );
      } else {
            Logger.warn(
                  `Request failed [${statusCode}]: ${message} (${req.method} ${req.originalUrl || req.url})`
            );
      }

      const responseBody = ApiResponse.error(
            message,
            process.env.NODE_ENV === "development" && statusCode >= 500 && isOperational(err)
                  ? [err.stack]
                  : [],
            statusCode
      ).toJSON();

      return res.status(statusCode).json(responseBody);
};

export { errorHandler };
