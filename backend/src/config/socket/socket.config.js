import { Server } from "socket.io";
import Logger from "../logger/logger.config.js";

let io;

export const initializeSocket = (server) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
            : ["http://localhost:5173", "http://localhost:5174"];

      if (process.env.CLIENT_URL) {
            const clientUrls = process.env.CLIENT_URL.split(",").map((url) => url.trim()).filter(Boolean);
            allowedOrigins.push(...clientUrls);
      }

      io = new Server(server, {
            cors: {
                  origin: allowedOrigins,
                  credentials: true,
            },
      });

      io.on("connection", (socket) => {
            Logger.info(`Socket connected: ${socket.id}`);

            socket.on("joinAdmin", () => {
                  socket.join("admin");
                  Logger.info(`Socket ${socket.id} joined admin room`);
            });

            socket.on("disconnect", () => {
                  Logger.info(`Socket disconnected: ${socket.id}`);
            });
      });

      return io;
};

export const getIO = () => {
      if (!io) {
            throw new Error("Socket.io not initialized");
      }
      return io;
};
