import { getTransporter, getMailUser } from './smtp';
import { wrapEmailBody } from './emailTemplate';

export async function sendOrderConfirmation(email, orderId, total, items) {
  const mailUser = getMailUser();

  const transporter = getTransporter();
  if (!transporter) {
    console.error('[SMTP] Missing credentials for order confirmation.');
    return null;
  }

  try {
    // Verification step
    await transporter.verify();

    // Create order items list for the email
    const itemsList = items
      .map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; color: #333;">${item.product.name} <span style="color: #888; font-size: 12px;">x${item.quantity}</span></td>
          <td style="padding: 10px; text-align: right; color: #333;">Rs.${item.price.toLocaleString()}</td>
        </tr>`
      )
      .join('');

    const emailContent = `
      <p style="text-align: center;">Transaction ID: <strong>#${orderId}</strong></p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">Order Summary</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          ${itemsList}
          <tr>
            <td style="padding: 15px 10px; font-weight: bold; font-size: 16px;">Total</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #F25C2C;">Rs.${total.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p style="text-align: center; color: #666; font-size: 13px;">
        We've received your order and will notify you once it ships. You can view your order details in your dashboard.
      </p>
      <div style="text-align: center;">
        <a href="https://store2u-main.vercel.app/customer/pages/orders" class="button">View My Orders</a>
      </div>
    `;

    const htmlBody = wrapEmailBody('Thank You for Your Order!', emailContent);

    const mailOptions = {
      from: `"Store2U Orders" <${mailUser}>`,
      to: email,
      subject: `Order Confirmation - Order ID #${orderId}`,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Order Confirmation Sent! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[SMTP] FATAL ERROR sending order confirmation:', {
      message: error.message,
      code: error.code
    });
    // Don't throw error to prevent blocking order creation
    return null;
  }
}
