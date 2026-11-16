import { Router } from "express";
import publicController from "../../controllers/public.controller.js";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";

const router = Router();

// Legacy aggregate endpoint. Preserved for backward compatibility.
router.get("/initial-data", cacheMiddleware(300), publicController.getPublicData);

// Lightweight, independently cacheable public sections.
router.get("/hero", cacheMiddleware(120), publicController.getHero);
router.get("/about", cacheMiddleware(300), publicController.getAbout);
router.get("/education", cacheMiddleware(300), publicController.getEducation);
router.get("/skills", cacheMiddleware(300), publicController.getSkills);
router.get("/featured-projects", cacheMiddleware(120), publicController.getFeaturedProjects);
router.get("/projects", cacheMiddleware(60), publicController.getProjects);
router.get("/services", cacheMiddleware(300), publicController.getServices);
router.get("/contact", cacheMiddleware(300), publicController.getContact);

export default router;
