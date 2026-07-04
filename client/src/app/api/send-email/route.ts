import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html, secret, smtpUser, smtpPass, smtpHost, smtpPort } = await request.json();

    const expectedSecret = process.env.EMAIL_SECRET || 'kvantum_pos_secret_2026';
    if (secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(smtpPort) || Number(process.env.SMTP_PORT) || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: smtpUser || process.env.SMTP_USER,
        pass: smtpPass || process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: smtpUser || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('SMTP Error in Vercel:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
