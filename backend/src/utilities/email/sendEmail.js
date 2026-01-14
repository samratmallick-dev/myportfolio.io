import nodemailer from "nodemailer";
import Logger from "../../config/logger/logger.config.js";

const createTransporter = () => {
      return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, 
            auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS?.replace(/\s/g, ""),
            },
            connectionTimeout: 10000, 
            greetingTimeout: 5000, 
            socketTimeout: 15000, 
      });
};

const sendEmail = async (options) => {
      const startTime = Date.now();

      try {
            Logger.info("Attempting to send email", {
                  to: options.to,
                  subject: options.subject,
                  hasCredentials: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
            });

            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                  const error = "Email credentials not configured";
                  Logger.error(error, {
                        EMAIL_USER: !!process.env.EMAIL_USER,
                        EMAIL_PASS: !!process.env.EMAIL_PASS
                  });
                  throw new Error(error);
            }

            const transporter = createTransporter();

            const mailOptions = {
                  from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
                  to: options.to,
                  subject: options.subject,
                  text: options.text,
                  html: options.html,
            };

            Logger.info("Sending email with options", {
                  from: mailOptions.from,
                  to: mailOptions.to,
                  subject: mailOptions.subject
            });

            const info = await transporter.sendMail(mailOptions);

            const duration = Date.now() - startTime;
            Logger.info("Email sent successfully", {
                  messageId: info.messageId,
                  to: options.to,
                  subject: options.subject,
                  accepted: info.accepted,
                  rejected: info.rejected,
                  duration: `${duration}ms`
            });

            return info;
      } catch (error) {
            const duration = Date.now() - startTime;
            Logger.error("Email sending failed", {
                  error: error.message,
                  stack: error.stack,
                  to: options.to,
                  subject: options.subject,
                  code: error.code,
                  command: error.command,
                  duration: `${duration}ms`
            });

            throw new Error(`Email sending failed: ${error.message}`);
      }
};

export { sendEmail };