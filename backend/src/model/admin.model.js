import mongoose from "mongoose";
import { comparePassword } from "../utilities/password.utility.js";

const adminSchema = new mongoose.Schema(
      {
            username: {
                  type: String,
                  required: true,
                  unique: true,
                  trim: true,
                  minlength: 3,
                  maxlength: 50,
            },
            email: {
                  type: String,
                  required: true,
                  unique: true,
                  trim: true,
                  lowercase: true,
            },
            password: {
                  type: String,
                  required: true,
                  minlength: 6,
                  select: false,
            },
            role: {
                  type: String,
                  enum: ["admin"],
                  default: "admin",
            },
            isActive: {
                  type: Boolean,
                  default: true,
            },
            lastLogin: {
                  type: Date,
            },
            passwordChangedAt: {
                  type: Date,
            },
            bootstrapKey: {
                  type: String,
                  unique: true,
                  sparse: true,
                  select: false,
            },
            otp: {
                  type: String,
                  select: false,
            },
            otpExpiry: {
                  type: Date,
                  select: false,
            },
            newEmail: {
                  type: String,
                  select: false,
            },
      },
      { timestamps: true }
);

adminSchema.methods.comparePassword = function (candidatePassword) {
      return comparePassword(candidatePassword, this.password);
};

adminSchema.methods.toJSON = function () {
      const adminObject = this.toObject();
      delete adminObject.password;
      delete adminObject.otp;
      delete adminObject.otpExpiry;
      delete adminObject.newEmail;
      delete adminObject.bootstrapKey;
      delete adminObject.__v;
      return adminObject;
};

export const Admin = mongoose.model("Admin", adminSchema);
