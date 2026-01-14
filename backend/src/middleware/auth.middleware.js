import jwt from "jsonwebtoken";
import adminRepository from "../repository/admin.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import Logger from "../config/logger/logger.config.js";

const authenticate = asyncHandler(async (req, res, next) => {
      const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
            Logger.warn('Authentication failed - no token provided', { ip: req.ip });
            throw ApiError.unauthorized("Access token is required");
      }

      try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
            const admin = await adminRepository.findById(decoded.adminId);

            if (!admin) {
                  Logger.error('Authentication failed - admin not found', { adminId: decoded.adminId });
                  throw ApiError.unauthorized("Invalid token - admin not found");
            }

            if (!admin.isActive) {
                  Logger.error('Authentication failed - account deactivated', { adminId: admin._id });
                  throw ApiError.unauthorized("Account is deactivated");
            }

            req.admin = {
                  id: admin._id,
                  username: admin.username,
                  email: admin.email,
            };

            Logger.info('Authentication successful', { adminId: admin._id });
            next();
      } catch (error) {
            if (error.name === "JsonWebTokenError") {
                  Logger.error('Authentication failed - invalid token', { error: error.message });
                  throw ApiError.unauthorized("Invalid token");
            } else if (error.name === "TokenExpiredError") {
                  Logger.error('Authentication failed - token expired', { error: error.message });
                  throw ApiError.unauthorized("Token expired");
            }
            Logger.error('Authentication failed - unexpected error', { error: error.message });
            throw error;
      }
});

export { authenticate };
