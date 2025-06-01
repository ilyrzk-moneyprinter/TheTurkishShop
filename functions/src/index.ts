import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize email services
const SENDGRID_API_KEY = functions.config().sendgrid?.key || '';
const RESEND_API_KEY = functions.config().resend?.key || '';

const db = admin.firestore();
const resend = new Resend(RESEND_API_KEY);
sgMail.setApiKey(SENDGRID_API_KEY);

// Types
interface Order {
  orderID: string;
  product: string;
  price: string;
  platform?: string;
  deliveryType: string;
  buyerEmail: string;
  status: string;
  deliveryValue?: string;
  isExpress?: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  deliveredAt?: FirebaseFirestore.Timestamp;
  country?: string;
  notes?: string;
  adminNotes?: string;
  items?: Array<{
    product: string;
    amount: string;
    price: string;
    quantity: number;
  }>;
}

interface EmailLog {
  sentAt: FirebaseFirestore.Timestamp;
  emailType: string;
  success: boolean;
  error?: string;
}

// Email templates for different platforms
const getEmailTemplate = (
  order: Order, 
  deliveryValue: string, 
  platform?: string, 
  deliveryType?: string
): { subject: string; html: string; text: string } => {
  const isPSN = platform?.toLowerCase().includes('playstation') || order.product.toLowerCase().includes('playstation');
  const isSteam = platform?.toLowerCase().includes('steam') || order.product.toLowerCase().includes('steam');
  const isNitro = platform?.toLowerCase().includes('discord') || order.product.toLowerCase().includes('discord');
  const isSpotify = platform?.toLowerCase().includes('spotify') || order.product.toLowerCase().includes('spotify');
  const isRoblox = platform?.toLowerCase().includes('roblox') || order.product.toLowerCase().includes('roblox');
  const isBrawlStars = platform?.toLowerCase().includes('brawl') || order.product.toLowerCase().includes('brawl');
  
  // Email subject
  const subject = `Your Order is Ready: ${order.product} #${order.orderID}`;
  
  // Common header
  const header = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
      <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: #2d3748; margin-bottom: 10px;">Your Order is Ready!</h1>
        <p>Order #: ${order.orderID}</p>
        <p>Product: ${order.product}</p>
        ${order.isExpress ? '<p style="color: #e53e3e; font-weight: bold;">EXPRESS DELIVERY</p>' : ''}
      </div>
  `;
  
  // Common footer
  const footer = `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
        <p>If you have any questions, please contact our support team.</p>
        <p>The Turkish Shop - Premium Digital Products</p>
      </div>
    </div>
  `;
  
  let contentHtml = '';
  let contentText = '';
  
  // Platform-specific content
  if (isPSN) {
    contentHtml = `
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #3182ce;">Your PlayStation Code</h2>
        <div style="background-color: #ebf8ff; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; letter-spacing: 1px; margin: 15px 0; text-align: center;">
          <strong>${deliveryValue}</strong>
        </div>
        
        <h3 style="margin-top: 25px;">How to Redeem Your PSN Code:</h3>
        <ol style="line-height: 1.6;">
          <li>Go to <strong>Settings</strong> → <strong>Users and Accounts</strong> → <strong>Account</strong> → <strong>Redeem Code</strong></li>
          <li>Enter the 12-digit PlayStation Network code shown above</li>
          <li>Confirm to redeem to your account</li>
        </ol>
      </div>
    `;
    
    contentText = `
Your PlayStation Code: ${deliveryValue}

How to Redeem Your PSN Code:
1. Go to Settings → Users and Accounts → Account → Redeem Code
2. Enter the 12-digit PlayStation Network code
3. Confirm to redeem to your account
    `;
  } else if (isSteam) {
    contentHtml = `
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #2b6cb0;">Your Steam Key</h2>
        <div style="background-color: #ebf8ff; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; letter-spacing: 1px; margin: 15px 0; text-align: center;">
          <strong>${deliveryValue}</strong>
        </div>
        
        <h3 style="margin-top: 25px;">How to Redeem Your Steam Key:</h3>
        <ol style="line-height: 1.6;">
          <li>Open Steam and log in to your account</li>
          <li>Click on <strong>Games</strong> in the top menu</li>
          <li>Select <strong>Activate a Product on Steam</strong></li>
          <li>Enter your key when prompted</li>
          <li>Follow the instructions to download and install your game</li>
        </ol>
      </div>
    `;
    
    contentText = `
Your Steam Key: ${deliveryValue}

How to Redeem Your Steam Key:
1. Open Steam and log in to your account
2. Click on Games in the top menu
3. Select Activate a Product on Steam
4. Enter your key when prompted
5. Follow the instructions to download and install your game
    `;
  } else if (isNitro) {
    contentHtml = `
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #5865F2;">Your Discord Nitro Code</h2>
        <div style="background-color: #F6F6FE; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; letter-spacing: 1px; margin: 15px 0; text-align: center;">
          <strong>${deliveryValue}</strong>
        </div>
        
        <h3 style="margin-top: 25px;">How to Redeem Your Discord Nitro:</h3>
        <ol style="line-height: 1.6;">
          <li>Open Discord on your device</li>
          <li>Click on <strong>User Settings</strong> (gear icon)</li>
          <li>Select <strong>Gift Inventory</strong></li>
          <li>Click <strong>Redeem Code</strong></li>
          <li>Enter the code shown above</li>
        </ol>
      </div>
    `;
    
    contentText = `
Your Discord Nitro Code: ${deliveryValue}

How to Redeem Your Discord Nitro:
1. Open Discord on your device
2. Click on User Settings (gear icon)
3. Select Gift Inventory
4. Click Redeem Code
5. Enter the code shown above
    `;
  } else if (isSpotify) {
    // Check if delivery is account credentials or premium code
    if (deliveryType === 'account') {
      // Parse credentials safely (assuming format: username:password)
      const credentials = deliveryValue.split(':');
      const username = credentials[0] || 'provided username';
      const password = credentials[1] || 'provided password';
      
      contentHtml = `
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1DB954;">Your Spotify Premium Account</h2>
          <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <h3 style="margin-top: 25px;">How to Access Your Spotify Premium Account:</h3>
          <ol style="line-height: 1.6;">
            <li>Go to <a href="https://spotify.com/login" style="color: #1DB954;">spotify.com/login</a></li>
            <li>Enter the username and password provided above</li>
            <li>We strongly recommend changing the password after first login</li>
          </ol>
        </div>
      `;
      
      contentText = `
Your Spotify Premium Account:
Username: ${username}
Password: ${password}

How to Access Your Spotify Premium Account:
1. Go to spotify.com/login
2. Enter the username and password provided above
3. We strongly recommend changing the password after first login
      `;
    } else {
      contentHtml = `
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1DB954;">Your Spotify Premium Code</h2>
          <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; letter-spacing: 1px; margin: 15px 0; text-align: center;">
            <strong>${deliveryValue}</strong>
          </div>
          
          <h3 style="margin-top: 25px;">How to Redeem Your Spotify Premium Code:</h3>
          <ol style="line-height: 1.6;">
            <li>Go to <a href="https://spotify.com/redeem" style="color: #1DB954;">spotify.com/redeem</a></li>
            <li>Sign in to your Spotify account</li>
            <li>Enter the redemption code shown above</li>
            <li>Enjoy your Premium membership!</li>
          </ol>
        </div>
      `;
      
      contentText = `
Your Spotify Premium Code: ${deliveryValue}

How to Redeem Your Spotify Premium Code:
1. Go to spotify.com/redeem
2. Sign in to your Spotify account
3. Enter the redemption code shown above
4. Enjoy your Premium membership!
      `;
    }
  } else if (isRoblox || isBrawlStars) {
    // For in-game top-up confirmation
    contentHtml = `
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #4c51bf;">Your ${isRoblox ? 'Roblox' : 'Brawl Stars'} Top-Up Confirmation</h2>
        <div style="background-color: #faf5ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p>Your top-up has been successfully processed!</p>
          <p>Confirmation ID: <strong>${deliveryValue}</strong></p>
          <p>The ${isRoblox ? 'Robux' : 'Gems'} have been added to your account.</p>
        </div>
        
        <h3 style="margin-top: 25px;">Next Steps:</h3>
        <ol style="line-height: 1.6;">
          <li>Launch ${isRoblox ? 'Roblox' : 'Brawl Stars'} on your device</li>
          <li>Log in to your account</li>
          <li>Check your ${isRoblox ? 'Robux' : 'Gems'} balance - it should be updated</li>
          <li>If the balance hasn't updated within 24 hours, please contact our support</li>
        </ol>
      </div>
    `;
    
    contentText = `
Your ${isRoblox ? 'Roblox' : 'Brawl Stars'} Top-Up Confirmation
Confirmation ID: ${deliveryValue}
The ${isRoblox ? 'Robux' : 'Gems'} have been added to your account.

Next Steps:
1. Launch ${isRoblox ? 'Roblox' : 'Brawl Stars'} on your device
2. Log in to your account
3. Check your ${isRoblox ? 'Robux' : 'Gems'} balance - it should be updated
4. If the balance hasn't updated within 24 hours, please contact our support
    `;
  } else {
    // Generic template for other products
    contentHtml = `
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #4c51bf;">Your Order Details</h2>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; letter-spacing: 1px; margin: 15px 0; text-align: center;">
          <strong>${deliveryValue}</strong>
        </div>
        
        <h3 style="margin-top: 25px;">Product Information:</h3>
        <p>We've delivered your order for ${order.product}. Use the code/information above to access your purchase.</p>
        <p>If you need further assistance, please contact our support team with your order number.</p>
      </div>
    `;
    
    contentText = `
Your Order Details for ${order.product}:
${deliveryValue}

If you need further assistance, please contact our support team with your order number.
    `;
  }
  
  return {
    subject,
    html: `${header}${contentHtml}${footer}`,
    text: `Your Order is Ready: ${order.product} #${order.orderID}\n\n${contentText}\n\nThe Turkish Shop - Premium Digital Products`,
  };
};

// Function to send email using SendGrid or Resend
const sendOrderEmail = async (
  email: string, 
  templateData: { subject: string; html: string; text: string }
) => {
  try {
    // Try SendGrid first if configured
    if (SENDGRID_API_KEY) {
      const msg = {
        to: email,
        from: 'orders@theturkishshop.com', // Replace with your verified sender
        subject: templateData.subject,
        text: templateData.text,
        html: templateData.html,
      };
      
      await sgMail.send(msg);
      return { success: true };
    } 
    // Fall back to Resend if configured
    else if (RESEND_API_KEY) {
      try {
        const emailResponse = await resend.emails.send({
          from: 'The Turkish Shop <orders@theturkishshop.com>', // Replace with your domain
          to: [email],
          subject: templateData.subject,
          html: templateData.html,
          text: templateData.text,
        });
        
        if ('error' in emailResponse && emailResponse.error) {
          throw new Error(typeof emailResponse.error === 'object' && emailResponse.error !== null && 'message' in emailResponse.error 
            ? emailResponse.error.message as string 
            : 'Unknown error from Resend');
        }
        
        return { success: true, data: emailResponse };
      } catch (resendError) {
        throw new Error(resendError instanceof Error ? resendError.message : 'Unknown error from Resend');
      }
    } else {
      throw new Error('No email service configured. Please set up SendGrid or Resend API keys.');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
};

// Cloud Function triggered when order status is updated to "delivered"
export const onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data() as Order;
    const afterData = change.after.data() as Order;
    
    // Check if status changed to "delivered" and deliveryValue is set
    if (
      beforeData.status !== 'delivered' && 
      afterData.status === 'delivered' && 
      afterData.deliveryValue
    ) {
      try {
        // Get email template based on platform and delivery type
        const templateData = getEmailTemplate(
          afterData,
          afterData.deliveryValue,
          afterData.platform,
          afterData.deliveryType
        );
        
        // Send email
        const emailResult = await sendOrderEmail(afterData.buyerEmail, templateData);
        
        // Record delivery time
        const deliveredAt = admin.firestore.FieldValue.serverTimestamp();
        
        // Create email log
        const emailLog: EmailLog = {
          sentAt: admin.firestore.Timestamp.now(),
          emailType: 'delivery',
          success: emailResult.success,
        };
        
        if (!emailResult.success && emailResult.error) {
          emailLog.error = emailResult.error;
        }
        
        // Update order with delivered timestamp and email log
        await db.collection('orders').doc(context.params.orderId).update({
          deliveredAt,
          emailLog: admin.firestore.FieldValue.arrayUnion(emailLog)
        });
        
        return { success: true, message: 'Order delivery email sent successfully' };
      } catch (error) {
        console.error('Error in order delivery process:', error);
        return { success: false, error: 'Failed to process order delivery' };
      }
    }
    
    return null;
  });

// Cloud Function to manually resend order delivery email
export const resendOrderEmail = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth || !(context.auth.token.admin === true)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admin users can resend order emails'
    );
  }
  
  const { orderId } = data;
  
  if (!orderId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with an orderId argument'
    );
  }
  
  try {
    // Get order data
    const orderSnapshot = await db.collection('orders').doc(orderId).get();
    
    if (!orderSnapshot.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Order not found'
      );
    }
    
    const orderData = orderSnapshot.data() as Order;
    
    // Check if order has delivery value
    if (!orderData.deliveryValue) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Order does not have delivery value set'
      );
    }
    
    // Get email template
    const templateData = getEmailTemplate(
      orderData,
      orderData.deliveryValue,
      orderData.platform,
      orderData.deliveryType
    );
    
    // Send email
    const emailResult = await sendOrderEmail(orderData.buyerEmail, templateData);
    
    // Create email log
    const emailLog: EmailLog = {
      sentAt: admin.firestore.Timestamp.now(),
      emailType: 'resend',
      success: emailResult.success,
    };
    
    if (!emailResult.success && emailResult.error) {
      emailLog.error = emailResult.error;
    }
    
    // Update order with email log
    await db.collection('orders').doc(orderId).update({
      emailLog: admin.firestore.FieldValue.arrayUnion(emailLog)
    });
    
    return { success: true, message: 'Order email resent successfully' };
  } catch (error) {
    console.error('Error resending order email:', error);
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Unknown error resending email'
    );
  }
}); 