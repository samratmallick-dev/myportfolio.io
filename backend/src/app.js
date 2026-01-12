import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import apiRoutes from "./routes/api.routes.js";

const app = express();

app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', apiRoutes);

app.get("/", (req, res) => {
      res.json({
            message: "Portfolio Backend API is running",
            version: "1.0.0",
            status: "healthy",
            timestamp: new Date().toISOString(),
      });
});

app.use((req, res, next) => {
      res.status(404).json({
            success: false,
            message: "Route not found",
            path: req.originalUrl,
            method: req.method,
      });
});

app.use((err, req, res, next) => {
      console.error("Global Error:", err);
      errorHandler(err, req, res, next);
});

export default app;
