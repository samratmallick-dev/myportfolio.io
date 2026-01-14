import nodemailer from "nodemailer";
import { EmailConfig } from "./email.config.js";
import Logger from '../../config/logger/logger.config.js';

class EmailService {
      constructor() {
            this.transporter = null;
            this.enabled = false;
            this.initialize();
      }

      initialize() {
            if (!EmailConfig.host || !EmailConfig.port) {
                  Logger.warn('Email service disabled: SMTP not configured');
                  this.enabled = false;
                  return;
            }

            this.transporter = nodemailer.createTransport({
                  host: EmailConfig.host,
                  port: EmailConfig.port,
                  secure: EmailConfig.secure,
                  auth: EmailConfig.auth
            });

            this.enabled = true;
            Logger.info('Email service initialized successfully');
      }

      async sendMail({ to, subject, html, text }) {
            if (!this.enabled || !this.transporter) {
                  throw new Error("Email service is not configured");
            }

            try {
                  const result = await this.transporter.sendMail({
                        from: EmailConfig.from,
                        to,
                        subject,
                        html,
                        text
                  });

                  Logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
                  return result;
            } catch (error) {
                  Logger.error(`Failed to send email to ${to}:`, error);
                  throw error;
            }
      }

      async testConnection() {
            if (!this.enabled || !this.transporter) {
                  return false;
            }

            try {
                  await this.transporter.verify();
                  Logger.info('Email service connection verified');
                  return true;
            } catch (error) {
                  Logger.error('Email service connection failed:', error);
                  return false;
            }
      }
}

const emailService = new EmailService();
export default emailService;
