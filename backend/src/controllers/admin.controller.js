import adminService from "../service/admin.service.js";
import { sendCreated, sendSuccess } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import ApiError from "../utilities/error/apiError.js";
import Logger from "../config/logger/logger.config.js";
import {
      clearLegacyTokenCookie,
      clearRefreshTokenCookie,
      getRawRefreshToken,
      setRefreshTokenCookie,
} from "../utilities/cookie.utility.js";
import { verifyAccessToken } from "../utilities/token.utility.js";

class AdminController {
      bootstrap = asyncHandler(async (req, res) => {
            const secret = req.get("X-Admin-Bootstrap-Secret");
            const admin = await adminService.bootstrap(req.body, secret, req);

            clearRefreshTokenCookie(res);

            return sendCreated(res, "Initial admin created successfully", {
                  admin: admin.toJSON(),
            });
      });

      login = asyncHandler(async (req, res) => {
            const { admin, accessToken, refreshToken } = await adminService.login(
                  req.body,
                  req
            );

            setRefreshTokenCookie(res, refreshToken);
            clearLegacyTokenCookie(res);

            return sendSuccess(res, "Login successful", {
                  admin: admin.toJSON ? admin.toJSON() : admin,
                  accessToken,
            });
      });

      refresh = asyncHandler(async (req, res) => {
            const rawRefreshToken = getRawRefreshToken(req);

            if (!rawRefreshToken) {
                  throw ApiError.unauthorized("Refresh token is required");
            }

            const { admin, accessToken, refreshToken } = await adminService.refresh(
                  rawRefreshToken,
                  req
            );

            setRefreshTokenCookie(res, refreshToken);

            return sendSuccess(res, "Session refreshed", {
                  admin: admin.toJSON ? admin.toJSON() : admin,
                  accessToken,
            });
      });

      logout = asyncHandler(async (req, res) => {
            let sessionId = null;

            const authorization = req.get("authorization") || "";
            if (authorization.startsWith("Bearer ")) {
                  try {
                        sessionId = verifyAccessToken(authorization.slice(7).trim()).sid;
                  } catch {
                        sessionId = null;
                  }
            }

            try {
                  await adminService.logout(
                        { rawRefreshToken: getRawRefreshToken(req), sessionId },
                        req
                  );
            } finally {
                  clearRefreshTokenCookie(res);
            }

            return sendSuccess(res, "Logout successful");
      });

      logoutAll = asyncHandler(async (req, res) => {
            try {
                  await adminService.logoutAll(req.admin.id, req);
            } finally {
                  clearRefreshTokenCookie(res);
            }

            return sendSuccess(res, "Logged out of all sessions");
      });

      getAdminUser = asyncHandler(async (req, res) => {
            const admin = await adminService.getAdminUser(req.admin.id);
            return sendSuccess(res, "Admin user retrieved successfully", { admin });
      });

      listSessions = asyncHandler(async (req, res) => {
            const sessions = await adminService.listSessions(
                  req.admin.id,
                  req.admin.sessionId
            );
            return sendSuccess(res, "Active sessions retrieved successfully", { sessions });
      });

      revokeSession = asyncHandler(async (req, res) => {
            const session = await adminService.revokeSession(
                  req.admin.id,
                  req.params.id,
                  req.admin.sessionId
            );
            return sendSuccess(res, "Session revoked successfully", { session });
      });

      changePassword = asyncHandler(async (req, res) => {
            const result = await adminService.changePassword(req.admin.id, req.body, req);
            clearRefreshTokenCookie(res);
            return sendSuccess(res, "Password changed. Please sign in again.", result);
      });

      createAdmin = asyncHandler(async (req, res) => {
            const admin = await adminService.createAdmin(req.body, req.admin.id, req);
            return sendCreated(res, "Admin created successfully", { admin });
      });

      generateOTP = asyncHandler(async (req, res) => {
            const { purpose, newEmail } = req.body;
            const adminId = req.admin.id;
            Logger.info('OTP generation request', { adminId, purpose });
            const result = await adminService.generateOTPForEmailUpdate({
                  adminId,
                  purpose,
                  newEmail
            });
            sendSuccess(res, result.message);
      });


      verifyOTPAndUpdateEmail = asyncHandler(async (req, res) => {
            const { otp } = req.body;
            const adminId = req.admin.id;
            const admin = await adminService.verifyOTPAndUpdateEmail(adminId, otp);
            sendSuccess(res, "Email updated successfully", admin);
      });

      verifyOTPAndUpdatePassword = asyncHandler(async (req, res) => {
            const { otp, newPassword } = req.body;
            const adminId = req.admin.id;
            const admin = await adminService.verifyOTPAndUpdatePassword(adminId, otp, newPassword);
            clearRefreshTokenCookie(res);
            sendSuccess(res, "Password updated successfully", admin);
      });
};

export default new AdminController();