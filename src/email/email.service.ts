import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer'; // Import thêm type để hỗ trợ nhắc lệnh
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  // 1. Khai báo thuộc tính ở đây để TS nhận diện được
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  sendMail = async (to: string, subject: string, html: string): Promise<any> => {
    try {
      const mailOptions = {
        from: `"Hệ Thống" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  };
}

