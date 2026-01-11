import { Router } from "express";
import adminController from "../../controllers/admin.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateAdminInitialization, validateLogin, validateEmailUpdate, validatePasswordUpdate, validateGenerateOTP, handleValidationErrors } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/initialize", validateAdminInitialization, handleValidationErrors, adminController.initializeAdmin);
router.post("/login", validateLogin, handleValidationErrors, adminController.login);
router.post("/logout", authenticate, adminController.logout);
router.get("/get-admin-user", authenticate, adminController.getAdminUser);
router.post("/generate-otp", authenticate, validateGenerateOTP, handleValidationErrors, adminController.generateOTP);
router.post("/verify-otp-update-email", authenticate, validateEmailUpdate, handleValidationErrors, adminController.verifyOTPAndUpdateEmail);
router.post("/verify-otp-update-password", authenticate, validatePasswordUpdate, handleValidationErrors, adminController.verifyOTPAndUpdatePassword);



export default router;
