import jwt from "jsonwebtoken";
import adminRepository from "../repository/admin.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { generateOTP } from "../utilities/email/generateOTP.js";
import { sendEmail } from "../utilities/email/sendEmail.js";
import Logger from "../config/logger/logger.config.js";

class AdminService {
      async initializeAdmin(adminData) {
            Logger.info('Attempting to initialize admin', { email: adminData.email });
            
            const existingAdmin = await adminRepository.findByEmail(adminData.email);
            if (existingAdmin) {
                  Logger.error('Admin initialization failed - admin already exists', { email: adminData.email });
                  throw ApiError.badRequest("Admin already exists");
            }

            const admin = await adminRepository.create(adminData);
            Logger.info('Admin initialized successfully', { adminId: admin._id, email: admin.email });
            return admin;
      }

      async login(loginData) {
            const { email, password } = loginData;
            Logger.info('Admin login attempt', { email });

            const admin = await adminRepository.findByEmail(email);
            if (!admin) {
                  Logger.error('Login failed - admin not found', { email });
                  throw ApiError.unauthorized("Invalid credentials");
            }

            const isPasswordValid = await admin.comparePassword(password);
            if (!isPasswordValid) {
                  Logger.error('Login failed - invalid password', { email });
                  throw ApiError.unauthorized("Invalid credentials");
            }

            if (!admin.isActive) {
                  Logger.error('Login failed - account deactivated', { email });
                  throw ApiError.unauthorized("Account is deactivated");
            }

            await adminRepository.updateLastLogin(admin._id);
            const token = this.generateToken(admin._id);
            
            Logger.info('Admin login successful', { adminId: admin._id, email });
            return { admin, token };
      }

      async getAdminUser(adminId) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) {
                  throw ApiError.notFound("Admin not found");
            }

            if (!admin.isActive) {
                  throw ApiError.unauthorized("Account is deactivated");
            }

            return admin;
      }

      async generateOTPForEmailUpdate(data) {
            Logger.info('generateOTPForEmailUpdate - received data:', data);
            const { adminId, purpose, newEmail } = data;
            
            if (purpose === 'email_update' && !newEmail) {
                  Logger.error('generateOTPForEmailUpdate - newEmail is missing for email update:', newEmail);
                  throw ApiError.badRequest("New email is required for email update");
            }

            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            // For email update, store the new email; for password update, don't
            const updateData = {
                  otp,
                  otpExpiry,
            };
            
            if (purpose === 'email_update') {
                  updateData.newEmail = newEmail;
            }

            await adminRepository.updateById(adminId, updateData);

            // Determine email destination and subject based on purpose
            const emailTo = purpose === 'email_update' ? newEmail : admin.email;
            const subject = purpose === 'email_update' ? "Email Update OTP" : "Password Update OTP";
            const message = purpose === 'email_update' 
                  ? `Your OTP for email update is ${otp}. Valid for 10 minutes.`
                  : `Your OTP for password update is ${otp}. Valid for 10 minutes.`;

            Logger.info('Attempting to send OTP email', {
                  adminId,
                  purpose,
                  emailTo,
                  otp
            });

            await sendEmail({
                  to: emailTo,
                  subject: subject,
                  text: message,
            });

            Logger.info('OTP email sent successfully', { purpose });
            const responseMessage = purpose === 'email_update' 
                  ? "OTP sent to new email" 
                  : "OTP sent to your email";
            return { message: responseMessage };
      }


      async verifyOTPAndUpdateEmail(adminId, otp) {
            Logger.info('Attempting to verify OTP and update email', { adminId });
            
            const admin = await adminRepository.findById(adminId);
            if (!admin) {
                  Logger.error('OTP verification failed - admin not found', { adminId });
                  throw ApiError.notFound("Admin not found");
            }

            if (!admin.otp || !admin.otpExpiry) {
                  Logger.error('OTP verification failed - no OTP request found', { adminId });
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  Logger.error('OTP verification failed - invalid OTP', { adminId });
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  Logger.error('OTP verification failed - OTP expired', { adminId });
                  throw ApiError.badRequest("OTP expired");
            }

            const updatedAdmin = await adminRepository.updateById(adminId, {
                  email: admin.newEmail,
                  $unset: { otp: 1, otpExpiry: 1, newEmail: 1 }
            });

            Logger.info('Email updated successfully', { adminId, newEmail: admin.newEmail });
            return updatedAdmin;
      }

      async generateOTPForPasswordReset(email) {
            const admin = await adminRepository.findByEmail(email.email);
            if (!admin) {
                  throw ApiError.notFound("Admin not found");
            }

            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await adminRepository.updateById(admin._id, {
                  otp,
                  otpExpiry,
            });

            Logger.info('Attempting to send OTP email for password reset', {
                  adminEmail: admin.email,
                  otp
            });

            await sendEmail({
                  to: admin.email,
                  subject: "Password Reset OTP",
                  text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
            });

            Logger.info('OTP email sent successfully for password reset');
            return { message: "OTP sent to email" };
      }

      async verifyOTPAndUpdatePassword(adminId, otp, newPassword) {
            Logger.info('Attempting to verify OTP and update password', { adminId });
            
            const admin = await adminRepository.findById(adminId);
            if (!admin) {
                  Logger.error('Password update failed - admin not found', { adminId });
                  throw ApiError.notFound("Admin not found");
            }

            if (!admin.otp || !admin.otpExpiry) {
                  Logger.error('Password update failed - no OTP request found', { adminId });
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  Logger.error('Password update failed - invalid OTP', { adminId });
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  Logger.error('Password update failed - OTP expired', { adminId });
                  throw ApiError.badRequest("OTP expired");
            }

            const updatedAdmin = await adminRepository.updateById(adminId, {
                  password: newPassword,
                  $unset: { otp: 1, otpExpiry: 1 }
            });

            Logger.info('Password updated successfully', { adminId });
            return updatedAdmin;
      }

      generateToken(adminId) {
            return jwt.sign({ adminId }, process.env.JWT_SECRET || "fallback_secret_key", {
                  expiresIn: process.env.JWT_EXPIRE || "7d",
            });
      }

      verifyToken(token) {
            return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
      }
}

export default new AdminService();
