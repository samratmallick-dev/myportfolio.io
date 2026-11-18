import ApiError from "../utilities/error/apiError.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import { verifyAccessToken } from "../utilities/token.utility.js";
import adminRepository from "../repository/admin.repository.js";
import adminSessionRepository from "../repository/adminSession.repository.js";
import { auditWarn } from "../utilities/audit.util.js";

const authenticate = asyncHandler(async (req, res, next) => {
      const authorization = req.get("authorization") || req.header("Authorization");

      if (!authorization || !authorization.startsWith("Bearer ")) {
            auditWarn("auth.reject", { reason: "missing_token", path: req.path, ip: req.ip });
            throw ApiError.unauthorized("Access token is required");
      }

      const token = authorization.slice(7).trim();
      if (!token) {
            throw ApiError.unauthorized("Access token is required");
      }

      let payload;
      try {
            payload = verifyAccessToken(token);
      } catch (error) {
            const name = error?.name;
            const message =
                  name === "TokenExpiredError"
                        ? "Access token expired"
                        : "Invalid access token";
            auditWarn("auth.reject", { reason: message, path: req.path, ip: req.ip });
            throw ApiError.unauthorized(message);
      }

      const admin = await adminRepository.findById(payload.sub);
      if (!admin) {
            auditWarn("auth.reject", { reason: "admin_not_found", adminId: payload.sub });
            throw ApiError.unauthorized("Invalid access token");
      }

      if (!admin.isActive) {
            auditWarn("auth.reject", { reason: "inactive_admin", adminId: admin._id });
            throw ApiError.unauthorized("Account is deactivated");
      }

      if (
            admin.passwordChangedAt &&
            typeof payload.iat === "number" &&
            payload.iat * 1000 < new Date(admin.passwordChangedAt).getTime()
      ) {
            auditWarn("auth.reject", {
                  reason: "password_changed_after_issue",
                  adminId: admin._id,
            });
            throw ApiError.unauthorized("Session invalidated by a password change");
      }

      const session = await adminSessionRepository.findActiveById(payload.sid);
      if (!session) {
            auditWarn("auth.reject", {
                  reason: "session_inactive",
                  adminId: admin._id,
                  sessionId: payload.sid,
            });
            throw ApiError.unauthorized("Session is no longer active");
      }

      adminSessionRepository
            .touch({
                  sessionId: session._id,
                  userAgent: String(req.get("user-agent") || "").slice(0, 500),
                  ipAddress: String(req.ip || "").slice(0, 100),
            })
            .catch(() => {});

      req.admin = {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            sessionId: session._id,
      };

      next();
});

export { authenticate };
export default authenticate;
