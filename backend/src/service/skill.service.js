import skillRepository from "../repository/skill.repository.js";
import ApiError from "../utilities/error/apiError.js";

class SkillService {
      async createCategory(categoryData) {
            const existingCategory = await skillRepository.findOne({ category: categoryData.category });
            if (existingCategory) {
                  throw ApiError.badRequest("Category already exists");
            }
            return await skillRepository.create(categoryData);
      }

      async getAllCategories() {
            return await skillRepository.findAllActive();
      }

      async getCategoryById(id) {
            const category = await skillRepository.findById(id);
            if (!category) {
                  throw ApiError.notFound("Category not found");
            }
            return category;
      }

      async addSkillToCategory(categoryId, skillData) {
            const category = await skillRepository.findById(categoryId);
            if (!category) {
                  throw ApiError.notFound("Category not found");
            }
            return await skillRepository.addSkillToCategory(categoryId, skillData);
      }

      async updateSkill(categoryId, skillId, skillData) {
            const category = await skillRepository.findById(categoryId);
            if (!category) {
                  throw ApiError.notFound("Category not found");
            }
            return await skillRepository.updateSkillInCategory(categoryId, skillId, skillData);
      }

      async deleteCategory(id) {
            const category = await skillRepository.findById(id);
            if (!category) {
                  throw ApiError.notFound("Category not found");
            }
            await skillRepository.deleteById(id);
            return { message: "Category deleted successfully" };
      }

      async deleteSkillFromCategory(categoryId, skillId) {
            const category = await skillRepository.findById(categoryId);
            if (!category) {
                  throw ApiError.notFound("Category not found");
            }
            return await skillRepository.deleteSkillFromCategory(categoryId, skillId);
      }
}

export default new SkillService();
