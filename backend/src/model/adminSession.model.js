import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema(
      {
            adminId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Admin",
                  required: true,
                  index: true,
            },

            refreshTokenHash: {
                  type: String,
                  required: true,
                  unique: true,
                  index: true,
            },

            previousTokenHashes: {
                  type: [String],
                  default: [],
                  index: true,
            },

            expiresAt: {
                  type: Date,
                  required: true,
            },

            revokedAt: {
                  type: Date,
                  default: null,
            },

            lastUsedAt: {
                  type: Date,
                  default: null,
            },

            userAgent: {
                  type: String,
                  default: "",
            },

            ipAddress: {
                  type: String,
                  default: "",
            },
      },
      { timestamps: true }
);

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
adminSessionSchema.index({ adminId: 1, revokedAt: 1 });

adminSessionSchema.methods.isExpired = function (now = new Date()) {
      return !this.expiresAt || this.expiresAt.getTime() <= now.getTime();
};

adminSessionSchema.methods.isRevoked = function () {
      return Boolean(this.revokedAt);
};

adminSessionSchema.methods.isUsable = function (now = new Date()) {
      return !this.isRevoked() && !this.isExpired(now);
};

adminSessionSchema.methods.toSafeObject = function () {
      return {
            id: this._id.toString(),
            adminId: this.adminId?.toString?.() ?? String(this.adminId),
            userAgent: this.userAgent || "",
            ipAddress: this.ipAddress || "",
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastUsedAt: this.lastUsedAt,
            expiresAt: this.expiresAt,
            revokedAt: this.revokedAt,
            isActive: this.isUsable(),
      };
};

export const AdminSession = mongoose.model("AdminSession", adminSessionSchema);