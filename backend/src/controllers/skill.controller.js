import skillService from "../service/skill.service.js";
import { sendSuccess, sendCreated, sendNotFound } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";

class SkillController {
      createSkillCategory = asyncHandler(async (req, res) => {
            const categoryData = req.body;

            const skillCategory = await skillService.createSkillCategory(categoryData);

            sendCreated(res, "Skill category created successfully", skillCategory);
      });

      getAllSkillCategories = asyncHandler(async (req, res) => {
            const skillCategories = await skillService.getAllSkillCategories();

            sendSuccess(res, "Skill categories retrieved successfully", skillCategories);
      });

      getSkillCategoryById = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const skillCategory = await skillService.getSkillCategoryById(id);

            sendSuccess(res, "Skill category retrieved successfully", skillCategory);
      });

      deleteSkillCategory = asyncHandler(async (req, res) => {
            const { id } = req.params;

            const result = await skillService.deleteSkillCategory(id);

            sendSuccess(res, "Skill category deleted successfully", result);
      });

      addSkillToCategory = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const skillData = req.body;
            const icon = req.files?.icon?.[0];

            const updatedCategory = await skillService.addSkillToCategory(id, skillData, icon);

            sendSuccess(res, "Skill added to category successfully", updatedCategory);
      });

      updateSkillInCategory = asyncHandler(async (req, res) => {
            const { id, skillId } = req.params;
            const skillData = req.body;
            const icon = req.files?.icon?.[0];

            const updatedCategory = await skillService.updateSkillInCategory(id, skillId, skillData, icon);

            sendSuccess(res, "Skill updated successfully", updatedCategory);
      });

      deleteSkillFromCategory = asyncHandler(async (req, res) => {
            const { id, skillId } = req.params;

            const updatedCategory = await skillService.deleteSkillFromCategory(id, skillId);

            sendSuccess(res, "Skill deleted from category successfully", updatedCategory);
      });

      getAllSkillCategoriesAdmin = asyncHandler(async (req, res) => {
            const skillCategories = await skillService.getAllSkillCategoriesAdmin();

            sendSuccess(res, "All skill categories retrieved successfully", skillCategories);
      });

      getSkillById = asyncHandler(async (req, res) => {
            const { id, skillId } = req.params;
            const skill = await skillService.getSkillById(id, skillId);

            sendSuccess(res, "Skill retrieved successfully", skill);
      });
}

export default new SkillController();


