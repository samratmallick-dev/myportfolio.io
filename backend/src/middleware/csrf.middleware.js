import ApiError from "../utilities/error/apiError.js";
import getAllowedOrigins from "../config/cors/cors.config.js";
import { auditWarn } from "../utilities/audit.util.js";

export const verifyBrowserOrigin = (req, res, next) => {
      const origin = req.get("origin");

      if (!origin) {
            return next();
      }

      const allowedOrigins = getAllowedOrigins();
      const host = req.get("host");

      const isSameHost = Boolean(host) &&
            (origin === `http://${host}` || origin === `https://${host}`);

      if (allowedOrigins.includes(origin) || isSameHost) {
            return next();
      }

      auditWarn("csrf.reject", {
            reason: "origin_not_allowed",
            origin,
            path: req.path,
            method: req.method,
            ip: req.ip,
      });

      return next(ApiError.forbidden("Request origin is not allowed"));
};

export default verifyBrowserOrigin;
