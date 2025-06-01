import { Order } from '../firebase/types';
import { Timestamp } from 'firebase/firestore';

const FROM_EMAIL = 'orders@theturkishshop.com';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const generateOrderConfirmationEmail = (order: Order, customerEmail: string): EmailTemplate => {
  const createdAt = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
  const orderDate = createdAt.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Turkish Shop</h1>
        <p style="margin: 10px 0 0 0;">Order Confirmation</p>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Thank you for your order!</h2>
        <p style="color: #666;">Hi there,</p>
        <p style="color: #666;">We've received your order and will begin processing it shortly.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${order.orderID}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <h4 style="color: #333;">Items:</h4>
          ${order.items?.map(item => `
            <div style="margin-bottom: 10px;">
              <strong>${item.product}</strong><br>
              Amount: ${item.amount} x ${item.quantity}<br>
              Price: £${item.price}
            </div>
          `).join('') || `
            <div>
              <strong>${order.product}</strong><br>
              Amount: ${order.tier}<br>
              Price: £${order.price}
            </div>
          `}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="font-size: 18px; color: #333;"><strong>Total: £${order.totalPrice || order.price}</strong></p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #856404; margin: 0;">
            <strong>Payment Method:</strong> ${order.paymentMethod}<br>
            ${order.paymentMethod === 'PayPal' ? 'Please ensure you have sent the payment as Friends & Family to avoid delays.' : ''}
          </p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <ol style="color: #666; line-height: 1.8;">
            <li>We'll verify your payment (usually within 30 minutes)</li>
            <li>Once confirmed, we'll process your order</li>
            <li>You'll receive your ${order.deliveryMethod === 'code' ? 'code' : 'delivery'} via email</li>
            <li>Delivery time: ${order.deliveryType === 'Express' ? '5-60 minutes' : '1-3 days'}</li>
          </ol>
        </div>
        
        <p style="color: #666; margin-top: 30px;">
          If you have any questions, please don't hesitate to contact our support team.
        </p>
        
        <p style="color: #666;">
          Best regards,<br>
          The Turkish Shop Team
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 The Turkish Shop. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This email was sent to ${customerEmail}</p>
      </div>
    </div>
  `;

  const text = `
The Turkish Shop - Order Confirmation

Thank you for your order!

Order Details:
Order ID: ${order.orderID}
Date: ${orderDate}
Status: ${order.status}

Items:
${order.items?.map(item => `${item.product} - ${item.amount} x ${item.quantity} - £${item.price}`).join('\n') || `${order.product} - ${order.tier} - £${order.price}`}

Total: £${order.totalPrice || order.price}

Payment Method: ${order.paymentMethod}

What's Next?
1. We'll verify your payment (usually within 30 minutes)
2. Once confirmed, we'll process your order
3. You'll receive your ${order.deliveryMethod === 'code' ? 'code' : 'delivery'} via email
4. Delivery time: ${order.deliveryType === 'Express' ? '5-60 minutes' : '1-3 days'}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The Turkish Shop Team
  `;

  return {
    subject: `Order Confirmation - ${order.orderID}`,
    html,
    text
  };
};

export const generateOrderDeliveredEmail = (order: Order, customerEmail: string, deliveryContent: string): EmailTemplate => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Order Delivered! 🎉</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Your order has been delivered!</h2>
        <p style="color: #666;">Order ID: <strong>${order.orderID}</strong></p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Delivery Details</h3>
          ${deliveryContent}
        </div>
        
        <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #155724; margin: 0;">
            <strong>Important:</strong> Please save this information securely. 
            We recommend redeeming your purchase as soon as possible.
          </p>
        </div>
        
        <p style="color: #666;">
          Thank you for choosing The Turkish Shop!<br>
          If you have any issues, please contact our support team immediately.
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 The Turkish Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
Order Delivered! 🎉

Your order has been delivered!
Order ID: ${order.orderID}

Delivery Details:
${deliveryContent.replace(/<[^>]*>/g, '')} // Strip HTML tags

Important: Please save this information securely. We recommend redeeming your purchase as soon as possible.

Thank you for choosing The Turkish Shop!
If you have any issues, please contact our support team immediately.
  `;

  return {
    subject: `Order Delivered - ${order.orderID}`,
    html,
    text
  };
};

export const sendEmail = async (to: string, template: EmailTemplate): Promise<boolean> => {
  try {
    // Try API server first
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
    console.log(`Sending email via API at ${apiUrl}/api/email/send`);
    
    try {
      const response = await fetch(`${apiUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Email sent successfully via API server', result);
        return true;
      }
      
      console.error('Failed to send email via API server:', result.error || 'Unknown error');
      if (!result.success) {
        throw new Error(result.error || 'API server returned unsuccessful response');
      }
    } catch (apiError) {
      console.error('API server request failed:', apiError);
      console.log('Falling back to direct Resend API call');
    }
    
    // Fallback to direct Resend API call if API server fails
    const RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured for direct API access');
      return false;
    }
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Failed to send email via Resend API:', error);
      return false;
    }
    
    console.log('Email sent successfully via Resend API');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendOrderConfirmation = async (order: Order): Promise<boolean> => {
  const template = generateOrderConfirmationEmail(order, order.buyerEmail);
  return sendEmail(order.buyerEmail, template);
};

export const sendOrderDelivered = async (order: Order, deliveryContent: string): Promise<boolean> => {
  const template = generateOrderDeliveredEmail(order, order.buyerEmail, deliveryContent);
  return sendEmail(order.buyerEmail, template);
};

// Generate order in progress email template
export const generateOrderInProgressEmail = (order: Order, customerEmail: string): EmailTemplate => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Order In Progress 🚀</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Great news! We're processing your order</h2>
        <p style="color: #666;">Order ID: <strong>${order.orderID}</strong></p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's happening?</h3>
          <p style="color: #666;">Your payment has been confirmed and we're now actively processing your order.</p>
          
          <div style="margin: 20px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0;">
              <span style="color: #28a745;">✓ Payment Confirmed</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0;">
              <span style="color: #007bff; font-weight: bold;">→ Processing Order</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0;">
              <span style="color: #999;">⌛ Delivery</span>
            </div>
          </div>
        </div>
        
        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #0c5460; margin: 0;">
            <strong>Expected delivery time:</strong><br>
            ${order.deliveryType === 'Express' ? '5-60 minutes' : '1-3 business days'}
          </p>
        </div>
        
        <p style="color: #666;">
          We'll notify you as soon as your order is ready for delivery.
        </p>
        
        <p style="color: #666;">
          Best regards,<br>
          The Turkish Shop Team
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 The Turkish Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
Order In Progress 🚀

Great news! We're processing your order
Order ID: ${order.orderID}

What's happening?
Your payment has been confirmed and we're now actively processing your order.

✓ Payment Confirmed
→ Processing Order
⌛ Delivery

Expected delivery time:
${order.deliveryType === 'Express' ? '5-60 minutes' : '1-3 business days'}

We'll notify you as soon as your order is ready for delivery.

Best regards,
The Turkish Shop Team
  `;

  return {
    subject: `Order In Progress - ${order.orderID}`,
    html,
    text
  };
};

// Generate order cancelled email template
export const generateOrderCancelledEmail = (order: Order, customerEmail: string, reason?: string): EmailTemplate => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Order Cancelled</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Your order has been cancelled</h2>
        <p style="color: #666;">Order ID: <strong>${order.orderID}</strong></p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Cancellation Details</h3>
          <p style="color: #666;">We've cancelled your order as requested or due to an issue with processing.</p>
          ${reason ? `<p style="color: #666;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #721c24; margin: 0;">
            <strong>Refund Information:</strong><br>
            If you've already made a payment, our support team will contact you regarding the refund process within 24 hours.
          </p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Need Help?</h3>
          <p style="color: #666;">
            If you have any questions about this cancellation or would like to place a new order, 
            please don't hesitate to contact our support team.
          </p>
        </div>
        
        <p style="color: #666;">
          We apologize for any inconvenience caused.
        </p>
        
        <p style="color: #666;">
          Best regards,<br>
          The Turkish Shop Team
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 The Turkish Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
Order Cancelled

Your order has been cancelled
Order ID: ${order.orderID}

Cancellation Details:
We've cancelled your order as requested or due to an issue with processing.
${reason ? `Reason: ${reason}` : ''}

Refund Information:
If you've already made a payment, our support team will contact you regarding the refund process within 24 hours.

Need Help?
If you have any questions about this cancellation or would like to place a new order, please don't hesitate to contact our support team.

We apologize for any inconvenience caused.

Best regards,
The Turkish Shop Team
  `;

  return {
    subject: `Order Cancelled - ${order.orderID}`,
    html,
    text
  };
};

// Generate order delayed email template
export const generateOrderDelayedEmail = (order: Order, customerEmail: string, estimatedTime?: string): EmailTemplate => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ffc107; color: #333; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Order Delayed ⏰</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Your order is taking longer than expected</h2>
        <p style="color: #666;">Order ID: <strong>${order.orderID}</strong></p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's happening?</h3>
          <p style="color: #666;">
            We're experiencing a slight delay with your order. This can happen due to:
          </p>
          <ul style="color: #666;">
            <li>High order volume</li>
            <li>Payment verification requirements</li>
            <li>Product availability checks</li>
            <li>Technical issues</li>
          </ul>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #856404; margin: 0;">
            <strong>New estimated delivery time:</strong><br>
            ${estimatedTime || 'We\'ll update you within the next 2-4 hours'}
          </p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What we're doing</h3>
          <p style="color: #666;">
            Our team is actively working to resolve this delay and deliver your order as soon as possible. 
            We appreciate your patience and understanding.
          </p>
        </div>
        
        <p style="color: #666;">
          If you have urgent concerns, please contact our support team.
        </p>
        
        <p style="color: #666;">
          Best regards,<br>
          The Turkish Shop Team
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 The Turkish Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
Order Delayed ⏰

Your order is taking longer than expected
Order ID: ${order.orderID}

What's happening?
We're experiencing a slight delay with your order. This can happen due to:
• High order volume
• Payment verification requirements
• Product availability checks
• Technical issues

New estimated delivery time:
${estimatedTime || 'We\'ll update you within the next 2-4 hours'}

What we're doing:
Our team is actively working to resolve this delay and deliver your order as soon as possible. We appreciate your patience and understanding.

If you have urgent concerns, please contact our support team.

Best regards,
The Turkish Shop Team
  `;

  return {
    subject: `Order Update: Delay Notice - ${order.orderID}`,
    html,
    text
  };
};

// Send order status update emails
export const sendOrderInProgress = async (order: Order): Promise<boolean> => {
  const template = generateOrderInProgressEmail(order, order.buyerEmail);
  return sendEmail(order.buyerEmail, template);
};

export const sendOrderCancelled = async (order: Order, reason?: string): Promise<boolean> => {
  const template = generateOrderCancelledEmail(order, order.buyerEmail, reason);
  return sendEmail(order.buyerEmail, template);
};

export const sendOrderDelayed = async (order: Order, estimatedTime?: string): Promise<boolean> => {
  const template = generateOrderDelayedEmail(order, order.buyerEmail, estimatedTime);
  return sendEmail(order.buyerEmail, template);
};

// Generate support ticket reply email template
export const generateSupportReplyEmail = (
  ticketSubject: string,
  customerName: string,
  adminReply: string,
  ticketId: string,
  ticketStatus: string
): EmailTemplate => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Turkish Shop</h1>
        <p style="margin: 10px 0 0 0;">Support Team Response</p>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">We've responded to your support request</h2>
        <p style="color: #666;">Hi ${customerName},</p>
        <p style="color: #666;">Our support team has responded to your request.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Ticket Details</h3>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Status:</strong> <span style="color: ${ticketStatus === 'resolved' ? '#28a745' : '#007bff'};">${ticketStatus === 'inProgress' ? 'In Progress' : ticketStatus.charAt(0).toUpperCase() + ticketStatus.slice(1)}</span></p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Support Team Response:</h3>
          <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; margin: 10px 0;">
            <p style="color: #333; margin: 0; white-space: pre-wrap;">${adminReply}</p>
          </div>
        </div>
        
        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #0c5460; margin: 0;">
            <strong>Need to respond?</strong><br>
            You can reply to this email or visit our help center to continue the conversation.
          </p>
        </div>
        
        <p style="color: #666; margin-top: 30px;">
          We're here to help! If you need further assistance, don't hesitate to reach out.
        </p>
        
        <p style="color: #666;">
          Best regards,<br>
          The Turkish Shop Support Team
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 The Turkish Shop. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated response from our support system.</p>
      </div>
    </div>
  `;

  const text = `
The Turkish Shop - Support Team Response

Hi ${customerName},

Our support team has responded to your request.

Ticket Details:
Subject: ${ticketSubject}
Ticket ID: ${ticketId}
Status: ${ticketStatus === 'inProgress' ? 'In Progress' : ticketStatus.charAt(0).toUpperCase() + ticketStatus.slice(1)}

Support Team Response:
${adminReply}

Need to respond?
You can reply to this email or visit our help center to continue the conversation.

We're here to help! If you need further assistance, don't hesitate to reach out.

Best regards,
The Turkish Shop Support Team
  `;

  return {
    subject: `Support Response: ${ticketSubject}`,
    html,
    text
  };
};

// Send support reply email
export const sendSupportReplyEmail = async (
  customerEmail: string,
  ticketSubject: string,
  customerName: string,
  adminReply: string,
  ticketId: string,
  ticketStatus: string
): Promise<boolean> => {
  const template = generateSupportReplyEmail(
    ticketSubject,
    customerName,
    adminReply,
    ticketId,
    ticketStatus
  );
  return sendEmail(customerEmail, template);
};

// Generate new support request confirmation email for customer
export const generateSupportRequestConfirmationEmail = (
  customerName: string,
  ticketSubject: string,
  ticketId: string,
  ticketMessage: string
): EmailTemplate => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Turkish Shop</h1>
        <p style="margin: 10px 0 0 0;">Support Request Received</p>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">We've received your support request</h2>
        <p style="color: #666;">Hi ${customerName},</p>
        <p style="color: #666;">Thank you for contacting us. Our support team will review your request and respond as soon as possible.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Request Details</h3>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Your Message:</strong></p>
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
            <p style="color: #666; margin: 0; white-space: pre-wrap;">${ticketMessage}</p>
          </div>
        </div>
        
        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #0c5460; margin: 0;">
            <strong>What happens next?</strong><br>
            • Our support team will review your request<br>
            • You'll receive an email when we respond<br>
            • Typical response time: 1-3 hours during business hours
          </p>
        </div>
        
        <p style="color: #666;">
          Best regards,<br>
          The Turkish Shop Support Team
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2024 The Turkish Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
The Turkish Shop - Support Request Received

Hi ${customerName},

Thank you for contacting us. Our support team will review your request and respond as soon as possible.

Request Details:
Ticket ID: ${ticketId}
Subject: ${ticketSubject}

Your Message:
${ticketMessage}

What happens next?
• Our support team will review your request
• You'll receive an email when we respond
• Typical response time: 1-3 hours during business hours

Best regards,
The Turkish Shop Support Team
  `;

  return {
    subject: `Support Request Received: ${ticketSubject}`,
    html,
    text
  };
};

// Generate admin notification email for new support requests
export const generateAdminSupportNotificationEmail = (
  customerName: string,
  customerEmail: string,
  ticketSubject: string,
  ticketId: string,
  ticketMessage: string
): EmailTemplate => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ff6b6b; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">New Support Request</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Action Required: New Support Ticket</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Message:</strong></p>
          <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #ff6b6b; margin: 10px 0;">
            <p style="color: #333; margin: 0; white-space: pre-wrap;">${ticketMessage}</p>
          </div>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #856404; margin: 0;">
            <strong>⚡ Action Required:</strong><br>
            Please log into the admin dashboard to respond to this support request.
          </p>
        </div>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">This is an automated admin notification from The Turkish Shop</p>
      </div>
    </div>
  `;

  const text = `
New Support Request - Action Required

Customer Information:
Name: ${customerName}
Email: ${customerEmail}

Ticket Details:
Ticket ID: ${ticketId}
Subject: ${ticketSubject}

Message:
${ticketMessage}

⚡ Action Required:
Please log into the admin dashboard to respond to this support request.

This is an automated admin notification from The Turkish Shop
  `;

  return {
    subject: `[URGENT] New Support Request: ${ticketSubject}`,
    html,
    text
  };
};

// Send support request confirmation to customer
export const sendSupportRequestConfirmation = async (
  customerEmail: string,
  customerName: string,
  ticketSubject: string,
  ticketId: string,
  ticketMessage: string
): Promise<boolean> => {
  const template = generateSupportRequestConfirmationEmail(
    customerName,
    ticketSubject,
    ticketId,
    ticketMessage
  );
  return sendEmail(customerEmail, template);
};

// Send new support request notification to admin
export const sendAdminSupportNotification = async (
  adminEmail: string,
  customerName: string,
  customerEmail: string,
  ticketSubject: string,
  ticketId: string,
  ticketMessage: string
): Promise<boolean> => {
  const template = generateAdminSupportNotificationEmail(
    customerName,
    customerEmail,
    ticketSubject,
    ticketId,
    ticketMessage
  );
  return sendEmail(adminEmail, template);
};

export const sendOrderStatusUpdate = async (
  order: Order, 
  status: string, 
  message?: string
): Promise<boolean> => {
  try {
    // Get the email address from the order
    const customerEmail = order.buyerEmail;
    if (!order || !customerEmail) {
      console.error('Cannot send status update - missing order details or customer email');
      return false;
    }

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
    const response = await fetch(`${apiUrl}/api/email/order-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order,
        customerEmail,
        // No customerName in Order type, so we'll leave it empty
        customerName: '',
        status,
        message: message || `Your order is now ${status}.`
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`Order ${status} notification sent successfully`, result);
      return true;
    } else {
      console.error(`Failed to send ${status} notification:`, result.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error(`Error sending ${status} notification:`, error);
    return false;
  }
}; 