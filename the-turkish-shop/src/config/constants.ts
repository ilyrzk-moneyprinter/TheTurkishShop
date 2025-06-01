// The Turkish Shop Configuration Constants

// Admin Configuration
export const ADMIN_CONFIG = {
  email: 'admin@theturkishshop.com', // Change this to your actual admin email
  notificationEmail: 'support@theturkishshop.com', // Email for receiving support notifications
};

// Support System Configuration
export const SUPPORT_CONFIG = {
  responseTimeHours: '1-3',
  autoResolveInactiveDays: 7,
  maxTicketsPerUser: 5,
};

// Email Configuration
export const EMAIL_CONFIG = {
  fromEmail: 'orders@theturkishshop.com',
  fromName: 'The Turkish Shop',
  replyToEmail: 'support@theturkishshop.com',
};

// Business Hours (for support response times)
export const BUSINESS_HOURS = {
  timezone: 'Europe/London',
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '10:00', close: '16:00' },
  sunday: { open: 'closed', close: 'closed' },
}; 