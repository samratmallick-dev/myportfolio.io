import rateLimit from "express-rate-limit";
import { auditWarn } from "../utilities/audit.util.js";

const num = (value, fallback) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const isRateLimitDisabled = () => process.env.RATE_LIMIT_DISABLED === "true";

const buildMessage = (name) =>
      `Too many ${name} attempts. Please wait a moment and try again.`;

const baseOptions = (name) => ({
      windowMs: 15 * 60 * 1000,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => isRateLimitDisabled(),
      handler: (req, res) => {
            auditWarn("ratelimit.block", {
                  rule: name,
                  path: req.path,
                  method: req.method,
                  ip: req.ip,
            });
            res.status(429).json({
                  success: false,
                  message: buildMessage(name),
            });
      },
});

/**
 * @param {{name: string, windowMs?: number, max?: number}} config
 */
export const createRateLimiter = ({ name, windowMs, max }) => {
      return rateLimit({
            ...baseOptions(name),
            windowMs: num(windowMs, 15 * 60 * 1000),
            max: num(max, 10),
      });
};

export const loginLimiter = createRateLimiter({
      name: "login",
      windowMs: num(process.env.LOGIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: num(process.env.LOGIN_RATE_LIMIT_MAX, 10),
});

export const bootstrapLimiter = createRateLimiter({
      name: "bootstrap",
      windowMs: num(process.env.BOOTSTRAP_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
      max: num(process.env.BOOTSTRAP_RATE_LIMIT_MAX, 5),
});

export const refreshLimiter = createRateLimiter({
      name: "refresh",
      windowMs: num(process.env.REFRESH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: num(process.env.REFRESH_RATE_LIMIT_MAX, 60),
});

export const passwordChangeLimiter = createRateLimiter({
      name: "password change",
      windowMs: num(process.env.PASSWORD_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: num(process.env.PASSWORD_RATE_LIMIT_MAX, 5),
});

export const adminCreateLimiter = createRateLimiter({
      name: "admin creation",
      windowMs: num(process.env.ADMIN_CREATE_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
      max: num(process.env.ADMIN_CREATE_RATE_LIMIT_MAX, 10),
});

export const otpLimiter = createRateLimiter({
      name: "OTP",
      windowMs: num(process.env.OTP_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: num(process.env.OTP_RATE_LIMIT_MAX, 8),
});
