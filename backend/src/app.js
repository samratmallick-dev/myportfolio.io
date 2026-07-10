import express from "express";
import cors from "cors";
import getAllowedOrigins from "./config/cors/cors.config.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import apiRoutes from "./routes/api.routes.js";
import Logger from "./config/logger/logger.config.js";
import { clearCache } from "./middleware/cache.middleware.js";
import compression from "compression";

const app = express();

app.use(compression({
      threshold: 1024,
      filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                  return false;
            }
            const contentType = res.getHeader('Content-Type');
            if (contentType && (
                  contentType.startsWith('image/') ||
                  contentType.startsWith('video/') ||
                  contentType.includes('zip') ||
                  contentType.includes('pdf')
            )) {
                  return false;
            }
            return compression.filter(req, res);
      }
}));

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
      const startTime = process.hrtime();

      res.on('finish', () => {
            const duration = process.hrtime(startTime);
            const durationMs = (duration[0] * 1000) + (duration[1] / 1e6);
            const threshold = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || "500", 10);

            if (durationMs > threshold) {
                  Logger.warn("Slow API Request detected", {
                        method: req.method,
                        path: req.originalUrl || req.path,
                        durationMs: parseFloat(durationMs.toFixed(2)),
                        status: res.statusCode,
                        threshold,
                  });
            }
      });
      next();
});
app.use((req, res, next) => {
      if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
            res.on('finish', () => {
                  if (res.statusCode >= 200 && res.statusCode < 300) {
                        Logger.info("Mutating request finished successfully, clearing cache", { method: req.method, path: req.path });
                        clearCache();
                  }
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

app.get("/health", (req, res) => {
      res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
      });
});

app.get("/events", (req, res) => res.status(204).end());

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