// backend/src/utilities/email/email.config.js
export const EmailConfig = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD // Gmail App Password
      },
      from: `"Portfolio Admin" <${process.env.SMTP_USER}>`,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      debug: true,
      logger: true
};
