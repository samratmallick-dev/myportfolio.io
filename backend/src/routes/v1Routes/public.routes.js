import { Router } from "express";
import publicController from "../../controllers/public.controller.js";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";

const router = Router();

router.get("/initial-data", cacheMiddleware(300), publicController.getPublicData);

export default router;
