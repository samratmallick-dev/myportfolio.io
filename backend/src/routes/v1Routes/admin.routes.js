import { Router } from "express";
import adminController from "../../controllers/admin.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdminRole } from "../../middleware/admin-authorization.middleware.js";
import { verifyBrowserOrigin } from "../../middleware/csrf.middleware.js";
import {
      adminCreateLimiter,
      bootstrapLimiter,
      loginLimiter,
      otpLimiter,
      passwordChangeLimiter,
      refreshLimiter,
} from "../../middleware/rate-limit.middleware.js";
import {
      handleValidationErrors,
      rejectUnknownFields,
      validateBootstrap,
      validateChangePassword,
      validateCreateAdmin,
      validateEmailUpdate,
      validateGenerateOTP,
      validateLogin,
      validatePasswordUpdate,
      validateSessionId,
} from "../../middleware/validation.middleware.js";

const router = Router();

router.post(
      "/bootstrap",
      bootstrapLimiter,
      verifyBrowserOrigin,
      validateBootstrap,
      handleValidationErrors,
      rejectUnknownFields("username", "email", "password"),
      adminController.bootstrap
);

router.post(
      "/login",
      loginLimiter,
      verifyBrowserOrigin,
      validateLogin,
      handleValidationErrors,
      rejectUnknownFields("email", "password"),
      adminController.login
);

router.post("/refresh", refreshLimiter, verifyBrowserOrigin, adminController.refresh);

router.post("/logout", verifyBrowserOrigin, adminController.logout);
router.post("/logout-all", authenticate, verifyBrowserOrigin, adminController.logoutAll);

router.get("/me", authenticate, adminController.getAdminUser);
router.get("/get-admin-user", authenticate, adminController.getAdminUser);

router.get("/sessions", authenticate, adminController.listSessions);
router.delete(
      "/sessions/:id",
      authenticate,
      validateSessionId,
      handleValidationErrors,
      adminController.revokeSession
);

router.patch(
      "/change-password",
      authenticate,
      passwordChangeLimiter,
      verifyBrowserOrigin,
      validateChangePassword,
      handleValidationErrors,
      rejectUnknownFields("currentPassword", "newPassword", "confirmPassword"),
      adminController.changePassword
);

router.post(
      "/create",
      authenticate,
      requireAdminRole("admin"),
      adminCreateLimiter,
      verifyBrowserOrigin,
      validateCreateAdmin,
      handleValidationErrors,
      rejectUnknownFields("username", "email", "password"),
      adminController.createAdmin
);

router.post(
      "/generate-otp",
      authenticate,
      otpLimiter,
      validateGenerateOTP,
      handleValidationErrors,
      adminController.generateOTP
);
router.post(
      "/verify-otp-update-email",
      authenticate,
      otpLimiter,
      validateEmailUpdate,
      handleValidationErrors,
      adminController.verifyOTPAndUpdateEmail
);
router.post(
      "/verify-otp-update-password",
      authenticate,
      otpLimiter,
      passwordChangeLimiter,
      validatePasswordUpdate,
      handleValidationErrors,
      adminController.verifyOTPAndUpdatePassword
);

export default router;
