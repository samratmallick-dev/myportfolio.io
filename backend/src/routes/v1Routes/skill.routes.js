import { Router } from "express";
import skillController from "../../controllers/skill.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateSkillCategory, validateSkill, validateMongoId, handleValidationErrors } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/create-category", authenticate, validateSkillCategory, handleValidationErrors, skillController.createCategory);
router.get("/get-all-categories", skillController.getAllCategories);
router.get("/get-category/:id", validateMongoId, handleValidationErrors, skillController.getCategoryById);
router.post("/add-skill/:id", authenticate, validateMongoId, validateSkill, handleValidationErrors, skillController.addSkillToCategory);
router.put("/update-skill/:categoryId/:skillId", authenticate, validateSkill, handleValidationErrors, skillController.updateSkill);
router.delete("/delete-category/:id", authenticate, validateMongoId, handleValidationErrors, skillController.deleteCategory);
router.delete("/delete-skill/:categoryId/:skillId", authenticate, skillController.deleteSkillFromCategory);

export default router;
