import { Router } from "express";
import adminController from "../../controllers/admin.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateAdminInitialization, validateLogin, validateEmailUpdate, validatePasswordUpdate } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/initialize", validateAdminInitialization, adminController.initializeAdmin);
router.post("/login", validateLogin, adminController.login);
router.post("/logout", authenticate, adminController.logout);
router.get("/get-admin-user", authenticate, adminController.getAdminUser);
router.post("/generate-otp", authenticate, adminController.generateOTP);
router.post("/verify-otp-update-email", authenticate, validateEmailUpdate, adminController.verifyOTPAndUpdateEmail);
router.post("/verify-otp-update-password", authenticate, validatePasswordUpdate, adminController.verifyOTPAndUpdatePassword);

export default router;
