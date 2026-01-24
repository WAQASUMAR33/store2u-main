// server/api/shipping.js
import { NextResponse } from "next/server";
import prisma from "../../util/prisma";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, orderId, shippingMethod, shippingTerms, shipmentDate, deliveryDate } = await request.json();

    if (!email || !orderId || !shippingMethod || !shippingTerms || !shipmentDate || !deliveryDate) {
      return NextResponse.json({ message: "All fields are required", status: false }, { status: 400 });
    }

    // Ensure orderId is the correct type
    const parsedOrderId = isNaN(orderId) ? orderId : Number(orderId);

    const updatedOrder = await prisma.order.update({
      where: { id: parsedOrderId },
      data: {
        shippingMethod,
        shippingTerms,
        shipmentDate: new Date(shipmentDate),
        deliveryDate: new Date(deliveryDate),
      },
    });

    console.log("The Email is:", email);

    // Send email on status change
    if (updatedOrder) {
      await sendStatusUpdateEmail({
        email,
        orderid: parsedOrderId,
        shippingMethod,
        shippingTerms,
        shipmentDate: formatDate(shipmentDate),
        deliveryDate: formatDate(deliveryDate),
      });
    }

    return NextResponse.json({ message: "Shipping information updated successfully", status: true, data: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error updating shipping information:", error);
    return NextResponse.json({ message: "Failed to update shipping information", status: false }, { status: 500 });
  }
}

// Function to send status update email
async function sendStatusUpdateEmail({ email, orderid, shippingMethod, shippingTerms, shipmentDate, deliveryDate }) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: `Shipment Update - Order ID #${orderid}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f8f8f8;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #007bff;">Shipment Update - Order #${orderid}</h2>
            <p>Dear Customer,</p>
            <p>Your order has been updated with the latest shipping details:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Shipment Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${shipmentDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Delivery Date:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${deliveryDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Shipping Company:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${shippingMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Shipping Details:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${shippingTerms}</td>
              </tr>
            </table>

            <p style="margin-top: 20px;">For more details, you can track your order using the button below:</p>

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://yourwebsite.com/track-order/${orderid}" 
                style="background-color: #007bff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                Track Your Order
              </a>
            </div>

            <p style="margin-top: 20px;">If you have any questions, feel free to reply to this email.</p>
            <p>Thank you for shopping with us!</p>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />

            <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Status update email sent to", email);
  } catch (error) {
    console.error("Error sending status update email:", error);
  }
}

// Function to format date as "Month Day, Year"
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
