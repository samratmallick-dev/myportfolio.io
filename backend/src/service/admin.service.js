import jwt from "jsonwebtoken";
import adminRepository from "../repository/admin.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { generateOTP } from "../utilities/email/generateOTP.js";
import emailService from "../utilities/email/email.service.js";
import templateService from "../utilities/email/template.service.js";
import Logger from "../config/logger/logger.config.js";

class AdminService {

      async generateOTPForEmailUpdate(data) {
            Logger.info("Generate OTP request", data);

            const { adminId, purpose, newEmail } = data;

            if (purpose === "email_update" && !newEmail) {
                  throw ApiError.badRequest("New email is required");
            }

            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            const updateData = { otp, otpExpiry };
            if (purpose === "email_update") updateData.newEmail = newEmail;

            await adminRepository.updateById(adminId, updateData);

            const emailTo =
                  purpose === "email_update" ? newEmail : admin.email;

            const subject =
                  purpose === "email_update"
                        ? "Email Update OTP"
                        : "Password Update OTP";

            const text =
                  purpose === "email_update"
                        ? `Your OTP for email update is ${otp}. Valid for 10 minutes.`
                        : `Your OTP for password update is ${otp}. Valid for 10 minutes.`;

            const emailTitle =
                  purpose === "email_update"
                        ? "Email Update Verification"
                        : "Password Update Verification";

            const emailMessage =
                  purpose === "email_update"
                        ? "You requested to update your email address."
                        : "You requested to update your password.";

            const html = await templateService.render("otp-email", {
                  title: emailTitle,
                  message: emailMessage,
                  otp,
                  expiryMinutes: "10",
                  senderName: "Portfolio Admin",
            });

            // 🔥 NON-BLOCKING EMAIL (FIX)
            emailService
                  .sendMail({
                        to: emailTo,
                        subject,
                        html,
                        text,
                  })
                  .then(() => {
                        Logger.info("OTP email sent", { emailTo });
                  })
                  .catch((err) => {
                        Logger.error("OTP email failed (background)", err);
                  });

            // 🚀 RESPONSE RETURNS IMMEDIATELY
            return {
                  success: true,
                  message:
                        purpose === "email_update"
                              ? "OTP sent to new email"
                              : "OTP sent to your email",
            };
      }

      async verifyOTPAndUpdateEmail(adminId, otp) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            if (!admin.otp || !admin.otpExpiry)
                  throw ApiError.badRequest("No OTP request found");

            if (admin.otp !== otp)
                  throw ApiError.badRequest("Invalid OTP");

            if (admin.otpExpiry < new Date())
                  throw ApiError.badRequest("OTP expired");

            const updatedAdmin = await adminRepository.updateById(adminId, {
                  email: admin.newEmail,
                  $unset: { otp: 1, otpExpiry: 1, newEmail: 1 },
            });

            return updatedAdmin;
      }

      generateToken(adminId) {
            return jwt.sign(
                  { adminId },
                  process.env.JWT_SECRET || "fallback_secret",
                  { expiresIn: "7d" }
            );
      }
}

export default new AdminService();
