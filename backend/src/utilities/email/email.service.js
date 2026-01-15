import Logger from "../../config/logger/logger.config.js";

class EmailService {
      constructor() {
            this.enabled = Boolean(
                  process.env.GMAIL_CLIENT_ID &&
                  process.env.GMAIL_CLIENT_SECRET &&
                  process.env.GMAIL_REFRESH_TOKEN &&
                  process.env.GMAIL_SENDER
            );

            if (this.enabled) {
                  Logger.info("✅ Gmail API email service enabled");
            } else {
                  Logger.warn("⚠️ Gmail API email service disabled (missing env vars)");
            }
      }

      async getAccessToken() {
            const res = await fetch("https://oauth2.googleapis.com/token", {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams({
                        client_id: process.env.GMAIL_CLIENT_ID,
                        client_secret: process.env.GMAIL_CLIENT_SECRET,
                        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
                        grant_type: "refresh_token",
                  }),
            });

            const data = await res.json();
            if (!data.access_token) {
                  throw new Error(`Failed to refresh access token: ${JSON.stringify(data)}`);
            }

            return data.access_token;
      }

      createRawEmail({ to, subject, html, text }) {
            const content = html || text || "";

            const email = [
                  `From: "Portfolio Admin" <${process.env.GMAIL_SENDER}>`,
                  `To: ${to}`,
                  `Subject: ${subject}`,
                  "MIME-Version: 1.0",
                  html
                        ? "Content-Type: text/html; charset=utf-8"
                        : "Content-Type: text/plain; charset=utf-8",
                  "",
                  content,
            ].join("\n");

            return Buffer.from(email)
                  .toString("base64")
                  .replace(/\+/g, "-")
                  .replace(/\//g, "_")
                  .replace(/=+$/, "");
      }

      async sendMail({ to, subject, html, text }) {
            if (!this.enabled) {
                  throw new Error("Email service disabled");
            }

            const accessToken = await this.getAccessToken();
            const raw = this.createRawEmail({ to, subject, html, text });

            const res = await fetch(
                  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                  {
                        method: "POST",
                        headers: {
                              Authorization: `Bearer ${accessToken}`,
                              "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ raw }),
                  }
            );

            if (!res.ok) {
                  const err = await res.text();
                  throw new Error(`Gmail API send failed: ${err}`);
            }

            Logger.info("📧 Email sent via Gmail API", { to, subject });
            return true;
      }
}

export default new EmailService();
