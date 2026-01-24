import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT), // Ensure the port is a number
  secure: process.env.NODE_ENV !== 'development', // Use secure in non-development environments
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
} as SMTPTransport.Options);

type SendEmailDto = {
  sender: string; // Change from Mail.Address to string
  recipients: string | string[]; // Nodemailer accepts string or array of strings for multiple recipients
  subject: string; // Use lowercase `string` for TypeScript primitive types
  message: string; // Use lowercase `string` for TypeScript primitive types
};

export const sendEmail = async (dto: SendEmailDto) => {
  const { sender, recipients, subject, message } = dto;

  return await transport.sendMail({
    from: sender, // Sender's email address
    to: recipients, // Recipients' email address or array of addresses
    subject, // Email subject
    html: message, // HTML message body
    text: message, // Plain text message body (optional, fallback for non-HTML clients)
  });
};
