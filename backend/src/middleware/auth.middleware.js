import jwt from "jsonwebtoken";
import adminRepository from "../repository/admin.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
      const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
            throw ApiError.unauthorized("Access token is required");
      }

      try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
            const admin = await adminRepository.findById(decoded.adminId);

            if (!admin) {
                  throw ApiError.unauthorized("Invalid token - admin not found");
            }

            if (!admin.isActive) {
                  throw ApiError.unauthorized("Account is deactivated");
            }

            req.admin = {
                  id: admin._id,
                  username: admin.username,
                  email: admin.email,
            };

            next();
      } catch (error) {
            if (error.name === "JsonWebTokenError") {
                  throw ApiError.unauthorized("Invalid token");
            } else if (error.name === "TokenExpiredError") {
                  throw ApiError.unauthorized("Token expired");
            }
            throw error;
      }
});

export { authenticate };
