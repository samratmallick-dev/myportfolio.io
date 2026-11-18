import { Admin } from "../model/admin.model.js";
import { BaseRepository } from "./base.repository.js";

class AdminRepository extends BaseRepository {
      constructor() {
            super(Admin);
      }

      async findByEmail(email) {
            return await this.model.findOne({ email });
      }

      async findByEmailWithPassword(email) {
            return await this.model.findOne({ email }).select("+password");
      }

      async findByUsername(username) {
            return await this.model.findOne({ username });
      }

      async findByIdWithSecrets(id) {
            return await this.model
                  .findById(id)
                  .select("+otp +otpExpiry +newEmail +password");
      }

      async updateLastLogin(id) {
            return await this.model.findByIdAndUpdate(id, { lastLogin: new Date() }, { returnDocument: 'after' });
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).select("-password");
      }

      async countAdmins() {
            return await this.model.countDocuments({});
      }

      async adminExists() {
            return Boolean(await this.model.exists({}));
      }

      async createInitialAdmin(data) {
            return await this.model.create({ ...data, bootstrapKey: "primary" });
      }
}

export default new AdminRepository();
