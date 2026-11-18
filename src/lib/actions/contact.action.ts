'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';
import { Logger } from '@/lib/logger';
import { getUser } from '../auth';

const logger = new Logger('CONTACT');

const contactSchema = z.object({
  category: z.enum(['general', 'billing', 'technical', 'feedback']),
  message: z.string().trim().min(10).max(5000),
});

type ContactData = { category: string; message: string };

export async function sendContactEmail(
  data: ContactData
): Promise<{ success: boolean; message: string }> {
  const parsedData = contactSchema.safeParse(data);
  if (!parsedData.success) {
    return { success: false, message: 'Invalid contact form data.' };
  }

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

  const { category, message } = parsedData.data;
  const mailOptions = {
    from: { name: user.name, address: SMTP_FROM_EMAIL },
    to: CONTACT_FORM_TO_EMAIL,
    subject: `New Contact Form Submission - Category: ${category}`,
    replyTo: { name: user.name, address: user.email },
    text: [
      'New Contact Form Submission',
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `Username: ${user.username}`,
      '',
      `Category: ${category}`,
      '',
      'Message:',
      message,
    ].join('\n'),
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully.' };
  } catch (error) {
    logger.error('Failed to send contact email:', error);
    return { success: false, message: 'Failed to send email.' };
  }
}
