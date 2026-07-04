import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html, secret, smtpUser, smtpPass, smtpHost, smtpPort } = await request.json();

    

    const port = Number(smtpPort) || Number(process.env.SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465,
      requireTLS: port !== 465,
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
