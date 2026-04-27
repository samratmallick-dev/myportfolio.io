import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import heroRoutes from "./hero.routes.js";
import aboutRoutes from "./about.routes.js";
import educationRoutes from "./education.routes.js";
import projectRoutes from "./project.routes.js";
import servicesRoutes from "./services.routes.js";
import contactRoutes from "./contact.routes.js";
import skillRoutes from "./skill.routes.js";
import publicRoutes from "./public.routes.js";
import { addSSEClient, removeSSEClient } from "../../utilities/sse/sse.js";

const router = Router();

router.get("/events", (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      res.write("data: {\"type\":\"connected\"}\n\n");
      addSSEClient(res);
      req.on("close", () => removeSSEClient(res));
});

router.use("/public", publicRoutes);
router.use("/admin", adminRoutes);
router.use("/hero", heroRoutes);
router.use("/about", aboutRoutes);
router.use("/education", educationRoutes);
router.use("/projects", projectRoutes);
router.use("/services", servicesRoutes);
router.use("/contact", contactRoutes);
router.use("/skills", skillRoutes);

export default router;