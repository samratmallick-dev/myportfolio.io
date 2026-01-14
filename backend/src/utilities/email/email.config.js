export const EmailConfig = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
      auth:
            process.env.SMTP_USER && process.env.SMTP_PASSWORD
                  ? {
                        user: process.env.SMTP_USER,
                        pass: String(process.env.SMTP_PASSWORD)
                  }
                  : null,
      from: `"Portfolio" ${process.env.SMTP_FROM || process.env.SMTP_USER}`
};