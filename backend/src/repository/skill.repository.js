import { Skill } from "../models/skill.model.js";

class SkillRepository {
      async findOne(query) {
            return Skill.findOne(query);
      }

      async create(data) {
            return Skill.create(data);
      }

      async findAllActive() {
            return Skill.find({ isActive: true });
      }

      async findById(id) {
            return Skill.findById(id);
      }

      async deleteById(id) {
            return Skill.findByIdAndDelete(id);
      }

      async addSkillToCategory(categoryId, skillData) {
            return Skill.findByIdAndUpdate(
                  categoryId,
                  { $push: { skills: skillData } },
                  { new: true }
            );
      }

      async updateSkillInCategory(categoryId, skillId, skillData) {
            return Skill.findOneAndUpdate(
                  { _id: categoryId, "skills._id": skillId },
                  {
                        $set: {
                              "skills.$.name": skillData.name,
                              "skills.$.level": skillData.level,
                              "skills.$.iconName": skillData.iconName,
                              "skills.$.iconColor": skillData.iconColor,
                        },
                  },
                  { new: true }
            );
      }

      async deleteSkillFromCategory(categoryId, skillId) {
            return Skill.findByIdAndUpdate(
                  categoryId,
                  {
                        $pull: {
                              skills: { _id: skillId },
                        },
                  },
                  { new: true }
            );
      }
}

export default new SkillRepository();
