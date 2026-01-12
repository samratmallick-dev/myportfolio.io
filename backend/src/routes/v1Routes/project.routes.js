import { Router } from "express";
import projectController from "../../controllers/project.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateProject, handleValidationErrors } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/create-project", authenticate, validateProject, handleValidationErrors, projectController.createProject);
router.get("/get-all-projects", projectController.getAllProjects);
router.get("/get-project/:id", projectController.getProjectById);
router.put("/update-project/:id", authenticate, validateProject, handleValidationErrors, projectController.updateProject);
router.delete("/delete-project/:id", authenticate, projectController.deleteProject);
router.get("/get-all-projects-admin", authenticate, projectController.getAllProjectsAdmin);
router.get("/get-featured-projects", projectController.getFeaturedProjects);
router.patch("/set-featured-project/:id", authenticate, projectController.setFeaturedProject);

export default router;
