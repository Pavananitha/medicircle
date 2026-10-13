import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (config.emailUser && config.emailPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 4000,
        auth: {
          user: config.emailUser,
          pass: config.emailPass,
        },
      });
    }
  }

  async sendPasswordResetOtp(to: string, otp: string, userName?: string): Promise<boolean> {
    // Re-check transporter if env variables were updated dynamically
    if (!this.transporter && config.emailUser && config.emailPass) {
      this.initTransporter();
    }

    if (!this.transporter) {
      console.warn(`[EMAIL] ⚠️ Nodemailer is not configured (EMAIL_USER or EMAIL_PASS missing in server/.env).`);
      console.warn(`[EMAIL] 🔑 Fallback OTP for ${to}: ${otp}`);
      return false;
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0284C7; margin: 0; font-size: 24px;">MediCircle</h2>
          <p style="color: #64748B; margin: 4px 0 0 0; font-size: 14px;">Medication & Healthcare Companion</p>
        </div>
        
        <p style="color: #0F172A; font-size: 16px; margin-bottom: 12px;">Hello ${userName || 'there'},</p>
        <p style="color: #334155; font-size: 14px; line-height: 22px;">
          We received a request to reset the password for your MediCircle account. Use the verification code below to complete your password reset:
        </p>

        <div style="background-color: #EFF6FF; border: 1px dashed #0284C7; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284C7; display: block;">${otp}</span>
          <span style="color: #64748B; font-size: 12px; margin-top: 6px; display: block;">Valid for 15 minutes</span>
        </div>

        <p style="color: #64748B; font-size: 13px; line-height: 20px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} MediCircle. All rights reserved.
        </p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"MediCircle" <${config.emailUser}>`,
        to,
        subject: `Your MediCircle Password Reset Code: ${otp}`,
        text: `Hello, your MediCircle password reset verification code is: ${otp}. It will expire in 15 minutes.`,
        html: htmlContent,
      });

      console.log(`[EMAIL] ✅ Reset OTP successfully sent to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      console.error(`[EMAIL] ❌ Failed to send email to ${to}:`, err.message || err);
      return false;
    }
  }
}

export const emailService = new EmailService();
