import skillRepository from "../repository/skill.repository.js";
import ApiError from "../utilities/error/apiError.js";
import Logger from "../config/logger/logger.config.js";

class SkillService {
      async createCategory(data) {
            Logger.info('Creating skill category', { category: data.category });
            const exists = await skillRepository.findOne({ category: data.category });
            if (exists) {
                  Logger.error('Category creation failed - already exists', { category: data.category });
                  throw ApiError.badRequest("Category already exists");
            }
            const result = await skillRepository.create(data);
            Logger.info('Skill category created successfully', { categoryId: result._id });
            return result;
      }

      async getAllCategories() {
            return skillRepository.findAllActive();
      }

      async getCategoryById(id) {
            const category = await skillRepository.findById(id);
            if (!category) throw ApiError.notFound("Category not found");
            return category;
      }

      async addSkillToCategory(categoryId, skillData) {
            const category = await skillRepository.findById(categoryId);
            if (!category) throw ApiError.notFound("Category not found");
            return skillRepository.addSkillToCategory(categoryId, skillData);
      }

      async updateSkill(categoryId, skillId, skillData) {
            const category = await skillRepository.findById(categoryId);
            if (!category) throw ApiError.notFound("Category not found");
            return skillRepository.updateSkillInCategory(categoryId, skillId, skillData);
      }

      async deleteCategory(id) {
            Logger.info('Deleting skill category', { categoryId: id });
            const category = await skillRepository.findById(id);
            if (!category) {
                  Logger.error('Category deletion failed - not found', { categoryId: id });
                  throw ApiError.notFound("Category not found");
            }
            await skillRepository.deleteById(id);
            Logger.info('Skill category deleted successfully', { categoryId: id });
            return { message: "Category deleted successfully" };
      }

      async deleteSkillFromCategory(categoryId, skillId) {
            const category = await skillRepository.findById(categoryId);
            if (!category) throw ApiError.notFound("Category not found");
            return skillRepository.deleteSkillFromCategory(categoryId, skillId);
      }
}

export default new SkillService();
