import { getTransporter, getMailUser } from './smtp';

export async function sendResetPasswordEmail(email, token) {
  try {
    const transporter = getTransporter();
    if (!transporter) throw new Error('SMTP Configuration Error');

    const mailUser = getMailUser();

    const mailOptions = {
      from: mailUser,
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Please reset your password by clicking the following link: ${process.env.BASE_URL}/customer/pages/reset?token=${token}`,
      html: `<p>You requested a password reset. Please reset your password by clicking the following link: <a href="${process.env.BASE_URL}/customer/pages/reset?token=${token}">Reset Password</a></p>`,
    };

    const ok = await transporter.sendMail(mailOptions);
    const result = ok.response;
    console.log("Response is : ", ok, "And result is : ", result);
    console.log('Password reset email sent successfully to ', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
