import { getTransporter, getMailUser } from './smtp';

export async function sendVerificationEmail(email, token) {
  const mailUser = getMailUser();
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.store2u.ca';

  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('SMTP Configuration Error: Missing credentials');
  }

  try {
    // Verification step
    await transporter.verify();

    const verificationUrl = `${baseUrl}/customer/pages/verify?token=${token}`;

    const mailOptions = {
      from: `"Store2U Info" <${mailUser}>`,
      to: email,
      subject: 'Verify Your Email - Store2U',
      text: `Welcome to Store2U! Please verify your email by clicking: ${verificationUrl}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #F25C2C;">Welcome to Store2U!</h2>
          <p>Thank you for joining us. Please click the button below to verify your email address and activate your account.</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #F25C2C; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this link: <br/> <a href="${verificationUrl}">${verificationUrl}</a></p>
          <br/>
          <p>Best regards,<br/>Store2U Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Success! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[SMTP] FATAL ERROR:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    throw error;
  }
}
