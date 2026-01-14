export const EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth:
            process.env.SMTP_USER && process.env.SMTP_PASSWORD
                  ? {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD
                  }
                  : null,
      from: `"Portfolio" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`
};