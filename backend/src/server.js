import "dotenv/config";
import { createServer } from "http";
import mongoose from "mongoose";
import { connectDb } from "./config/db/config.db.js";
import { validateEnvironment } from "./config/env.config.js";
import { initializeSocket } from "./config/socket/socket.config.js";
import Logger from "./config/logger/logger.config.js";
import app from "./app.js";

const port = Number(process.env.PORT || 5000);

let httpServer;

const startServer = async () => {
      // Fail fast when JWT/cookie/bootstrap secrets are missing or unsafe.
      validateEnvironment();

      await connectDb();

      httpServer = createServer(app);
      initializeSocket(httpServer);

      httpServer.on("error", (error) => {
            console.error("Express server error:", error.message);
            Logger.error(`Express server error: ${error.message}`);
      });

      httpServer.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            Logger.info(`Server is running on port ${port}`);
      });
};

const stopServer = async (signal) => {
      console.log(`${signal} received. Shutting down...`);
      if (httpServer) {
            httpServer.close(async () => {
                  try {
                        await mongoose.default.disconnect();
                        process.exit(0);
                  } catch (error) {
                        console.error("Shutdown failed:", error.message);
                        process.exit(1);
                  }
            });
      } else {
            process.exit(0);
      }
};

process.on("SIGTERM", () => stopServer("SIGTERM"));
process.on("SIGINT", () => stopServer("SIGINT"));

startServer().catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
});
