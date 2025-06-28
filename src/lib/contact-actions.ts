'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';
import { Logger } from '@/lib/logger';
import { getUser } from './auth';

const logger = new Logger('CONTACT');

const contactSchema = z.object({
  category: z.string(),
  message: z.string(),
});

type ContactData = z.infer<typeof contactSchema>;

export async function sendContactEmail(
  data: ContactData
): Promise<{ success: boolean; message: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, message: 'Not authenticated' };
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM_EMAIL,
    CONTACT_FORM_TO_EMAIL,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !SMTP_FROM_EMAIL ||
    !CONTACT_FORM_TO_EMAIL
  ) {
    logger.error('SMTP configuration is missing from environment variables.');
    return { success: false, message: 'Server configuration error.' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${user.name}" <${SMTP_FROM_EMAIL}>`,
    to: CONTACT_FORM_TO_EMAIL,
    subject: `New Contact Form Submission - Category: ${data.category}`,
    replyTo: user.email,
    html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Username:</strong> ${user.username}</p>
        <hr>
        <h2>Message Details</h2>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${data.message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully.' };
  } catch (error) {
    logger.error('Failed to send contact email:', error);
    return { success: false, message: 'Failed to send email.' };
  }
}
