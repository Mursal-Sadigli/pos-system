import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendInvitationEmail(data: {
    to: string;
    name: string;
    password: string;
    token: string;
    role: string;
  }) {
    const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${data.token}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;">
        <h2>Salam ${data.name},</h2>
        <p>Sizi POS sisteminə dəvət etdik. Aşağıdakı məlumatlarla daxil olun və şifrənizi dəyişin.</p>
        <p><strong>Rol:</strong> ${data.role}</p>
        <p><strong>Şifrə:</strong> ${data.password}</p>
        <p><a href="${acceptUrl}" style="background:#374151;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">Hesabı Aktivləşdir</a></p>
        <p>Əgər bu siz deyilsinizsə, zəhmət olmasa bizimlə əlaqə saxlayın.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.to,
      subject: 'POS Sisteminə Dəvət',
      html,
    });
  }
}
