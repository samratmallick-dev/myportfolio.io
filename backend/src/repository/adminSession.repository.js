import { AdminSession } from "../model/adminSession.model.js";

class AdminSessionRepository {
      constructor() {
            this.model = AdminSession;
      }

      async create({ adminId, refreshTokenHash, expiresAt, userAgent = "", ipAddress = "" }) {
            return await this.model.create({
                  adminId,
                  refreshTokenHash,
                  expiresAt,
                  userAgent,
                  ipAddress,
                  lastUsedAt: new Date(),
            });
      }

      async findById(id) {
            return await this.model.findById(id);
      }

      async findByRefreshTokenHash(refreshTokenHash) {
            return await this.model.findOne({ refreshTokenHash });
      }

      async findByPreviousTokenHash(previousTokenHash) {
            return await this.model.findOne({ previousTokenHashes: previousTokenHash });
      }

      async findActiveById(id, now = new Date()) {
            return await this.model.findOne({
                  _id: id,
                  revokedAt: null,
                  expiresAt: { $gt: now },
            });
      }

      async listActiveForAdmin(adminId, now = new Date()) {
            return await this.model
                  .find({ adminId, revokedAt: null, expiresAt: { $gt: now } })
                  .sort({ lastUsedAt: -1, createdAt: -1 });
      }

      async listForAdmin(adminId) {
            return await this.model.find({ adminId }).sort({ createdAt: -1 }).limit(50);
      }

      async rotate({ sessionId, currentHash, nextHash, expiresAt, userAgent, ipAddress }) {
            const now = new Date();
            return await this.model.findOneAndUpdate(
                  {
                        _id: sessionId,
                        refreshTokenHash: currentHash,
                        revokedAt: null,
                        expiresAt: { $gt: now },
                  },
                  {
                        $set: {
                              refreshTokenHash: nextHash,
                              expiresAt,
                              lastUsedAt: now,
                              userAgent,
                              ipAddress,
                        },
                        $push: {
                              previousTokenHashes: { $each: [currentHash], $slice: -20 },
                        },
                  },
                  { new: true }
            );
      }

      async touch({ sessionId, userAgent, ipAddress }) {
            return await this.model.updateOne(
                  { _id: sessionId },
                  { $set: { lastUsedAt: new Date(), userAgent, ipAddress } }
            );
      }

      async revokeById(sessionId) {
            return await this.model.findOneAndUpdate(
                  { _id: sessionId, revokedAt: null },
                  { $set: { revokedAt: new Date() } },
                  { new: true }
            );
      }

      async revokeByHashes(hashes = []) {
            if (hashes.length === 0) return null;
            return await this.model.updateMany(
                  {
                        $or: [
                              { refreshTokenHash: { $in: hashes } },
                              { previousTokenHashes: { $in: hashes } },
                        ],
                        revokedAt: null,
                  },
                  { $set: { revokedAt: new Date() } }
            );
      }

      async revokeAllForAdmin(adminId) {
            return await this.model.updateMany(
                  { adminId, revokedAt: null },
                  { $set: { revokedAt: new Date() } }
            );
      }

      async revokeSessionForAdmin(sessionId, adminId) {
            return await this.model.findOneAndUpdate(
                  { _id: sessionId, adminId, revokedAt: null },
                  { $set: { revokedAt: new Date() } },
                  { new: true }
            );
      }

      async deleteExpired(now = new Date()) {
            return await this.model.deleteMany({ expiresAt: { $lte: now } });
      }
}

export default new AdminSessionRepository();
