import ApiError from "../utilities/error/apiError.js";
import { auditWarn } from "../utilities/audit.util.js";

export const requireAdminRole = (...allowedRoles) => {
      return (req, res, next) => {
            if (!req.admin) {
                  auditWarn("authz.reject", { reason: "not_authenticated", path: req.path });
                  return next(ApiError.unauthorized("Authentication required"));
            }

            const role = req.admin.role;

            if (allowedRoles.length === 0 || !allowedRoles.includes(role)) {
                  auditWarn("authz.reject", {
                        reason: "role_not_allowed",
                        role,
                        path: req.path,
                        adminId: String(req.admin.id),
                  });
                  return next(
                        ApiError.forbidden("You do not have permission to perform this action")
                  );
            }

            return next();
      };
};

export const requireAdmin = requireAdminRole("admin");

export default requireAdminRole;
