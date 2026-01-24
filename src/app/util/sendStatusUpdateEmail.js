import nodemailer from 'nodemailer';

// Function to send email notification when order status is updated
export async function sendStatusUpdateEmail({ email, name, orderId, status }) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.titan.email', // Hostinger's SMTP server
            port: 465, // Secure port for SMTP over SSL
            secure: true, // Use SSL
            auth: {
                user: process.env.MAIL_USER, // Your Hostinger email address
                pass: process.env.MAIL_PASSWORD, // Your Hostinger email password
            },
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
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

        await transporter.sendMail(mailOptions);
        console.log('Status update email sent to', email);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
}
