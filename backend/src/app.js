import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import apiRoutes from "./routes/api.routes.js";

const app = express();

const allowedOrigins = (
      process.env.ALLOWED_ORIGINS ||
      [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://localhost:3001",
            process.env.CLIENT_URL,
      ].filter(Boolean).join(",")
).split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(
      cors({
            origin: function (origin, callback) {
                  if (!origin) return callback(null, true);

                  const isAllowed =
                        allowedOrigins.length === 0 ||
                        allowedOrigins.some((allowed) => {
                              if (allowed === "*") return true;
                              if (origin === allowed) return true;
                              try {
                                    const originHost = new URL(origin).hostname;
                                    const allowedHost = new URL(allowed).hostname;
                                    return originHost === allowedHost || originHost.endsWith(`.${allowedHost}`);
                              } catch {
                                    return false;
                              }
                        });

                  if (isAllowed) return callback(null, true);
                  return callback(new Error("Not allowed by CORS"));
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            allowedHeaders: [
                  "Content-Type",
                  "Authorization",
                  "Cache-Control",
                  "Expires",
                  "Pragma",
            ],
      })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
      res.json({
            message: "Portfolio Backend API is running",
            version: "1.0.0",
            status: "healthy",
            timestamp: new Date().toISOString(),
      });
});

app.use((req, res) => {
      res.status(404).json({
            success: false,
            message: "Route not found",
            path: req.originalUrl,
            method: req.method,
      });
});

app.use((err, req, res, next) => {
      errorHandler(err, req, res, next);
});

export default app;
