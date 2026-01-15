import "dotenv/config";
import App from "./app.js";
import connectDb from "./config/db/config.db.js";
import Logger from "./config/logger/logger.config.js";
import emailService from "./utilities/email/email.service.js";

const PORT = process.env.PORT || 5000;

emailService.initialize();

emailService.testConnection().then(success => {
      if (success) {
            Logger.info('Email service is ready');
      } else {
            Logger.warn('Email service test failed - check your credentials');
      }
});

connectDb().then(
      () => {
            App.on("error", (error) => {
                  console.error('Express server error:', error);
                  Logger.error('Express server error', error);
                  throw new Error('Express server error');
            });

            App.listen(PORT, () => {
                  console.log(`🚀 Server is running on port: http://localhost:${PORT}`);
                  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
                  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
                  Logger.info(`Server is running on port: http://localhost:${PORT}`);
            });
      }
).catch((error) => {
      console.error('MongoDB connection Failed:', error.message);
      Logger.error('MongoDB connection Failed', error);
      process.exit(1);
});