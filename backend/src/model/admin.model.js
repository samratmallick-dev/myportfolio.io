import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
            otp: {
                  type: String,
            },
            otpExpiry: {
                  type: Date,
            },
            newEmail: {
                  type: String,
            },
      },
      { timestamps: true }
);

/* ✅ Correct async pre-save hook */
adminSchema.pre("save", async function () {
      if (!this.isModified("password")) return;

      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.toJSON = function () {
      const adminObject = this.toObject();
      delete adminObject.password;
      return adminObject;
};

export const Admin = mongoose.model("Admin", adminSchema);
