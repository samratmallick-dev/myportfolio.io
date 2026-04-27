import skillService from "../service/skill.service.js";
import { sendSuccess, sendCreated } from "../utilities/response/apiResponse.js";
import { asyncHandler } from "../utilities/error/asyncHandler.js";
import { broadcastUpdate } from "../utilities/sse/sse.js";

class SkillController {
      createCategory = asyncHandler(async (req, res) => {
            const category = await skillService.createCategory(req.body);
            const allCategories = await skillService.getAllCategories();
            broadcastUpdate("skills", allCategories);
            sendCreated(res, "Category created successfully", category);
      });

      getAllCategories = asyncHandler(async (req, res) => {
            const categories = await skillService.getAllCategories();
            sendSuccess(res, "Categories retrieved successfully", categories);
      });

      getCategoryById = asyncHandler(async (req, res) => {
            const category = await skillService.getCategoryById(req.params.id);
            sendSuccess(res, "Category retrieved successfully", category);
      });

      addSkillToCategory = asyncHandler(async (req, res) => {
            const category = await skillService.addSkillToCategory(req.params.id, req.body);
            const allCategories = await skillService.getAllCategories();
            broadcastUpdate("skills", allCategories);
            sendSuccess(res, "Skill added successfully", category);
      });

      updateSkill = asyncHandler(async (req, res) => {
            const { categoryId, skillId } = req.params;
            const category = await skillService.updateSkill(categoryId, skillId, req.body);
            const allCategories = await skillService.getAllCategories();
            broadcastUpdate("skills", allCategories);
            sendSuccess(res, "Skill updated successfully", category);
      });

      deleteCategory = asyncHandler(async (req, res) => {
            const result = await skillService.deleteCategory(req.params.id);
            const allCategories = await skillService.getAllCategories();
            broadcastUpdate("skills", allCategories);
            sendSuccess(res, "Category deleted successfully", result);
      });

      deleteSkillFromCategory = asyncHandler(async (req, res) => {
            const { categoryId, skillId } = req.params;
            const category = await skillService.deleteSkillFromCategory(categoryId, skillId);
            const allCategories = await skillService.getAllCategories();
            broadcastUpdate("skills", allCategories);
            sendSuccess(res, "Skill deleted successfully", category);
      });
}

export default new SkillController();
