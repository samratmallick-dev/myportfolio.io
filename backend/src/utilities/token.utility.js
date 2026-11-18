import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const ACCESS_TOKEN_TYPE = "access";
export const SUPPORTED_ALGORITHM = "HS256";
export const MIN_SECRET_LENGTH = 32;

const getJwtConfig = () => {
      const secret = process.env.JWT_ACCESS_SECRET;

      if (!secret || secret.length < MIN_SECRET_LENGTH) {
            throw new Error(
                  `JWT_ACCESS_SECRET must contain at least ${MIN_SECRET_LENGTH} characters`
            );
      }

      const issuer = process.env.JWT_ISSUER;
      const audience = process.env.JWT_AUDIENCE;

      if (!issuer || !audience) {
            throw new Error("JWT_ISSUER and JWT_AUDIENCE must be configured");
      }

      return {
            secret,
            issuer,
            audience,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      };
};

/**
 * @param {{_id: any, role: string}} admin
 * @param {string} sessionId  the active AdminSession id (`sid` claim)
 */
export const createAccessToken = (admin, sessionId) => {
      const { secret, issuer, audience, expiresIn } = getJwtConfig();

      if (!sessionId) {
            throw new Error("A session id is required to issue an access token");
      }

      return jwt.sign(
            {
                  role: admin.role,
                  sid: sessionId.toString(),
                  type: ACCESS_TOKEN_TYPE,
            },
            secret,
            {
                  algorithm: SUPPORTED_ALGORITHM,
                  expiresIn,
                  issuer,
                  audience,
                  subject: admin._id.toString(),
            }
      );
};

/** @returns {{sub: string, sid: string, role: string, type: string}} */
export const verifyAccessToken = (token) => {
      const { secret, issuer, audience } = getJwtConfig();

      if (typeof token !== "string" || !token) {
            throw new Error("Access token is required");
      }

      const payload = jwt.verify(token, secret, {
            algorithms: [SUPPORTED_ALGORITHM],
            issuer,
            audience,
      });

      if (
            typeof payload === "string" ||
            payload.type !== ACCESS_TOKEN_TYPE ||
            typeof payload.sub !== "string" ||
            typeof payload.sid !== "string" ||
            typeof payload.role !== "string"
      ) {
            throw new Error("Invalid access token");
      }

      return payload;
};

export const generateRefreshToken = () => crypto.randomBytes(64).toString("base64url");

export const hashRefreshToken = (token) =>
      crypto.createHash("sha256").update(String(token)).digest("hex");

export const isWellFormedRefreshToken = (token) =>
      typeof token === "string" && token.length >= 64 && /^[A-Za-z0-9_-]+$/.test(token);

export const timingSafeEqualStrings = (a, b) => {
      const bufferA = Buffer.from(String(a ?? ""), "utf8");
      const bufferB = Buffer.from(String(b ?? ""), "utf8");
      if (bufferA.length !== bufferB.length) {
            crypto.timingSafeEqual(bufferA, bufferA);
            return false;
      }
      return crypto.timingSafeEqual(bufferA, bufferB);
};
