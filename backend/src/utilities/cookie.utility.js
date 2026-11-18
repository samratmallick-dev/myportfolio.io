export const REFRESH_COOKIE_NAME = "refreshToken";

export const LEGACY_COOKIE_NAME = "token";
export const LEGACY_COOKIE_PATH = "/";

export const REFRESH_COOKIE_PATH = "/api/v1/admin";

const VALID_SAME_SITE = ["lax", "strict", "none"];

const resolveSecure = () => {
      if (process.env.COOKIE_SECURE !== undefined && process.env.COOKIE_SECURE !== "") {
            return process.env.COOKIE_SECURE === "true";
      }
      return process.env.NODE_ENV === "production";
};

const resolveSameSite = () => {
      if (process.env.COOKIE_SAME_SITE) {
            return process.env.COOKIE_SAME_SITE.toLowerCase();
      }
      return process.env.NODE_ENV === "production" ? "none" : "lax";
};

export const getRefreshTokenTtlDays = () => {
      const ttl = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
      if (!Number.isInteger(ttl) || ttl < 1 || ttl > 30) {
            throw new Error("REFRESH_TOKEN_TTL_DAYS must be an integer between 1 and 30");
      }
      return ttl;
};

export const getRefreshCookieOptions = () => {
      const sameSite = resolveSameSite();
      const secure = resolveSecure();
      const ttlDays = getRefreshTokenTtlDays();

      if (!VALID_SAME_SITE.includes(sameSite)) {
            throw new Error(`Invalid cookie same-site configuration: ${sameSite}`);
      }

      if (sameSite === "none" && !secure) {
            throw new Error("SameSite=None requires secure cookies (COOKIE_SECURE=true)");
      }

      return {
            httpOnly: true,
            secure,
            sameSite,
            path: REFRESH_COOKIE_PATH,
            maxAge: ttlDays * 24 * 60 * 60 * 1000,
      };
};

export const setRefreshTokenCookie = (res, rawRefreshToken) => {
      const options = getRefreshCookieOptions();
      if (typeof rawRefreshToken !== "string" || !rawRefreshToken) {
            throw new Error("A raw refresh token is required to set the refresh cookie");
      }
      return res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, options);
};

export const clearRefreshTokenCookie = (res) => {
      const { maxAge, ...options } = getRefreshCookieOptions();
      res.clearCookie(REFRESH_COOKIE_NAME, options);
      res.clearCookie(LEGACY_COOKIE_NAME, { ...options, path: LEGACY_COOKIE_PATH });
      return res;
};

/** Drops only the legacy cookie (used right after a successful login). */
export const clearLegacyTokenCookie = (res) => {
      const { maxAge, ...options } = getRefreshCookieOptions();
      return res.clearCookie(LEGACY_COOKIE_NAME, { ...options, path: LEGACY_COOKIE_PATH });
};

export const getRawRefreshToken = (req) => {
      const value = req?.cookies?.[REFRESH_COOKIE_NAME];
      return typeof value === "string" && value ? value : null;
};
