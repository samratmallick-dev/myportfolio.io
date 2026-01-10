import { Admin } from "../model/admin.model.js";
import { BaseRepository } from "./base.repository.js";

class AdminRepository extends BaseRepository {
      constructor() {
            super(Admin);
      }

      async findByEmail(email) {
            return await this.model.findOne({ email });
      }

      async findByUsername(username) {
            return await this.model.findOne({ username });
      }

      async updateLastLogin(id) {
            return await this.model.findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true });
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).select("-password");
      }
}

export default new AdminRepository();
