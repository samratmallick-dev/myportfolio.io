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
            if (!EmailConfig.auth?.user || !EmailConfig.auth?.pass) {
                  Logger.warn('Email service disabled: Gmail credentials not configured');
                  this.enabled = false;
                  return;
            }

            this.transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: EmailConfig.auth,
                  connectionTimeout: 60000,
                  greetingTimeout: 30000,
                  socketTimeout: 60000,
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
