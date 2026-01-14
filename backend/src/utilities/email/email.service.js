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
                  auth: EmailConfig.auth,
                  connectionTimeout: 10000,
                  greetingTimeout: 10000,
                  socketTimeout: 10000
            });

            this.enabled = true;
            Logger.info('Email service initialized successfully');
      }

      async sendMail({ to, subject, html, text }) {
            if (!this.enabled || !this.transporter) {
                  throw new Error("Email service is not configured");
            }

            try {
                  const sendPromise = this.transporter.sendMail({
                        from: EmailConfig.from,
                        to,
                        subject,
                        html,
                        text
                  });

                  const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Email sending timeout')), 30000)
                  );

                  const result = await Promise.race([sendPromise, timeoutPromise]);
                  Logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
                  return result;
            } catch (error) {
                  Logger.error(`Failed to send email to ${to}:`, error);
                  throw new Error(`Email delivery failed: ${error.message}`);
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
