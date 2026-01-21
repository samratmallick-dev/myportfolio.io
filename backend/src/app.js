import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import apiRoutes from "./routes/api.routes.js";
import Logger from "./config/logger/logger.config.js";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
      : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:4173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
      ];

if (process.env.CLIENT_URL) {
      const clientUrls = process.env.CLIENT_URL.split(",").map((url) => url.trim()).filter(Boolean);
      allowedOrigins.push(...clientUrls);
}

Logger.info('CORS Configuration', {
      allowedOrigins,
      environment: process.env.NODE_ENV || 'development'
});

app.use(
      cors({
            origin: function (origin, callback) {
                  if (!origin) {
                        return callback(null, true);
                  }
                  const isAllowed = allowedOrigins.some((allowed) => {
                        if (origin === allowed) return true;

                        if (allowed === "*") return true;

                        try {
                              const originHost = new URL(origin).hostname;
                              const allowedHost = new URL(allowed).hostname;
                              return originHost === allowedHost || originHost.endsWith(`.${allowedHost}`);
                        } catch (error) {
                              Logger.warn('Error parsing origin URL', { origin, allowed, error: error.message });
                              return false;
                        }
                  });

                  if (isAllowed) {
                        return callback(null, true);
                  }

                  Logger.warn('CORS request blocked', { origin, allowedOrigins, environment: process.env.NODE_ENV });
                  return callback(new Error("Not allowed by CORS"));
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
            preflightContinue: false,
            optionsSuccessStatus: 204,
      })
);
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