import express from "express";
import cors from "cors";
import getAllowedOrigins from "./config/cors/cors.config.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import apiRoutes from "./routes/api.routes.js";
import Logger from "./config/logger/logger.config.js";

const app = express();

const allowedOrigins = getAllowedOrigins();

const corsOptions = {
      origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                  return callback(null, true);
            }

            Logger.warn("CORS request blocked", { origin, allowedOrigins });
            return callback(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            "Expires",
            "Pragma",
            "X-Requested-With",
      ],
      exposedHeaders: ["X-Cache"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
      if (req.path !== '/health' && req.path !== '/') {
            Logger.info('Incoming request', {
                  method: req.method,
                  path: req.path,
                  origin: req.headers.origin,
            });
      }
      next();
});

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
      res.json({
            message: "Portfolio Backend API is running",
            version: "1.0.0",
            status: "healthy",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
      });
});

// Health check endpoint
app.get("/health", (req, res) => {
      res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
      });
});

// 404 handler
app.use((req, res) => {
      Logger.warn('Route not found', {
            path: req.originalUrl,
            method: req.method,
            ip: req.ip,
            origin: req.headers.origin
      });
      res.status(404).json({
            success: false,
            message: "Route not found",
            path: req.originalUrl,
            method: req.method,
      });
});

// Global error handler
app.use((err, req, res, next) => {
      errorHandler(err, req, res, next);
});

export default app;