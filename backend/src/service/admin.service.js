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
            Logger.info("Generate OTP request", { adminId, purpose });

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

            const emailTo = purpose === "email_update" ? newEmail : admin.email;
            const subject =
                  purpose === "email_update"
                        ? "Email Update OTP"
                        : "Password Update OTP";

            const html = await templateService.render("otp-email", {
                  title: "OTP Verification",
                  message: "Use the OTP below to continue.",
                  otp,
                  expiryMinutes: "10",
                  senderName: "Portfolio Admin",
            });

            // 🔥 NON-BLOCKING EMAIL
            emailService.sendMail({
                  to: emailTo,
                  subject,
                  html,
                  text: `Your OTP is ${otp}`,
            }).catch(err => {
                  Logger.error("OTP email failed (background)", err);
            });

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

            if (!admin.otp || !admin.otpExpiry) {
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  throw ApiError.badRequest("OTP expired");
            }

            return adminRepository.updateById(adminId, {
                  email: admin.newEmail,
                  $unset: { otp: 1, otpExpiry: 1, newEmail: 1 },
            });
      }

      async verifyOTPAndUpdatePassword(adminId, otp, newPassword) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            if (!admin.otp || !admin.otpExpiry) {
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  throw ApiError.badRequest("OTP expired");
            }

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
