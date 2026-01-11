import { Education } from "../model/education.model.js";
import { BaseRepository } from "./base.repository.js";

class EducationRepository extends BaseRepository {
      constructor() {
            super(Education);
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).sort({ startDate: -1 });
      }

      async findActive(filter = {}) {
            return await this.model.find({ ...filter, isActive: true }).sort({ startDate: -1 });
      }

      async findLatest() {
            return await this.model.findOne({ isActive: true }).sort({ startDate: -1 });
      }
}

export default new EducationRepository();
