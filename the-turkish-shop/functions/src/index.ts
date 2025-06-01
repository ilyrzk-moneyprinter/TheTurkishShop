import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin
admin.initializeApp();

// Email configuration
const RESEND_API_KEY = 're_UBRuxCtM_EXUYqZfcXc4va6o4sbfgQaw4';
const FROM_EMAIL = 'orders@theturkishshop.com';

// One-time setup function to initialize admin and database
export const setupInitialAdmin = functions.https.onCall(async (data, context) => {
  // Only allow this function to be called by authenticated users
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  // Check if the calling user is senpaimc04@gmail.com
  if (context.auth.token.email !== 'senpaimc04@gmail.com') {
    throw new functions.https.HttpsError('permission-denied', 'Only senpaimc04@gmail.com can run initial setup');
  }
  
  try {
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(context.auth.uid, { admin: true });
    
    // Create/update user document with admin role
    await admin.firestore().collection('users').doc(context.auth.uid).set({
      uid: context.auth.uid,
      email: context.auth.token.email,
      displayName: context.auth.token.name || '',
      photoURL: context.auth.token.picture || '',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return { 
      success: true, 
      message: 'Admin setup complete. Please sign out and sign back in for changes to take effect.' 
    };
  } catch (error) {
    console.error('Error setting up admin:', error);
    throw new functions.https.HttpsError('internal', 'Failed to setup admin');
  }
});

// Send email function
export const sendEmail = functions.https.onCall(async (data, context) => {
  const { to, subject, html, text } = data;
  
  if (!to || !subject || (!html && !text)) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Missing required fields: to, subject, and either html or text'
    );
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send email');
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Resend order email function (for admin use)
export const resendOrderEmail = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth || !context.auth.token.admin) {
    const userDoc = await admin.firestore().collection('users').doc(context.auth?.uid || '').get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
  }
  
  const { orderId } = data;
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Order ID is required');
  }
  
  try {
    // Get the order from Firestore
    const orderQuery = await admin.firestore()
      .collection('orders')
      .where('orderID', '==', orderId)
      .limit(1)
      .get();
    
    if (orderQuery.empty) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }
    
    const order = orderQuery.docs[0].data();
    
    // Generate email content based on order status
    let subject = '';
    let html = '';
    
    if (order.status === 'delivered') {
      subject = `Order Delivered - ${order.orderID}`;
      html = `
        <h2>Your order has been delivered!</h2>
        <p>Order ID: ${order.orderID}</p>
        <p>Check your email for delivery details.</p>
      `;
    } else {
      subject = `Order Confirmation - ${order.orderID}`;
      html = `
        <h2>Thank you for your order!</h2>
        <p>Order ID: ${order.orderID}</p>
        <p>Status: ${order.status}</p>
        <p>Total: £${order.totalPrice || order.price}</p>
        <p>We'll update you as soon as your order progresses.</p>
      `;
    }
    
    // Send the email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: order.buyerEmail,
        subject,
        html
      })
    });

    if (!response.ok) {
      throw new functions.https.HttpsError('internal', 'Failed to send email');
    }

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error resending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to resend email');
  }
}); 