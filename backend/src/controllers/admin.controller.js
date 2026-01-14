import adminService from "../service/admin.service.js";
import { sendCreated, sendSuccess } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import Logger from "../config/logger/logger.config.js";

class AdminController {
      initializeAdmin = asyncHandler(async (req, res) => {
            const adminData = req.body;
            const admin = await adminService.initializeAdmin(adminData);
            sendCreated(res, "Admin initialized successfully", admin);
      });

      login = asyncHandler(async (req, res) => {
            const loginData = req.body;
            const { admin, token } = await adminService.login(loginData);

            const options = {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "strict",
                  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            };

            res.cookie("token", token, options);
            sendSuccess(res, "Login successful", { admin, token });
      });

      logout = asyncHandler(async (req, res) => {
            res.clearCookie("token");
            sendSuccess(res, "Logout successful");
      });

      getAdminUser = asyncHandler(async (req, res) => {
            const adminId = req.admin.id;
            const admin = await adminService.getAdminUser(adminId);
            sendSuccess(res, "Admin user retrieved successfully", admin);
      });

      generateOTP = asyncHandler(async (req, res) => {
            const { purpose } = req.body;
            const adminId = req.admin.id;
            Logger.info('OTP generation request', { adminId, purpose, newEmail: req.body.newEmail });
            
            const result = await adminService.generateOTPForEmailUpdate({ adminId, purpose, newEmail: req.body.newEmail });
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
            sendSuccess(res, "Password updated successfully", admin);
      });
}
// console.log("initializeAdmin length:", this.initializeAdmin.length);

export default new AdminController();

