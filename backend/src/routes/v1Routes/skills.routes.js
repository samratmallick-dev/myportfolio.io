import { Router } from "express";
import skillController from "../../controllers/skill.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

router.post("/create-skill-category", authenticate, skillController.createSkillCategory);
router.get("/get-all-skill-categories", skillController.getAllSkillCategories);
router.get("/get-skill-categories/:id", skillController.getSkillCategoryById);
router.delete("/delete-skill-categories/:id", authenticate, skillController.deleteSkillCategory);
router.post("/add-skill-to-category/:id", authenticate, upload.single("icon"), skillController.addSkillToCategory);
router.put("/update-skill-in-category/:id/:skillId", authenticate, upload.single("icon"), skillController.updateSkillInCategory);
router.delete("/delete-skill-from-category/:id/:skillId", authenticate, skillController.deleteSkillFromCategory);
router.get("/get-all-skill-categories-admin", authenticate, skillController.getAllSkillCategoriesAdmin);
router.get("/get-skill/:id/:skillId", skillController.getSkillById);

export default router;
