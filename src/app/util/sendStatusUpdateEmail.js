import { getTransporter, getMailUser } from './smtp';

// Function to send email notification when order status is updated
export async function sendStatusUpdateEmail({ email, name, orderId, status }) {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    const mailUser = getMailUser();

    const mailOptions = {
      from: mailUser,
      to: email,
      subject: `Order Status Updated - Order ID #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2>Hello ${name},</h2>
          <p>Your order with ID <strong>#${orderId}</strong> has been updated to <strong>${status.toUpperCase()}</strong>.</p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      `,
    };

    console.log(`[SMTP] Attempting to send status update email to: ${email} for Order #${orderId}`);
    await transporter.sendMail(mailOptions);
    console.log('[SMTP] Status update email sent successfully to', email);
  } catch (error) {
    console.error('[SMTP] Error sending status update email:', error);
  }
}
