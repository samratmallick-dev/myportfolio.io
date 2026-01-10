import { Router } from "express";
import aboutController from "../../controllers/about.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

router.post("/add-and-update-about-content", authenticate, upload.single("profileImage"), aboutController.addUpdateAboutContent);
router.get("/get-about-content", aboutController.getAboutContent);
router.get("/get-about-content/:id", aboutController.getAboutContentById);
router.put("/update-about-content/:id", authenticate, upload.single("profileImage"), aboutController.updateAboutContent);
router.delete("/delete-about-content/:id", authenticate, aboutController.deleteAboutContent);
router.get("/get-all-about-content", authenticate, aboutController.getAllAboutContent);

export default router;
