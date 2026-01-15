import jwt from "jsonwebtoken";
import adminRepository from "../repository/admin.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { generateOTP } from "../utilities/email/generateOTP.js";
import emailService from "../utilities/email/email.service.js";
import templateService from "../utilities/email/template.service.js";
import Logger from "../config/logger/logger.config.js";

class AdminService {
      async initializeAdmin(adminData) {
            const existingAdmin = await adminRepository.findByEmail(adminData.email);
            if (existingAdmin) {
                  throw ApiError.badRequest("Admin already exists");
            }
            return adminRepository.create(adminData);
      }

      async login(loginData) {
            const { email, password } = loginData;

            const admin = await adminRepository.findByEmail(email);
            if (!admin) {
                  throw ApiError.unauthorized("Invalid credentials");
            }

            const isPasswordValid = await admin.comparePassword(password);
            if (!isPasswordValid) {
                  throw ApiError.unauthorized("Invalid credentials");
            }

            if (!admin.isActive) {
                  throw ApiError.unauthorized("Account is deactivated");
            }

            await adminRepository.updateLastLogin(admin._id);
            const token = this.generateToken(admin._id);

            return { admin, token };
      }

      async getAdminUser(adminId) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");
            if (!admin.isActive) throw ApiError.unauthorized("Account is deactivated");
            return admin;
      }

      async generateOTPForEmailUpdate({ adminId, purpose, newEmail }) {
            Logger.info("Generate OTP request", { adminId, purpose, newEmail });

            if (purpose === "email_update" && !newEmail) {
                  throw ApiError.badRequest("New email is required");
            }

            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            Logger.info("OTP generated", { adminId, purpose, otp, otpExpiry });

            const updateData = { otp, otpExpiry };
            if (purpose === "email_update") updateData.newEmail = newEmail;

            await adminRepository.updateById(adminId, updateData);

            const emailTo = purpose === "email_update" ? newEmail : admin.email;
            const subject = purpose === "email_update" ? "Email Update OTP" : "Password Update OTP";

            Logger.info("Preparing email template", { emailTo, subject });

            const html = await templateService.render("otp-email", {
                  otp: otp,
                  purpose: subject,
                  expiryMinutes: "10"
            });

            if (!emailService.enabled) {
                  Logger.error("Email service is not available");
                  throw ApiError.internal("Email service is not available");
            }

            try {
                  Logger.info("Sending OTP email", { to: emailTo, subject, otp });

                  const emailResult = await emailService.sendMail({
                        to: emailTo,
                        subject: subject,
                        html: html,
                        text: `Your OTP is ${otp}. It will expire in 10 minutes.`
                  });

                  Logger.info("OTP email sent successfully", {
                        to: emailTo,
                        messageId: emailResult.messageId,
                        response: emailResult.response,
                        accepted: emailResult.accepted,
                        rejected: emailResult.rejected
                  });

                  if (emailResult.rejected && emailResult.rejected.length > 0) {
                        Logger.warn("Some recipients were rejected", { rejected: emailResult.rejected });
                        throw ApiError.internal(`Email rejected by server: ${emailResult.rejected.join(", ")}`);
                  }

                  return {
                        success: true,
                        message: purpose === "email_update" ? "OTP sent to new email" : "OTP sent to your email",
                        emailSent: true,
                        emailTo: emailTo
                  };

            } catch (emailError) {
                  Logger.error("Failed to send OTP email", {
                        error: emailError.message,
                        stack: emailError.stack,
                        to: emailTo,
                        otp: otp
                  });

                  throw ApiError.internal(`Failed to send OTP email: ${emailError.message}`);
            }
      }

      async verifyOTPAndUpdateEmail(adminId, otp) {
            Logger.info("Verifying OTP for email update", { adminId, otp });

            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            if (!admin.otp || !admin.otpExpiry) {
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  Logger.warn("Invalid OTP provided", { adminId, providedOTP: otp, actualOTP: admin.otp });
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  Logger.warn("OTP expired", { adminId, expiry: admin.otpExpiry });
                  throw ApiError.badRequest("OTP expired");
            }

            Logger.info("OTP verified, updating email", { adminId, newEmail: admin.newEmail });

            return adminRepository.updateById(adminId, {
                  email: admin.newEmail,
                  $unset: { otp: 1, otpExpiry: 1, newEmail: 1 },
            });
      }

      async verifyOTPAndUpdatePassword(adminId, otp, newPassword) {
            Logger.info("Verifying OTP for password update", { adminId, otp });

            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            if (!admin.otp || !admin.otpExpiry) {
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  Logger.warn("Invalid OTP provided", { adminId, providedOTP: otp, actualOTP: admin.otp });
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  Logger.warn("OTP expired", { adminId, expiry: admin.otpExpiry });
                  throw ApiError.badRequest("OTP expired");
            }

            Logger.info("OTP verified, updating password", { adminId });

            return adminRepository.updateById(adminId, {
                  password: newPassword,
                  $unset: { otp: 1, otpExpiry: 1 },
            });
      }

      generateToken(adminId) {
            return jwt.sign(
                  { adminId },
                  process.env.JWT_SECRET || "fallback_secret",
                  { expiresIn: "1d" }
            );
      }
}

export default new AdminService();