import jwt from "jsonwebtoken";
import adminRepository from "../repository/admin.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { generateOTP } from "../utilities/email/generateOTP.js";
import { sendEmail } from "../utilities/email/sendEmail.js";

class AdminService {
      async initializeAdmin(adminData) {
            const existingAdmin = await adminRepository.findByEmail(adminData.email);
            if (existingAdmin) {
                  throw ApiError.badRequest("Admin already exists");
            }

            const admin = await adminRepository.create(adminData);
            return admin;
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

            return {
                  admin,
                  token,
            };
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
            console.log('generateOTPForEmailUpdate - received data:', data);
            const { adminId, newEmail } = data;
            
            if (!newEmail) {
                  console.log('generateOTPForEmailUpdate - newEmail is missing:', newEmail);
                  throw ApiError.badRequest("New email is required");
            }

            const admin = await adminRepository.findById(adminId);
            if (!admin) throw ApiError.notFound("Admin not found");

            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            await adminRepository.updateById(adminId, {
                  otp,
                  otpExpiry,
                  newEmail,
            });

            await sendEmail({
                  to: newEmail,
                  subject: "Email Update OTP",
                  text: `Your OTP is ${otp}. Valid for 10 minutes.`,
            });

            return { message: "OTP sent to new email" };
      }


      async verifyOTPAndUpdateEmail(adminId, otp) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) {
                  throw ApiError.notFound("Admin not found");
            }

            if (!admin.otp || !admin.otpExpiry) {
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  throw ApiError.badRequest("OTP expired");
            }

            const updatedAdmin = await adminRepository.updateById(adminId, {
                  email: admin.newEmail,
                  $unset: {
                        otp: 1,
                        otpExpiry: 1,
                        newEmail: 1
                  }
            });

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

            await sendEmail({
                  to: admin.email,
                  subject: "Password Reset OTP",
                  text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
            });

            return { message: "OTP sent to email" };
      }

      async verifyOTPAndUpdatePassword(adminId, otp, newPassword) {
            const admin = await adminRepository.findById(adminId);
            if (!admin) {
                  throw ApiError.notFound("Admin not found");
            }

            if (!admin.otp || !admin.otpExpiry) {
                  throw ApiError.badRequest("No OTP request found");
            }

            if (admin.otp !== otp) {
                  throw ApiError.badRequest("Invalid OTP");
            }

            if (admin.otpExpiry < new Date()) {
                  throw ApiError.badRequest("OTP expired");
            }

            const updatedAdmin = await adminRepository.updateById(adminId, {
                  password: newPassword,
                  $unset: {
                        otp: 1,
                        otpExpiry: 1
                  }
            });

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
