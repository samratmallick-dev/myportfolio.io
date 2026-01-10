import { Router } from "express";
import serviceController from "../../controllers/service.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = Router();

router.post("/create-services", authenticate, upload.single("icon"), serviceController.createService);
router.get("/get-all-services", serviceController.getAllServices);
router.get("/get-services/:servicesId", serviceController.getServiceById);
router.put("/update-services/:servicesId", authenticate, upload.single("icon"), serviceController.updateService);
router.delete("/delete-services/:servicesId", authenticate, serviceController.deleteService);
router.get("/get-all-services-admin", authenticate, serviceController.getAllServicesAdmin);

export default router;
