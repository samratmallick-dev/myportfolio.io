import skillRepository from "../repository/skill.repository.js";
import ApiError from "../utilities/error/apiError.js";
import { uploadToCloudinary } from "../utilities/cloudinary/upload.js";

class SkillService {
  async createSkillCategory(categoryData) {
    const existingCategory = await skillRepository.findByCategory(categoryData.category);
    if (existingCategory) {
      throw ApiError.badRequest("Skill category already exists");
    }

    const skillCategory = await skillRepository.create(categoryData);
    return skillCategory;
  }

  async getAllSkillCategories() {
    const skillCategories = await skillRepository.findActive();
    return skillCategories;
  }

  async getSkillCategoryById(id) {
    const skillCategory = await skillRepository.findById(id);
    
    if (!skillCategory) {
      throw ApiError.notFound("Skill category not found");
    }

    if (!skillCategory.isActive) {
      throw ApiError.badRequest("Skill category is not active");
    }

    return skillCategory;
  }

  async deleteSkillCategory(id) {
    const skillCategory = await skillRepository.findById(id);
    
    if (!skillCategory) {
      throw ApiError.notFound("Skill category not found");
    }

    await skillRepository.deleteById(id);
    return { message: "Skill category deleted successfully" };
  }

  async addSkillToCategory(categoryId, skillData, icon) {
    const skillCategory = await skillRepository.findById(categoryId);
    
    if (!skillCategory) {
      throw ApiError.notFound("Skill category not found");
    }

    if (icon) {
      const cloudinaryResponse = await uploadToCloudinary(icon, "skills/icons");
      skillData.icon = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const updatedCategory = await skillRepository.addSkillToCategory(categoryId, skillData);
    return updatedCategory;
  }

  async updateSkillInCategory(categoryId, skillId, skillData, icon) {
    const skillCategory = await skillRepository.findById(categoryId);
    
    if (!skillCategory) {
      throw ApiError.notFound("Skill category not found");
    }

    const existingSkill = skillCategory.skills.id(skillId);
    if (!existingSkill) {
      throw ApiError.notFound("Skill not found in category");
    }

    if (icon) {
      const cloudinaryResponse = await uploadToCloudinary(icon, "skills/icons");
      skillData.icon = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    const updatedCategory = await skillRepository.updateSkillInCategory(categoryId, skillId, skillData);
    return updatedCategory;
  }

  async deleteSkillFromCategory(categoryId, skillId) {
    const skillCategory = await skillRepository.findById(categoryId);
    
    if (!skillCategory) {
      throw ApiError.notFound("Skill category not found");
    }

    const existingSkill = skillCategory.skills.id(skillId);
    if (!existingSkill) {
      throw ApiError.notFound("Skill not found in category");
    }

    const updatedCategory = await skillRepository.deleteSkillFromCategory(categoryId, skillId);
    return updatedCategory;
  }

  async getAllSkillCategoriesAdmin() {
    const skillCategories = await skillRepository.findAll();
    return skillCategories;
  }

  async getSkillById(categoryId, skillId) {
    const skill = await skillRepository.getSkillById(categoryId, skillId);
    
    if (!skill) {
      throw ApiError.notFound("Skill not found");
    }

    return skill;
  }
}

export default new SkillService();
