// Google Analytics Service for The Turkish Shop

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initializeGA = (measurementId: string) => {
  // Add Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (path?: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID || '', {
      page_path: path || window.location.pathname,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// E-commerce tracking
export const trackPurchase = (orderData: {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'purchase', {
      transaction_id: orderData.transactionId,
      value: orderData.value,
      currency: orderData.currency,
      items: orderData.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }
};

// Track add to cart
export const trackAddToCart = (item: {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  currency: string;
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'add_to_cart', {
      currency: item.currency,
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      }],
    });
  }
};

// Track remove from cart
export const trackRemoveFromCart = (item: {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  currency: string;
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'remove_from_cart', {
      currency: item.currency,
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      }],
    });
  }
};

// Track begin checkout
export const trackBeginCheckout = (data: {
  value: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'begin_checkout', {
      value: data.value,
      currency: data.currency,
      items: data.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  }
};

// Track user registration
export const trackSignUp = (method: string = 'email') => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'sign_up', {
      method: method,
    });
  }
};

// Track user login
export const trackLogin = (method: string = 'email') => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'login', {
      method: method,
    });
  }
};

// Track search
export const trackSearch = (searchTerm: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }
};

// Track view item
export const trackViewItem = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'view_item', {
      currency: item.currency,
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
      }],
    });
  }
};

// Track promo code usage
export const trackPromoCode = (promoCode: string, discount: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'use_promo_code', {
      event_category: 'engagement',
      event_label: promoCode,
      value: discount,
    });
  }
};

// Track order status check
export const trackOrderStatusCheck = (orderId: string, status: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'check_order_status', {
      event_category: 'engagement',
      event_label: status,
      order_id: orderId,
    });
  }
};

// Track support ticket creation
export const trackSupportTicket = (category: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'create_support_ticket', {
      event_category: 'support',
      event_label: category,
    });
  }
};

// Track social media clicks
export const trackSocialClick = (platform: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'social_click', {
      event_category: 'social',
      event_label: platform,
    });
  }
};

// Track currency change
export const trackCurrencyChange = (from: string, to: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'currency_change', {
      event_category: 'settings',
      event_label: `${from}_to_${to}`,
    });
  }
};

// Track delivery type selection
export const trackDeliveryType = (type: 'Standard' | 'Express') => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'select_delivery_type', {
      event_category: 'checkout',
      event_label: type,
    });
  }
};

// Track payment method selection
export const trackPaymentMethod = (method: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'select_payment_method', {
      event_category: 'checkout',
      event_label: method,
    });
  }
};

// Export all analytics functions
export default {
  initializeGA,
  trackPageView,
  trackEvent,
  trackPurchase,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackSignUp,
  trackLogin,
  trackSearch,
  trackViewItem,
  trackPromoCode,
  trackOrderStatusCheck,
  trackSupportTicket,
  trackSocialClick,
  trackCurrencyChange,
  trackDeliveryType,
  trackPaymentMethod,
}; 