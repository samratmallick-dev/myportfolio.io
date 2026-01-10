import { Router } from "express";
import projectController from "../../controllers/project.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

router.post("/add-project", authenticate, upload.array("images", 5), projectController.createProject);
router.get("/get-all-projects", projectController.getAllProjects);
router.get("/get-project/:projectId", projectController.getProjectById);
router.put("/update-project/:projectId", authenticate, upload.array("images", 5), projectController.updateProject);
router.delete("/delete-project/:projectId", authenticate, projectController.deleteProject);
router.get("/get-featured-projects", projectController.getFeaturedProjects);
router.post("/set-featured-projects", authenticate, projectController.setFeaturedProjects);
router.get("/get-all-projects-admin", authenticate, projectController.getAllProjectsAdmin);
router.get("/get-projects-by-category/:category", projectController.getProjectsByCategory);
router.get("/get-projects-by-technology/:technology", projectController.getProjectsByTechnology);

export default router;
