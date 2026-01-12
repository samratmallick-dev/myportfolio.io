import { Project } from "../model/project.model.js";
import { BaseRepository } from "./base.repository.js";

class ProjectRepository extends BaseRepository {
      constructor() {
            super(Project);
      }

      async findAll(filter = {}) {
            return await this.model.find(filter).sort({ createdAt: 1 });
      }

      async findActive(filter = {}) {
            return await this.model.find({ ...filter, isActive: true }).sort({ createdAt: 1 });
      }

      async findFeatured() {
            return await this.model.find({ isActive: true, isFeatured: true }).sort({ createdAt: 1 });
      }
}

export default new ProjectRepository();
