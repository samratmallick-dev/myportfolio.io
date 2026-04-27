import { Router } from "express";
import publicController from "../../controllers/public.controller.js";

const router = Router();

router.get("/initial-data", publicController.getPublicData);

export default router;