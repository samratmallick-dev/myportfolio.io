import Logger from "../config/logger/logger.config.js";

/**
 * Security audit logging.
 *
 * Records WHO did WHAT and WHEN, and deliberately refuses to record
 * credentials, tokens, cookies, OTPs or hashes even if a caller passes them.
 *
 * Details are serialised into the message because the project's winston
 * formatter only renders the message string.
 */

const SENSITIVE_KEY_PATTERN =
      /password|passwd|pwd|token|secret|cookie|authorization|otp|hash|credential|bootstrap/i;

const redact = (value, depth = 0) => {
      if (value === null || value === undefined) return value;
      if (depth > 3) return "[depth-limit]";
      if (Array.isArray(value)) return value.slice(0, 10).map((item) => redact(item, depth + 1));
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "object") {
            const output = {};
            for (const [key, entry] of Object.entries(value)) {
                  output[key] = SENSITIVE_KEY_PATTERN.test(key)
                        ? "[redacted]"
                        : redact(entry, depth + 1);
            }
            return output;
      }
      if (typeof value === "string" && value.length > 300) {
            return `${value.slice(0, 300)}…`;
      }
      return value;
};

const serialize = (event, details) => {
      try {
            const safe = redact(details);
            const keys = safe && typeof safe === "object" ? Object.keys(safe) : [];
            if (keys.length === 0) return `audit:${event}`;
            return `audit:${event} ${JSON.stringify(safe)}`;
      } catch {
            return `audit:${event}`;
      }
};

/**
 * @param {string} event  dotted audit event name, e.g. "admin.login.success"
 * @param {object} details non-sensitive context
 */
export const auditLog = (event, details = {}) => {
      try {
            Logger.info(serialize(event, details));
      } catch {
            // Audit logging must never break a request.
      }
};

export const auditWarn = (event, details = {}) => {
      try {
            Logger.warn(serialize(event, details));
      } catch {
            // Audit logging must never break a request.
      }
};

export default auditLog;
