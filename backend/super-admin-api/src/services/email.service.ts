import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || `no-reply@${process.env.FRONTEND_URL?.replace(/^https?:\/\//, '') || 'localhost'}`;
const useSmtp = Boolean(process.env.SMTP_HOST);
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const transporter = useSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465, // Gmail port 465 üçün true olmalıdır
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

// Support Resend: prefer explicit RESEND_API_KEY, otherwise accept SMTP_PASS if it starts with 're_'
const resendApiKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('re_') ? process.env.SMTP_PASS : undefined);

export class EmailService {
  static async sendInvitationEmail(data: {
    to: string;
    name: string;
    password: string;
    token: string;
    role: string;
    expiresAt?: Date;
  }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Ensure frontend URL doesn't end with slash
    const baseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
    // Redirect to backend GET endpoint which will redirect to frontend
    const acceptLink = `${baseUrl}/api/auth/accept-invite?token=${data.token}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .password-box { background: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; }
    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 Sistemə Dəvət</h1></div>
    <div class="content">
      <h2>Salam ${data.name},</h2>
      <p>Sizi <strong>POS Sisteminə</strong> dəvət edirik!</p>
      <p><strong>Rolunuz:</strong> ${data.role}</p>
      <div class="password-box">🔑 Şifrəniz: <strong>${data.password}</strong></div>
      <p style="margin:20px 0;"><a href="${acceptLink}" class="button">✅ Hesabı Aktivləşdir</a></p>
      <p style="color:#ef4444; font-size:14px;">⚠️ İlk daxil olduğunuzda şifrənizi dəyişməyiniz MƏCBURİDİR!</p>
      <p>Hörmətlə,<br>POS Sistem Komandası</p>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} POS System. All rights reserved.</p></div>
  </div>
</body>
</html>`;

    try {
      // Prefer Resend HTTP API when API key is available, but gracefully fall back
      if (resendApiKey) {
        try {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({ from: emailFrom, to: data.to, subject: '🎉 POS Sisteminə Dəvət', html }),
          });
          const info = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            console.error('❌ Resend API error:', info);
            // If domain is not verified, prefer Ethereal preview instead of attempting SMTP
            if (info?.name === 'validation_error' && typeof info?.message === 'string' && info.message.includes('domain')) {
              console.warn('⚠️ Resend reports unverified domain — using Ethereal preview instead of SMTP.');
              // fall through to Ethereal fallback below
            } else {
              // For other errors, fall back to SMTP/Ethereal
            }
          } else {
            console.info('📨 Sent via Resend API, id:', info?.id || '(no id)');
            return info;
          }
        } catch (errFetch: any) {
          console.warn('⚠️ Resend HTTP request failed, falling back to SMTP/Ethereal:', errFetch?.message || errFetch);
          // continue to fallback
        }
      }

      // Nodemailer / Ethereal fallback
      if (!useSmtp) {
        const testAccount = await nodemailer.createTestAccount();
        const ethTransport = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await ethTransport.sendMail({ from: emailFrom, to: data.to, subject: '🎉 POS Sisteminə Dəvət', html });
        const preview = nodemailer.getTestMessageUrl(info);
        console.info('📨 Invite preview URL:', preview);
        return info;
      }

      try {
        const info = await transporter.sendMail({ from: emailFrom, to: data.to, subject: '🎉 POS Sisteminə Dəvət', html });
        return info;
      } catch (smtpErr: any) {
        console.warn('⚠️ SMTP send failed, attempting Ethereal preview fallback:', smtpErr?.message || smtpErr);
        // Attempt Ethereal fallback
        const testAccount = await nodemailer.createTestAccount();
        const ethTransport = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await ethTransport.sendMail({ from: emailFrom, to: data.to, subject: '🎉 POS Sisteminə Dəvət', html });
        const preview = nodemailer.getTestMessageUrl(info);
        console.info('📨 Invite preview URL (fallback):', preview);
        return info;
      }
    } catch (err: any) {
      console.error('❌ Failed to send invitation email:', err);
      throw err;
    }
  }

  static async sendWelcomeEmail(data: { to: string; name: string }) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Xoş gəlmisiniz</h1></div>
    <div class="content">
      <h2>Salam ${data.name},</h2>
      <p>Hesabınız uğurla aktivləşdirildi. İndi POS sisteminə daxil ola bilərsiniz.</p>
      <p>Hörmətlə,<br>POS Sistem Komandası</p>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} POS System. All rights reserved.</p></div>
  </div>
</body>
</html>`;

    try {
      if (resendApiKey) {
        try {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
            body: JSON.stringify({ from: emailFrom, to: data.to, subject: '🎉 Xoş gəlmisiniz - POS Sistemi', html }),
          });
          const info = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            console.error('❌ Resend API error:', info);
            if (info?.name === 'validation_error' && typeof info?.message === 'string' && info.message.includes('domain')) {
              console.warn('⚠️ Resend reports unverified domain — using Ethereal preview instead of SMTP.');
            }
          } else {
            console.info('📨 Welcome sent via Resend API, id:', info?.id || '(no id)');
            return info;
          }
        } catch (errFetch: any) {
          console.warn('⚠️ Resend HTTP request failed, falling back to SMTP/Ethereal:', errFetch?.message || errFetch);
        }
      }

      if (!useSmtp) {
        const testAccount = await nodemailer.createTestAccount();
        const ethTransport = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await ethTransport.sendMail({ from: emailFrom, to: data.to, subject: '🎉 Xoş gəlmisiniz - POS Sistemi', html });
        const preview = nodemailer.getTestMessageUrl(info);
        console.info('📨 Welcome preview URL:', preview);
        return info;
      }

      try {
        const info = await transporter.sendMail({ from: emailFrom, to: data.to, subject: '🎉 Xoş gəlmisiniz - POS Sistemi', html });
        return info;
      } catch (smtpErr: any) {
        console.warn('⚠️ SMTP send failed, attempting Ethereal preview fallback:', smtpErr?.message || smtpErr);
        const testAccount = await nodemailer.createTestAccount();
        const ethTransport = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await ethTransport.sendMail({ from: emailFrom, to: data.to, subject: '🎉 Xoş gəlmisiniz - POS Sistemi', html });
        const preview = nodemailer.getTestMessageUrl(info);
        console.info('📨 Welcome preview URL (fallback):', preview);
        return info;
      }
    } catch (err: any) {
      console.error('❌ Failed to send welcome email:', err);
      throw err;
    }
  }
}

export default EmailService;
