import { Router } from "express";
import heroController from "../../controllers/hero.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";

const router = Router();

router.post("/add-and-update-hero-content", authenticate, upload.single("profileImage"), heroController.addUpdateHeroContent);
router.get("/get-hero-content", cacheMiddleware(300), heroController.getHeroContent);
router.get("/get-hero-content/:id", heroController.getHeroContentById);
router.put("/update-hero-content/:id", authenticate, upload.single("profileImage"), heroController.updateHeroContent);
router.delete("/delete-hero-content/:id", authenticate, heroController.deleteHeroContent);
router.get("/get-all-hero-content", authenticate, heroController.getAllHeroContent);

export default router;
