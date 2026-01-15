// backend/src/utilities/email/email.service.js
import nodemailer from "nodemailer";
import { EmailConfig } from "./email.config.js";
import Logger from "../../config/logger/logger.config.js";

class EmailService {
      constructor() {
            this.transporter = null;
            this.enabled = false;
            this.initialize();
      }

      initialize() {
            if (!EmailConfig.auth?.user || !EmailConfig.auth?.pass) {
                  Logger.error("❌ Email service disabled: missing SMTP credentials");
                  return;
            }

            this.transporter = nodemailer.createTransport({
                  host: EmailConfig.host,
                  port: EmailConfig.port,
                  secure: EmailConfig.secure,
                  auth: EmailConfig.auth,
                  connectionTimeout: EmailConfig.connectionTimeout,
                  greetingTimeout: EmailConfig.greetingTimeout,
                  socketTimeout: EmailConfig.socketTimeout
            });

            this.enabled = true;
            Logger.info("✅ Email service initialized");
      }

      async sendMail(payload) {
            if (!this.enabled) {
                  throw new Error("Email service disabled");
            }

            return this.transporter.sendMail({
                  from: EmailConfig.from,
                  ...payload
            });
      }

      async testConnection() {
            try {
                  await this.transporter.verify();
                  Logger.info("✅ SMTP verified");
                  return true;
            } catch (err) {
                  Logger.error("❌ SMTP verify failed", err.message);
                  return false;
            }
      }
}

export default new EmailService();
