import { Project } from "../model/project.model.js";
import { BaseRepository } from "./base.repository.js";

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findAll(filter = {}) {
    return await this.model.find(filter).sort({ createdAt: -1 });
  }

  async findActive(filter = {}) {
    return await this.model.find({ ...filter, isActive: true }).sort({ createdAt: -1 });
  }

  async findFeatured() {
    return await this.model.find({ featured: true, isActive: true }).sort({ createdAt: -1 });
  }

  async updateFeatured(projectIds) {
    await this.model.updateMany({}, { featured: false });
    return await this.model.updateMany(
      { _id: { $in: projectIds } },
      { featured: true }
    );
  }

  async findByCategory(category) {
    return await this.model.find({ category, isActive: true }).sort({ createdAt: -1 });
  }

  async findByTechnology(technology) {
    return await this.model.find({ 
      technologies: { $in: [technology] }, 
      isActive: true 
    }).sort({ createdAt: -1 });
  }
}

export default new ProjectRepository();
