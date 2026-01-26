import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email, token) {
  console.log(`[SMTP] Attempting to send verification email to: ${email}`);

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.titan.email',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      debug: true, // Enable debug output
      logger: true, // Log information to console
    });

    // Detailed verification of the transporter
    await transporter.verify();
    console.log('[SMTP] Transporter is ready and authenticated.');

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.store2u.ca'}/customer/pages/verify?token=${token}`;

    const mailOptions = {
      from: `"Store2U Verification" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Store2U',
      text: `Welcome to Store2U! Please verify your email by clicking: ${verificationUrl}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Welcome to Store2U!</h2>
          <p>Thank you for joining us. Please click the button below to verify your email address and activate your account.</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #F25C2C; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this link: <br/> ${verificationUrl}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Email sent successfully. Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[SMTP] FATAL ERROR sending verification email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error(`SMTP Failure: ${error.message}`);
  }
}
