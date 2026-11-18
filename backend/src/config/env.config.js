import Logger from "./logger/logger.config.js";
import { MIN_SECRET_LENGTH } from "../utilities/token.utility.js";

/**
 * Startup configuration validation.
 *
 * Fails fast (before the HTTP server accepts traffic) when authentication
 * secrets are missing or unsafe in production. Never prints secret values.
 */

const VALID_SAME_SITE = ["lax", "strict", "none"];

const problems = [];
const warnings = [];

const requireValue = (name, { minLength, requiredInProduction = true }) => {
      const raw = process.env[name];
      const isProduction = process.env.NODE_ENV === "production";

      if (!raw || !String(raw).trim()) {
            if (requiredInProduction && isProduction) {
                  problems.push(`${name} is not set (required in production)`);
            } else if (requiredInProduction) {
                  problems.push(`${name} is not set`);
            } else if (isProduction) {
                  warnings.push(`${name} is not set`);
            }
            return;
      }

      if (minLength && String(raw).trim().length < minLength) {
            problems.push(`${name} must be at least ${minLength} characters long`);
      }
};

const validateNumberRange = (name, min, max, fallback) => {
      const raw = process.env[name];
      if (raw === undefined || raw === "") return;
      const value = Number(raw);
      if (!Number.isInteger(value) || value < min || value > max) {
            problems.push(`${name} must be an integer between ${min} and ${max}`);
      } else if (value !== fallback) {
            // Informational only.
      }
};

const validateCookies = () => {
      const sameSite = (process.env.COOKIE_SAME_SITE || "").toLowerCase();
      const secureRaw = process.env.COOKIE_SECURE;
      const secure = secureRaw !== undefined && secureRaw !== ""
            ? secureRaw === "true"
            : process.env.NODE_ENV === "production";

      if (sameSite && !VALID_SAME_SITE.includes(sameSite)) {
            problems.push(`COOKIE_SAME_SITE must be one of ${VALID_SAME_SITE.join(", ")}`);
      }

      if ((sameSite === "none" || (!sameSite && process.env.NODE_ENV === "production")) && !secure) {
            problems.push("SameSite=None requires COOKIE_SECURE=true");
      }

      if (secureRaw !== undefined && secureRaw !== "" && !["true", "false"].includes(secureRaw)) {
            problems.push("COOKIE_SECURE must be either 'true' or 'false'");
      }
};

/**
 * @returns {{valid: boolean, problems: string[], warnings: string[]}}
 */
export const validateEnvironment = () => {
      problems.length = 0;
      warnings.length = 0;

      const isProduction = process.env.NODE_ENV === "production";

      if (!process.env.MONGO_URL) {
            problems.push("MONGO_URL is not set");
      }

      requireValue("JWT_ACCESS_SECRET", { minLength: MIN_SECRET_LENGTH });
      requireValue("JWT_ISSUER", {});
      requireValue("JWT_AUDIENCE", {});

      // Without a bootstrap secret the first-admin endpoint stays disabled, which
      // is safe but makes a fresh deployment unusable — warn instead of failing.
      requireValue("ADMIN_BOOTSTRAP_SECRET", { minLength: 24, requiredInProduction: false });

      validateNumberRange("REFRESH_TOKEN_TTL_DAYS", 1, 30, 7);
      validateNumberRange("BCRYPT_ROUNDS", 10, 15, 12);
      validateCookies();

      if (process.env.JWT_SECRET) {
            warnings.push(
                  "JWT_SECRET is deprecated and ignored; only JWT_ACCESS_SECRET is used"
            );
      }

      for (const warning of warnings) {
            Logger.warn(`Environment warning: ${warning}`);
      }

      if (problems.length > 0) {
            for (const problem of problems) {
                  Logger.error(`Environment error: ${problem}`);
            }
            // Fail fast: without these values authentication cannot work safely and
            // we must never fall back to a hardcoded secret.
            throw new Error(
                  `Invalid environment configuration:\n- ${problems.join("\n- ")}`
            );
      }

      if (isProduction) {
            // Production-only sanity information; never includes secret values.
            Logger.info("Environment validation passed (production)");
      }

      return { valid: problems.length === 0, problems: [...problems], warnings: [...warnings] };
};

export default validateEnvironment;
