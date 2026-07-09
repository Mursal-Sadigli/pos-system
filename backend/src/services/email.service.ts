import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const smtpHost = process.env.SMTP_HOST;
const emailFrom = process.env.EMAIL_FROM || (resendApiKey ? 'onboarding@resend.dev' : 'noreply@localhost');
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const transporter = smtpHost
  ? nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export class EmailService {
  // ==================== SEND EMAIL HELPER ====================
  private static async sendEmail({
    to,
    subject,
    html,
    from = emailFrom,
  }: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    try {
      const { GeneralSettingModel } = require('../models/GeneralSetting.model');
      const settings = await GeneralSettingModel.getSettings();
      if (settings && !settings.enableEmailNotifications) {
        console.log('📧 Email sending disabled by general settings');
        return;
      }

      const recipients = Array.isArray(to) ? to : [to];
      console.log('📧 Sending email', { to: recipients, subject, from, frontendUrl: process.env.FRONTEND_URL });

      if (resend) {
        try {
          const { data, error } = await resend.emails.send({
            from,
            to: recipients,
            subject,
            html,
          });

          if (error) {
            throw new Error(error.message);
          }

          console.log(`✅ Email sent via Resend: ${subject} to ${recipients.join(', ')}`, data);
          return;
        } catch (error) {
          console.warn('⚠️ Resend failed, trying SMTP fallback:', error);
        }
      }

      if (transporter) {
        const info = await transporter.sendMail({
          from,
          to: recipients,
          subject,
          html,
        });
        console.log(`✅ Email sent via SMTP: ${subject} to ${recipients.join(', ')}`, info.messageId);
        return;
      }

      const testAccount = await nodemailer.createTestAccount();
      const testTransport = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      const info = await testTransport.sendMail({ from, to: recipients, subject, html });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.warn('⚠️ No real mail provider configured. Preview URL:', previewUrl);
    } catch (error) {
      console.error('❌ Email service error:', error);
      throw error;
    }
  }

  // ==================== WELCOME EMAIL ====================
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to POS System</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .header {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
            background: #fafafa;
            border-radius: 0 0 12px 12px;
          }
          .content h2 {
            margin-top: 0;
            color: #1a1a1a;
            font-size: 22px;
          }
          .content p {
            color: #4a4a4a;
            margin-bottom: 16px;
          }
          .content ul {
            padding-left: 20px;
            color: #4a4a4a;
          }
          .content ul li {
            margin-bottom: 8px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 16px;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: scale(1.02);
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .footer a {
            color: #4F46E5;
            text-decoration: none;
          }
          .badge {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to POS System!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Your all-in-one point of sale solution</p>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>We're thrilled to have you on board! Your account has been successfully created.</p>
            <p>With POS System, you can:</p>
            <ul>
              <li>✅ Process sales quickly and efficiently</li>
              <li>📦 Manage your products and inventory</li>
              <li>👥 Track customers and their purchase history</li>
              <li>📊 Generate detailed reports and analytics</li>
              <li>💰 Accept payments securely</li>
            </ul>
            <p style="margin-top: 24px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                Get Started Now →
              </a>
            </p>
            <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">
              <span class="badge">🎯 Ready to sell</span>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POS System. All rights reserved.</p>
            <p style="font-size: 12px; color: #9ca3af;">
              You received this email because you registered on POS System.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: '🚀 Welcome to POS System!',
      html,
    });
  }

  // ==================== PASSWORD RESET EMAIL ====================
  static async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .header {
            background: linear-gradient(135deg, #EF4444, #DC2626);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
            background: #fafafa;
            border-radius: 0 0 12px 12px;
          }
          .content h2 {
            margin-top: 0;
            color: #1a1a1a;
            font-size: 22px;
          }
          .content p {
            color: #4a4a4a;
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #EF4444, #DC2626);
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 8px;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: scale(1.02);
          }
          .warning-box {
            background: #FEF2F2;
            border-left: 4px solid #EF4444;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-box p {
            margin: 0;
            color: #991B1B;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .expiry {
            display: inline-block;
            background: #FEF3C7;
            color: #92400E;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Reset Your Password</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Secure password reset request</p>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>We received a request to reset your password for your POS System account.</p>
            <p>Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" class="button">🔐 Reset Password</a>
            </p>
            <div class="warning-box">
              <p>⏰ <strong>This link expires in 1 hour</strong></p>
              <p style="font-size: 13px; margin-top: 4px;">If you didn't request this, please ignore this email.</p>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
              <span class="expiry">⏱️ Expires in 1 hour</span>
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
              For security reasons, this link can only be used once.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POS System. All rights reserved.</p>
            <p style="font-size: 12px; color: #9ca3af;">
              If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: '🔑 Reset Your Password',
      html,
    });
  }

  // ==================== INVITATION EMAIL ====================
  static async sendInvitationEmail(data: {
    email: string;
    name: string;
    password: string;
    inviteToken: string;
    role: string;
  }): Promise<void> {
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${data.inviteToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to POS System</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .header {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
            background: #fafafa;
            border-radius: 0 0 12px 12px;
          }
          .content h2 {
            margin-top: 0;
            color: #1a1a1a;
            font-size: 22px;
          }
          .content p {
            color: #4a4a4a;
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 16px;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: scale(1.02);
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .footer a {
            color: #4F46E5;
            text-decoration: none;
          }
          .badge {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>POS Sisteminə Dəvət</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Sizi komandamızda salamlamaq üçün dəvət edirik.</p>
          </div>
          <div class="content">
            <h2>Salam ${data.name},</h2>
            <p>Sizə ${data.role} rolunda POS sistemimizə giriş üçün dəvət göndərildi.</p>
            <p><strong>Hesab məlumatlarınız:</strong></p>
            <p>Email: ${data.email}</p>
            <p>Şifrə: ${data.password}</p>
            <p>Rol: ${data.role}</p>
            <p>Linkə klikləyin və hesabınızı aktivləşdirin:</p>
            <p><a href="${inviteLink}" class="button">Dəvəti qəbul et</a></p>
            <div style="margin-top: 20px; padding: 16px; background: #f3f4f6; border-radius: 12px;">
              <p style="margin: 0; font-weight: 600;">Vacib:</p>
              <ul style="padding-left: 20px; margin: 8px 0 0; color: #4a4a4a;">
                <li>Dəvət 48 saat ərzində etibarlıdır.</li>
                <li>İlk daxil olduqda şifrənizi dəyişməyiniz tələb olunur.</li>
                <li>Şifrənizi heç kimlə paylaşmayın.</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POS System. Bütün hüquqlar qorunur.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: data.email,
      subject: `POS Sisteminə Dəvət - ${data.role}`,
      html,
    });
  }

  // ==================== ORDER CONFIRMATION EMAIL ====================
  static async sendOrderConfirmationEmail(
    to: string,
    name: string,
    orderNumber: string,
    total: number,
    items?: Array<{ name: string; quantity: number; price: number }>
  ): Promise<void> {
    let itemsHtml = '';
    if (items && items.length > 0) {
      itemsHtml = `
        <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb;">
          <p style="font-weight: 600; margin-top: 0;">Order Items:</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="text-align: left; padding: 8px 0;">Product</th>
                <th style="text-align: center; padding: 8px 0;">Qty</th>
                <th style="text-align: right; padding: 8px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0;">${item.name}</td>
                  <td style="text-align: center; padding: 8px 0;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px 0;">$${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .header {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px;
            background: #fafafa;
            border-radius: 0 0 12px 12px;
          }
          .content h2 {
            margin-top: 0;
            color: #1a1a1a;
            font-size: 22px;
          }
          .content p {
            color: #4a4a4a;
            margin-bottom: 16px;
          }
          .order-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            margin: 16px 0;
          }
          .order-details p {
            margin: 8px 0;
          }
          .order-details .label {
            color: #6b7280;
            font-size: 14px;
          }
          .order-details .value {
            font-weight: 600;
            font-size: 16px;
          }
          .total-box {
            background: #ECFDF5;
            border: 2px solid #10B981;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            margin: 16px 0;
          }
          .total-box .amount {
            font-size: 28px;
            font-weight: 700;
            color: #065F46;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: scale(1.02);
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .status-badge {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 4px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Thank you for your purchase</p>
          </div>
          <div class="content">
            <h2>Thank you, ${name}! 🎉</h2>
            <p>Your order has been confirmed and is being processed.</p>

            <div class="order-details">
              <p><span class="label">Order Number</span><br><span class="value">#${orderNumber}</span></p>
              <p><span class="label">Date</span><br><span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></p>
              <p><span class="label">Status</span><br><span class="status-badge">Confirmed</span></p>
            </div>

            ${itemsHtml}

            <div class="total-box">
              <p style="margin: 0; color: #065F46; font-size: 14px;">Total Amount</p>
              <p class="amount">$${total.toFixed(2)}</p>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderNumber}" class="button">
                View Order Details →
              </a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POS System. All rights reserved.</p>
            <p style="font-size: 12px; color: #9ca3af;">
              This is a confirmation of your recent order.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: `✅ Order #${orderNumber} Confirmed!`,
      html,
    });
  }

  // ==================== TEST EMAIL ====================
  static async sendTestEmail(to: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f6f9fc;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            text-align: center;
          }
          .success {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #10B981;
          }
          .message {
            color: #4a4a4a;
            margin: 16px 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <div class="title">Email Configuration Test</div>
          <div class="message">
            <p>Your Resend email configuration is working perfectly!</p>
            <p style="font-size: 14px; color: #6b7280;">This is a test email from POS System.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POS System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: '✅ POS System - Test Email',
      html,
    });
  }
}