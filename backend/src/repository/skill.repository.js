import { Skill } from "../model/skill.model.js";
import { BaseRepository } from "./base.repository.js";

class SkillRepository extends BaseRepository {
      constructor() {
            super(Skill);
      }

      async findAllActive() {
            return await this.model.find({ isActive: true }).sort({ createdAt: 1 });
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
                  { $set: { "skills.$": { _id: skillId, ...skillData } } },
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
}

export default new SkillRepository();
