import dotenv from "dotenv";
dotenv.config();

import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || "";
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
// FROM address: if Resend is configured use their default, otherwise use SMTP user
const emailFrom = process.env.EMAIL_FROM || (resendApiKey ? "onboarding@resend.dev" : smtpUser);

console.info(`Email config: resend=${Boolean(resendApiKey)}, smtp=${Boolean(smtpUser)}, from=${emailFrom}`);

const resend = resendApiKey ? new Resend(resendApiKey) : null;

async function sendEmail(to: string, subject: string, html: string) {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }
      console.info("Email sent via Resend, id:", data?.id, "->", to);
      return;
    } catch (error) {
      console.warn("⚠️ Resend failed, trying SMTP fallback:", error);
    }
  }

    try {
      const frontendUrl = process.env.FRONTEND_URL || "https://kvantumpay.vercel.app";
      const apiUrl = `${frontendUrl.replace(/\/$/, "")}/api/send-email`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html,
          secret: process.env.EMAIL_SECRET || 'kvantum_pos_secret_2026',
          smtpUser: process.env.SMTP_USER,
          smtpPass: process.env.SMTP_PASS,
          smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
          smtpPort: process.env.SMTP_PORT || 587
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Vercel API error: ${response.status} ${errorData}`);
      }

      console.info(`✅ Email sent via Vercel SMTP Relay: ${subject} to ${to}`);
      return;
    } catch (error) {
      console.error("❌ Vercel SMTP Relay error:", error);
      throw error;
    }
}

export class EmailService {
  static async sendInvitationEmail(data: {
    to: string;
    name: string;
    password: string;
    token: string;
    role: string;
    expiresAt?: Date;
  }) {
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const acceptLink = `${frontendUrl}/api/auth/accept-invite?token=${data.token}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
    .header { background: #4F46E5; color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; }
    .password-box { background: #f3f4f6; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 20px; text-align: center; letter-spacing: 2px; margin: 20px 0; }
    .button { display: inline-block; background: #4F46E5; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 20px 0; }
    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; color: #dc2626; font-size: 14px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>POS Sistemine Devat</h1></div>
    <div class="content">
      <p>Salam <strong>${data.name}</strong>,</p>
      <p>Sizi <strong>POS Sisteminə</strong> dəvət edirik. Rolunuz: <strong>${data.role}</strong></p>
      <p>Müvəqqəti şifrəniz:</p>
      <div class="password-box">${data.password}</div>
      <p style="text-align:center">
        <a href="${acceptLink}" class="button">Hesabi Aktivlesdirin</a>
      </p>
      <p style="font-size:13px;color:#6b7280;">Düymə işləmirsə bu linki açın:<br>${acceptLink}</p>
      <div class="warning">Ilk girişdə şifrənizi dəyişdirin!</div>
    </div>
    <div class="footer">POS System &copy; ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;

    return sendEmail(data.to, "POS Sistemine Devat - Hesabinizi Aktivlesdirin", html);
  }

  static async sendWelcomeEmail(data: { to: string; name: string }) {
    const html = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
    <div style="background:#4F46E5;color:white;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;">Xos Gelmisiniz!</h1>
    </div>
    <div style="padding:32px 24px;">
      <p>Salam <strong>${data.name}</strong>,</p>
      <p>Hesabiniz ugurla aktivlesdirildi. Indi POS sisteminə daxil ola bilərsiniz.</p>
      <p>Hörmətlə,<br>POS Sistem Komandası</p>
    </div>
    <div style="text-align:center;padding:20px;color:#9ca3af;font-size:13px;">POS System &copy; ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;

    return sendEmail(data.to, "Xos Gelmisiniz - POS Sistemi", html);
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string) {
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const html = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
    <div style="background:#4F46E5;color:white;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;">Şifrə Sıfırlama</h1>
    </div>
    <div style="padding:32px 24px;">
      <p>Salam <strong>${name}</strong>,</p>
      <p>Şifrənizi sıfırlamaq üçün aşağıdakı düyməyə klikləyin:</p>
      <p style="text-align:center">
        <a href="${resetLink}" style="display:inline-block;background:#4F46E5;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;margin:20px 0;">Şifrəni Yenilə</a>
      </p>
      <p style="font-size:13px;color:#6b7280;">Əgər bu tələbi siz etməmisinizsə, bu mesajı nəzərə almayın.</p>
    </div>
    <div style="text-align:center;padding:20px;color:#9ca3af;font-size:13px;">POS System &copy; ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;

    return sendEmail(email, "Şifrə Sıfırlama - POS Sistemi", html);
  }
}

export default EmailService;
