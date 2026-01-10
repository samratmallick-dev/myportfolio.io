import { Skill } from "../model/skill.model.js";
import { BaseRepository } from "./base.repository.js";

class SkillRepository extends BaseRepository {
  constructor() {
    super(Skill);
  }

  async findAll(filter = {}) {
    return await this.model.find(filter).sort({ category: 1 });
  }

  async findActive(filter = {}) {
    return await this.model.find({ ...filter, isActive: true }).sort({ category: 1 });
  }

  async addSkillToCategory(categoryId, skillData) {
    return await this.model.findByIdAndUpdate(
      categoryId,
      { $push: { skills: skillData } },
      { new: true, runValidators: true }
    );
  }

  async updateSkillInCategory(categoryId, skillId, skillData) {
    return await this.model.findOneAndUpdate(
      { _id: categoryId, "skills._id": skillId },
      { $set: { "skills.$": skillData } },
      { new: true, runValidators: true }
    );
  }

  async deleteSkillFromCategory(categoryId, skillId) {
    return await this.model.findByIdAndUpdate(
      categoryId,
      { $pull: { skills: { _id: skillId } } },
      { new: true }
    );
  }

  async findByCategory(category) {
    return await this.model.findOne({ category, isActive: true });
  }

  async getSkillById(categoryId, skillId) {
    const skillCategory = await this.model.findById(categoryId);
    if (!skillCategory) return null;
    
    return skillCategory.skills.id(skillId);
  }
}

export default new SkillRepository();
