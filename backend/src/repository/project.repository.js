import { Project } from "../model/project.model.js";
import { BaseRepository } from "./base.repository.js";

class ProjectRepository extends BaseRepository {
      constructor() {
            super(Project);
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).sort({ createdAt: 1 }).lean();
      }

      async findActive(filter = {}) {
            return await this.model.find({ ...filter, isActive: true }).sort({ createdAt: 1 }).lean();
      }

      async findFeatured() {
            return await this.model
                  .find({ isActive: true, isFeatured: true })
                  .select('-__v')
                  .sort({ createdAt: 1 })
                  .limit(6)
                  .lean();
      }
}

export default new ProjectRepository();
