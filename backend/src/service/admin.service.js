import adminRepository from "../repository/admin.repository.js";
import adminSessionRepository from "../repository/adminSession.repository.js";
import ApiError from "../utilities/error/apiError.js";
import Logger from "../config/logger/logger.config.js";
import { auditLog, auditWarn } from "../utilities/audit.util.js";
import {
      comparePassword,
      hashPassword,
} from "../utilities/password.utility.js";
import {
      createAccessToken,
      generateRefreshToken,
      hashRefreshToken,
      isWellFormedRefreshToken,
      timingSafeEqualStrings,
} from "../utilities/token.utility.js";
import { generateOTP } from "../utilities/email/generateOTP.js";
import emailService from "../utilities/email/email.service.js";
import templateService from "../utilities/email/template.service.js";

const refreshDays = () => {
      const ttl = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
      return Number.isInteger(ttl) && ttl >= 1 && ttl <= 30 ? ttl : 7;
};

const refreshExpiry = () => new Date(Date.now() + refreshDays() * 24 * 60 * 60 * 1000);

const refreshRaceGraceMs = () => {
      const raw = Number(process.env.REFRESH_RACE_GRACE_MS);
      return Number.isFinite(raw) && raw >= 0 ? raw : 10000;
};

const requestMeta = (req = {}) => ({
      userAgent: String(req.get?.("user-agent") || req.headers?.["user-agent"] || "").slice(0, 500),
      ipAddress: String(req.ip || req.headers?.["x-forwarded-for"] || "").slice(0, 100),
});

const publicAdmin = (admin) => {
      if (!admin) return null;
      const obj = typeof admin.toObject === "function" ? admin.toObject() : { ...admin };
      delete obj.password;
      delete obj.otp;
      delete obj.otpExpiry;
      delete obj.newEmail;
      delete obj.bootstrapKey;
      delete obj.__v;
      return {
            id: obj._id?.toString?.() ?? String(obj._id),
            _id: obj._id,
            username: obj.username,
            email: obj.email,
            role: obj.role,
            isActive: obj.isActive,
            lastLogin: obj.lastLogin,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
      };
};

let bootstrapChain = Promise.resolve();
const withBootstrapLock = (task) => {
      const run = bootstrapChain.then(task, task);
      bootstrapChain = run.then(
            () => undefined,
            () => undefined
      );
      return run;
};

class AdminService {
      async bootstrap({ username, email, password }, providedSecret, req) {
            const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

            if (!expectedSecret) {
                  auditWarn("admin.bootstrap.rejected", {
                        reason: "bootstrap_disabled",
                        ip: req?.ip,
                  });
                  throw ApiError.forbidden("Bootstrap is not available");
            }

            if (
                  typeof providedSecret !== "string" ||
                  !providedSecret ||
                  !timingSafeEqualStrings(providedSecret, expectedSecret)
            ) {
                  auditWarn("admin.bootstrap.rejected", {
                        reason: "invalid_secret",
                        ip: req?.ip,
                        path: req?.path,
                  });
                  throw ApiError.forbidden("Invalid bootstrap secret");
            }

            const passwordHash = await hashPassword(password);
            const normalizedEmail = String(email).toLowerCase().trim();

            return await withBootstrapLock(async () => {
                  if (await adminRepository.adminExists()) {
                        auditWarn("admin.bootstrap.rejected", {
                              reason: "already_initialized",
                              ip: req?.ip,
                        });
                        throw ApiError.conflict("Admin initialization already completed");
                  }

                  try {
                        const admin = await adminRepository.createInitialAdmin({
                              username,
                              email: normalizedEmail,
                              password: passwordHash,
                        });
                        auditLog("admin.bootstrap.success", {
                              adminId: String(admin._id),
                              ip: req?.ip,
                        });
                        return admin;
                  } catch (error) {
                        if (error?.code === 11000) {
                              auditWarn("admin.bootstrap.rejected", {
                                    reason: "already_initialized_race",
                                    ip: req?.ip,
                              });
                              throw ApiError.conflict("Admin initialization already completed");
                        }
                        throw error;
                  }
            });
      }

      async login({ email, password }, req) {
            const admin = await adminRepository.findByEmailWithPassword(email);

            if (!admin) {
                  auditWarn("admin.login.failed", { reason: "unknown_email", ip: req?.ip });
                  throw ApiError.unauthorized("Invalid email or password");
            }

            const isValidPassword = await comparePassword(password, admin.password);
            if (!isValidPassword) {
                  auditWarn("admin.login.failed", {
                        reason: "bad_password",
                        adminId: String(admin._id),
                        ip: req?.ip,
                  });
                  throw ApiError.unauthorized("Invalid email or password");
            }

            if (!admin.isActive) {
                  auditWarn("admin.login.failed", {
                        reason: "inactive",
                        adminId: String(admin._id),
                        ip: req?.ip,
                  });
                  throw ApiError.unauthorized("Account is deactivated");
            }

            const rawRefreshToken = generateRefreshToken();
            const meta = requestMeta(req);

            const session = await adminSessionRepository.create({
                  adminId: admin._id,
                  refreshTokenHash: hashRefreshToken(rawRefreshToken),
                  expiresAt: refreshExpiry(),
                  ...meta,
            });

            const accessToken = createAccessToken(admin, session._id);

            await adminRepository.updateLastLogin(admin._id);

            auditLog("admin.login.success", {
                  adminId: String(admin._id),
                  sessionId: String(session._id),
                  ip: req?.ip,
            });

            return {
                  admin,
                  accessToken,
                  // Raw refresh token -> HTTP-only cookie only, never JSON.
                  refreshToken: rawRefreshToken,
                  session,
            };
      }

      async refresh(rawRefreshToken, req) {
            if (!isWellFormedRefreshToken(rawRefreshToken)) {
                  throw ApiError.unauthorized("Refresh token is required");
            }

            const presentedHash = hashRefreshToken(rawRefreshToken);
            const now = new Date();
            const meta = requestMeta(req);

            const session = await adminSessionRepository.findByRefreshTokenHash(presentedHash);

            if (!session) {
                  const replayed = await adminSessionRepository.findByPreviousTokenHash(presentedHash);
                  if (replayed) {
                        await this.#handleReplayedToken(replayed, presentedHash, now, req);
                  }
                  throw ApiError.unauthorized("Invalid refresh token");
            }

            if (session.revokedAt) {
                  auditWarn("admin.refresh.rejected", {
                        reason: "session_revoked",
                        sessionId: String(session._id),
                  });
                  throw ApiError.unauthorized("Session has been revoked");
            }

            if (session.isExpired(now)) {
                  auditWarn("admin.refresh.rejected", {
                        reason: "session_expired",
                        sessionId: String(session._id),
                  });
                  throw ApiError.unauthorized("Refresh token has expired");
            }

            const admin = await adminRepository.findById(session.adminId);
            if (!admin || !admin.isActive) {
                  await adminSessionRepository.revokeById(session._id).catch(() => {});
                  auditWarn("admin.refresh.rejected", {
                        reason: admin ? "inactive_admin" : "admin_missing",
                        adminId: String(session.adminId),
                  });
                  throw ApiError.unauthorized("Invalid refresh token");
            }

            const nextRawRefreshToken = generateRefreshToken();

            const rotated = await adminSessionRepository.rotate({
                  sessionId: session._id,
                  currentHash: presentedHash,
                  nextHash: hashRefreshToken(nextRawRefreshToken),
                  expiresAt: refreshExpiry(),
                  ...meta,
            });

            if (!rotated) {
                  const latest = await adminSessionRepository.findById(session._id);
                  if (latest) {
                        await this.#handleReplayedToken(latest, presentedHash, new Date(), req);
                  }
                  throw ApiError.unauthorized("Refresh token has already been rotated");
            }

            auditLog("admin.refresh.success", {
                  adminId: String(admin._id),
                  sessionId: String(session._id),
                  ip: req?.ip,
            });

            return {
                  admin,
                  accessToken: createAccessToken(admin, session._id),
                  refreshToken: nextRawRefreshToken,
                  session: rotated,
            };
      }

      async #handleReplayedToken(session, presentedHash, now, req) {
            const history = Array.isArray(session.previousTokenHashes)
                  ? session.previousTokenHashes
                  : [];
            const isImmediatePredecessor = history[history.length - 1] === presentedHash;
            const rotatedAt = session.updatedAt ? new Date(session.updatedAt).getTime() : 0;
            const withinGrace =
                  now.getTime() - rotatedAt <= refreshRaceGraceMs();

            if (!session.revokedAt && isImmediatePredecessor && withinGrace) {
                  auditWarn("admin.refresh.concurrent_rotation", {
                        adminId: String(session.adminId),
                        sessionId: String(session._id),
                        ip: req?.ip,
                  });
                  throw ApiError.unauthorized(
                        "Refresh token was already rotated. Please retry the request."
                  );
            }

            await adminSessionRepository.revokeById(session._id).catch(() => {});
            auditWarn("admin.refresh.reuse_detected", {
                  adminId: String(session.adminId),
                  sessionId: String(session._id),
                  ip: req?.ip,
            });
            throw ApiError.unauthorized("Refresh token reuse detected. Session revoked.");
      }

      async logout({ rawRefreshToken, sessionId }, req) {
            const hashes = [];
            if (isWellFormedRefreshToken(rawRefreshToken)) {
                  hashes.push(hashRefreshToken(rawRefreshToken));
            }

            if (hashes.length > 0) {
                  await adminSessionRepository.revokeByHashes(hashes);
            }
            if (sessionId) {
                  await adminSessionRepository.revokeById(sessionId).catch(() => {});
            }

            auditLog("admin.logout", { sessionId: sessionId ? String(sessionId) : undefined, ip: req?.ip });
            return true;
      }

      async logoutAll(adminId, req) {
            const result = await adminSessionRepository.revokeAllForAdmin(adminId);
            auditLog("admin.logout_all", {
                  adminId: String(adminId),
                  revoked: result?.modifiedCount ?? 0,
                  ip: req?.ip,
            });
            return result?.modifiedCount ?? 0;
      }

      async getAdminUser(adminId) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");
            if (!admin.isActive) throw ApiError.unauthorized("Account is deactivated");
            return publicAdmin(admin);
      }

      async listSessions(adminId, currentSessionId) {
            const sessions = await adminSessionRepository.listActiveForAdmin(adminId);
            return sessions.map((session) => ({
                  ...session.toSafeObject(),
                  isCurrent:
                        String(currentSessionId || "") === String(session._id),
            }));
      }

      async revokeSession(adminId, sessionId, currentSessionId) {
            const session = await adminSessionRepository.revokeSessionForAdmin(sessionId, adminId);
            if (!session) {
                  throw ApiError.notFound("Session not found");
            }
            auditLog("admin.session.revoked", {
                  adminId: String(adminId),
                  sessionId: String(sessionId),
                  self: String(sessionId) === String(currentSessionId),
            });
            return session.toSafeObject();
      }

      async changePassword(adminId, { currentPassword, newPassword }, req) {
            const admin = await adminRepository.findByIdWithSecrets(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");
            if (!admin.isActive) throw ApiError.unauthorized("Account is deactivated");

            const isValid = await comparePassword(currentPassword, admin.password);
            if (!isValid) {
                  auditWarn("admin.password.change_failed", {
                        reason: "wrong_current_password",
                        adminId: String(adminId),
                        ip: req?.ip,
                  });
                  throw ApiError.unauthorized("Current password is incorrect");
            }

            if (await comparePassword(newPassword, admin.password)) {
                  throw ApiError.badRequest("New password must be different from the current password");
            }

            const passwordHash = await hashPassword(newPassword);
            const passwordChangedAt = new Date();

            await adminRepository.updateById(adminId, {
                  $set: { password: passwordHash, passwordChangedAt },
                  $unset: { otp: 1, otpExpiry: 1 },
            });

            const revoked = await adminSessionRepository.revokeAllForAdmin(adminId);

            auditLog("admin.password.changed", {
                  adminId: String(adminId),
                  revokedSessions: revoked?.modifiedCount ?? 0,
                  ip: req?.ip,
            });

            return { revokedSessions: revoked?.modifiedCount ?? 0 };
      }
      async createAdmin({ username, email, password }, createdBy, req) {
            const normalizedEmail = String(email).toLowerCase().trim();

            const [emailTaken, usernameTaken] = await Promise.all([
                  adminRepository.findByEmail(normalizedEmail),
                  adminRepository.findByUsername(username),
            ]);

            if (emailTaken) throw ApiError.conflict("Email is already in use");
            if (usernameTaken) throw ApiError.conflict("Username is already in use");

            const passwordHash = await hashPassword(password);

            try {
                  const admin = await adminRepository.create({
                        username,
                        email: normalizedEmail,
                        password: passwordHash,
                        isActive: true,
                        role: "admin",
                  });

                  auditLog("admin.created", {
                        adminId: String(admin._id),
                        createdBy: String(createdBy),
                        ip: req?.ip,
                  });

                  return publicAdmin(admin);
            } catch (error) {
                  if (error?.code === 11000) {
                        throw ApiError.conflict("Username or email is already in use");
                  }
                  throw error;
            }
      }

      async generateOTPForEmailUpdate({ adminId, purpose, newEmail }) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            await adminRepository.updateById(adminId, {
                  otp,
                  otpExpiry,
                  ...(purpose === "email_update" && { newEmail })
            });

            const emailTo = purpose === "email_update" ? newEmail : admin.email;
            const subject =
                  purpose === "email_update"
                        ? "Email Update OTP"
                        : "Password Update OTP";

            const html = await templateService.render("otp-email", {
                  otp,
                  purpose: subject,
                  expiryMinutes: "10"
            });

            setImmediate(async () => {
                  try {
                        await emailService.sendMail({
                              to: emailTo,
                              subject,
                              html,
                              text: `Your OTP is ${otp}. It expires in 10 minutes.`
                        });

                        Logger.info("OTP email sent", { emailTo });
                  } catch (err) {
                        Logger.error("OTP email failed (ignored)", {
                              emailTo,
                              error: err.message
                        });
                  }
            });

            auditLog("admin.otp.generated", { adminId: String(adminId), purpose });

            return {
                  success: true,
                  message: "OTP generated successfully"
            };
      }

      async #verifyStoredOtp(adminId, otp) {
            const admin = await adminRepository.findByIdWithSecrets(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            if (!admin.otp || !admin.otpExpiry) {
                  throw ApiError.badRequest("No OTP request found");
            }

            if (!timingSafeEqualStrings(String(admin.otp), String(otp))) {
                  auditWarn("admin.otp.failed", { adminId: String(adminId) });
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  auditWarn("admin.otp.failed", {
                        adminId: String(adminId),
                        reason: "expired",
                  });
                  throw ApiError.badRequest("OTP expired");
            }

            return admin;
      }

      async verifyOTPAndUpdateEmail(adminId, otp) {
            const admin = await this.#verifyStoredOtp(adminId, otp);

            auditLog("admin.email.changed", { adminId: String(adminId) });

            return adminRepository.updateById(adminId, {
                  $set: { email: admin.newEmail },
                  $unset: { otp: 1, otpExpiry: 1, newEmail: 1 },
            });
      }

      async verifyOTPAndUpdatePassword(adminId, otp, newPassword) {
            await this.#verifyStoredOtp(adminId, otp);

            const passwordHash = await hashPassword(newPassword);
            const passwordChangedAt = new Date();

            await adminRepository.updateById(adminId, {
                  $set: { password: passwordHash, passwordChangedAt },
                  $unset: { otp: 1, otpExpiry: 1 },
            });

            const revoked = await adminSessionRepository.revokeAllForAdmin(adminId);

            auditLog("admin.password.changed", {
                  adminId: String(adminId),
                  via: "otp",
                  revokedSessions: revoked?.modifiedCount ?? 0,
            });

            return publicAdmin(await adminRepository.findById(adminId));
      }
}

export default new AdminService();
export { publicAdmin };