import { Education } from "../model/education.model.js";
import { BaseRepository } from "./base.repository.js";

class EducationRepository extends BaseRepository {
      constructor() {
            super(Education);
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).sort({ createdAt: -1 }).lean();
      }

      async findActive(filter = {}) {
            return await this.model.find({ ...filter, isActive: true }).sort({ createdAt: -1 }).lean();
      }

      async findLatest() {
            return await this.model.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
      }
}

export default new EducationRepository();
