import { Router } from "express";
import educationController from "../../controllers/education.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateEducation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/create-education-details", authenticate, validateEducation, educationController.createEducation);
router.get("/get-all-education-details", educationController.getAllEducation);
router.get("/get-education-details/:id", educationController.getEducationById);
router.put("/update-education-details/:id", authenticate, validateEducation, educationController.updateEducation);
router.delete("/delete-education-details/:id", authenticate, educationController.deleteEducation);
router.get("/get-all-education-admin", authenticate, educationController.getAllEducationAdmin);
router.get("/get-latest-education", educationController.getLatestEducation);

export default router;
