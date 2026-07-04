import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Gmail App Password-u sanitize et: boşluq, tire və ASCII-dən böyük simvolları sil
const rawSmtpPass = process.env.SMTP_PASS || '';
const smtpPass = rawSmtpPass.replace(/[^\x20-\x7E]/g, '').trim();

const smtpUser = process.env.SMTP_USER || '';
const emailFrom = process.env.EMAIL_FROM || smtpUser;
const useSmtp = Boolean(smtpUser && smtpPass);

if (!useSmtp) {
  console.warn('SMTP_USER veya SMTP_PASS yoxdur - emailler gonderilmeyecek');
} else {
  console.info('SMTP konfigurasyonu tapildi, istifadeci:', smtpUser, 'pass uzunlugu:', smtpPass.length);
}

// Gmail ucun service:'gmail' shortcut - TLS/STARTTLS avtomatik idarə edilir
const transporter = useSmtp
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
    })
  : nodemailer.createTransport({ jsonTransport: true });

if (useSmtp) {
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP verification failed:', JSON.stringify(error));
    } else {
      console.info('SMTP transporter verified - Gmail vasitesile email gondermeyə hazirdir');
    }
  });
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

    if (!useSmtp) {
      console.warn('SMTP konfiqurasiyasi yoxdur - invite email gonderilmir:', data.to);
      return;
    }
    try {
      const info = await transporter.sendMail({
        from: emailFrom,
        to: data.to,
        subject: 'POS Sistemine Devat',
        html,
      });
      console.info('Invite email gonderildi:', info.messageId, '->', data.to);
      return info;
    } catch (err: any) {
      console.error('Invite email gonderilmedi ->', data.to, ':', err?.message || err);
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

    if (!useSmtp) {
      console.warn('SMTP konfigurasiyasi yoxdur - welcome email gonderilmir:', data.to);
      return;
    }
    try {
      const info = await transporter.sendMail({
        from: emailFrom,
        to: data.to,
        subject: 'Xos Gelmisiniz - POS Sistemi',
        html,
      });
      console.info('Welcome email gonderildi:', info.messageId, '->', data.to);
      return info;
    } catch (err: any) {
      console.error('Welcome email gonderilmedi ->', data.to, ':', err?.message || err);
      throw err;
    }
  }
}

export default EmailService;
