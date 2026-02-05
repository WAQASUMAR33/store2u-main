import nodemailer from 'nodemailer';

export async function sendOrderConfirmation(email, orderId, total, items) {
  // Use either MAIL_USER or EMAIL_USERNAME as fallback
  const mailUser = process.env.MAIL_USER || process.env.EMAIL_USERNAME;
  const mailPass = process.env.MAIL_PASSWORD || process.env.EMAIL_PASSWORD;
  const mailHost = process.env.MAIL_HOST || 'smtp.titan.email';
  const mailPort = parseInt(process.env.MAIL_PORT || '465', 10);

  console.log(`[SMTP] Configuration Check:`);
  console.log(`  - Host: ${mailHost}`);
  console.log(`  - Port: ${mailPort}`);
  console.log(`  - User: ${mailUser ? mailUser : 'UNDEFINED'}`);
  console.log(`  - Pass: ${mailPass ? '******' : 'UNDEFINED'}`);

  if (!mailUser || !mailPass) {
    console.error('[SMTP] Missing credentials! MAIL_USER or MAIL_PASSWORD not set.');
    throw new Error('SMTP Configuration Error: Missing credentials');
  }

  try {
    const transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465, // true for 465, false for 587
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verification step
    await transporter.verify();

    // Create order items list for the email
    const itemsList = items
      .map(item => `
        <li style="margin-bottom: 10px;">
          <strong>${item.quantity}x</strong> ${item.product.name} 
          <br/>
          <span style="color: #666; font-size: 12px;">Price: Rs.${item.price.toLocaleString()}</span>
        </li>`
      )
      .join('');

    const mailOptions = {
      from: `"Store2U Orders" <${mailUser}>`,
      to: email,
      subject: `Order Confirmation - Order ID #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #F25C2C; text-align: center;">Thank you for your order!</h2>
          <p style="text-align: center; font-size: 16px;">Your order ID is: <strong style="color: #000;">#${orderId}</strong></p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h3 style="color: #333;">Order Summary</h3>
          <ul style="list-style-type: none; padding: 0;">${itemsList}</ul>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <p style="font-size: 18px; font-weight: bold; text-align: right;">Total Amount: <span style="color: #F25C2C;">Rs.${total.toLocaleString()}</span></p>
          
          <p style="text-align: center; color: #777; font-size: 12px; margin-top: 30px;">
            We will notify you once your order has been shipped.
          </p>
        </div>
      `,
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
