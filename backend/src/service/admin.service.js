import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminData.password, salt);
            adminData.password = hashedPassword;
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

      // backend/src/service/admin.service.js

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

            // 🔥 EMAIL IS NON-BLOCKING & NON-CRITICAL
            setImmediate(async () => {
                  try {
                        await emailService.sendMail({
                              to: emailTo,
                              subject,
                              html,
                              text: `Your OTP is ${otp}. It expires in 10 minutes.`
                        });

                        Logger.info("📧 OTP email sent", { emailTo });
                  } catch (err) {
                        // ❗ LOG ONLY — NEVER THROW
                        Logger.error("❌ OTP email failed (ignored)", {
                              emailTo,
                              error: err.message
                        });
                  }
            });

            // ✅ ALWAYS RETURN SUCCESS
            return {
                  success: true,
                  message: "OTP generated successfully"
            };
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

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            return adminRepository.updateById(adminId, {
                  password: hashedPassword,
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