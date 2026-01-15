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
            if (
                  !EmailConfig.host ||
                  !EmailConfig.port ||
                  !EmailConfig.auth?.user ||
                  !EmailConfig.auth?.pass
            ) {
                  Logger.error('Email service disabled: SMTP credentials missing');
                  this.enabled = false;
                  return;
            }

            this.transporter = nodemailer.createTransport({
                  service: EmailConfig.service,
                  host: EmailConfig.host,
                  port: EmailConfig.port,
                  secure: EmailConfig.secure,
                  auth: EmailConfig.auth,
                  tls: EmailConfig.tls,
                  debug: EmailConfig.debug,
                  logger: EmailConfig.logger,
                  connectionTimeout: 10000,
                  greetingTimeout: 5000,
                  socketTimeout: 10000
            });

            this.enabled = true;
            Logger.info('Email service initialized');
      }


      async sendMail({ to, subject, html, text }) {
            if (!this.enabled || !this.transporter) {
                  Logger.error('Email service not configured');
                  throw new Error("Email service is not configured");
            }

            try {
                  console.log(`\n🔵 SENDING EMAIL TO: ${to}`);
                  console.log(`📧 Subject: ${subject}`);
                  console.log(`📤 From: ${EmailConfig.from}`);
                  
                  Logger.info(`Attempting to send email to ${to}...`);
                  Logger.info(`Email config: from=${EmailConfig.from}, host=${EmailConfig.host}, port=${EmailConfig.port}`);

                  const result = await this.transporter.sendMail({
                        from: EmailConfig.from,
                        to,
                        subject,
                        html,
                        text
                  });

                  console.log(`✅ EMAIL SENT SUCCESSFULLY!`);
                  console.log(`📬 MessageId: ${result.messageId}`);
                  console.log(`✔️  Accepted: ${JSON.stringify(result.accepted)}`);
                  console.log(`❌ Rejected: ${JSON.stringify(result.rejected)}\n`);

                  Logger.info(`Email sent successfully to ${to}`, {
                        messageId: result.messageId,
                        response: result.response,
                        accepted: result.accepted,
                        rejected: result.rejected,
                        pending: result.pending
                  });
                  return result;
            } catch (error) {
                  console.error(`\n❌ EMAIL FAILED TO: ${to}`);
                  console.error(`Error: ${error.message}\n`);
                  
                  Logger.error(`Failed to send email to ${to}:`, {
                        message: error.message,
                        code: error.code,
                        command: error.command,
                        response: error.response,
                        responseCode: error.responseCode
                  });
                  throw new Error(`Email delivery failed: ${error.message}`);
            }
      }

      async testConnection() {
            if (!this.enabled || !this.transporter) {
                  Logger.error('Email service not enabled for testing');
                  return false;
            }

            try {
                  await this.transporter.verify();
                  Logger.info('Email service connection verified successfully');
                  return true;
            } catch (error) {
                  Logger.error('Email service connection failed:', {
                        message: error.message,
                        code: error.code,
                        response: error.response
                  });
                  return false;
            }
      }
}

const emailService = new EmailService();
export default emailService;