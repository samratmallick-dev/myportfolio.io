import { Server } from "socket.io";
import Logger from "../logger/logger.config.js";
import getAllowedOrigins from "../cors/cors.config.js";

let io;

export const initializeSocket = (server) => {
      const allowedOrigins = getAllowedOrigins();

      io = new Server(server, {
            cors: {
                  origin: (origin, callback) => {
                        if (!origin) return callback(null, true);

                        if (allowedOrigins.includes(origin)) {
                              return callback(null, true);
                        }

                        Logger.warn("Socket CORS blocked", { origin, allowedOrigins });
                        return callback(new Error(`Socket CORS blocked: ${origin}`));
                  },
                  credentials: true,
                  methods: ["GET", "POST"],
            },
            transports: ["websocket", "polling"],
            pingInterval: 25000,
            pingTimeout: 20000,
      });

      io.on("connection", (socket) => {
            Logger.info(`Socket connected: ${socket.id}`, {
                  origin: socket.handshake.headers.origin,
                  transport: socket.conn.transport.name,
            });

            socket.on("joinAdmin", () => {
                  socket.join("admin");
                  Logger.info(`Socket ${socket.id} joined admin room`);
            });

            socket.on("ping", (payload, ack) => {
                  Logger.info(`Ping received from ${socket.id}`, payload);
                  const pongPayload = {
                        message: "pong",
                        serverTime: new Date().toISOString(),
                        socketId: socket.id,
                        receivedData: payload,
                  };
                  if (typeof ack === "function") {
                        ack(pongPayload);
                  }
                  socket.emit("pong", pongPayload);
            });

            socket.on("disconnect", (reason) => {
                  Logger.info(`Socket disconnected: ${socket.id}`, { reason });
            });

            socket.on("error", (error) => {
                  Logger.error(`Socket error: ${socket.id}`, { error: error.message });
            });
      });

      Logger.info("Socket.IO initialized", { origins: allowedOrigins });

      return io;
};

export const getIO = () => {
      if (!io) {
            throw new Error("Socket.io not initialized");
      }
      return io;
};

export const broadcastPortfolioUpdate = (type, data = null) => {
      if (!io) {
            Logger.warn("Socket.io not initialized — skipping broadcastPortfolioUpdate");
            return;
      }
      io.emit("portfolioUpdated", { type, data });
      Logger.info("Portfolio update broadcast via Socket.IO", { type });
};
