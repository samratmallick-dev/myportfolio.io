import { Router } from "express";
import serviceController from "../../controllers/service.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateService, handleValidationErrors } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/create-services", authenticate, validateService, handleValidationErrors, serviceController.createService);
router.get("/get-all-services", serviceController.getAllServices);
router.get("/get-services/:servicesId", serviceController.getServiceById);
router.put("/update-services/:servicesId", authenticate, validateService, handleValidationErrors, serviceController.updateService);
router.delete("/delete-services/:servicesId", authenticate, serviceController.deleteService);
router.get("/get-all-services-admin", authenticate, serviceController.getAllServicesAdmin);

export default router;
