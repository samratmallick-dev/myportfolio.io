import nodemailer from "nodemailer";
import Logger from "../../config/logger/logger.config.js";

const createTransporter = () => {
      return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
            },
      });
};

const sendEmail = async (options) => {
      try {
            const transporter = createTransporter();

            const mailOptions = {
                  from: `${process.env.EMAIL_USER}`,
                  to: options.to,
                  subject: options.subject,
                  text: options.text,
                  html: options.html,
            };

            const info = await transporter.sendMail(mailOptions);
            Logger.info("Email sent successfully", {
                  messageId: info.messageId,
                  to: options.to,
                  subject: options.subject,
            });

            return info;
      } catch (error) {
            Logger.error("Email sending failed", {
                  error: error.message,
                  to: options.to,
                  subject: options.subject,
            });
            throw new Error(`Email sending failed: ${error.message}`);
      }
};

export { sendEmail };
