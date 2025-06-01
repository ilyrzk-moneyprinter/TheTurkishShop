// Site Configuration File
// Edit this file to change all site settings

export const siteConfig = {
  // Basic Site Information
  siteName: "The Turkish Shop",
  siteUrl: "https://theturkishshop.com",
  supportEmail: "contact@theturkishshop.com",
  legalEmail: "legal@theturkishshop.com",
  
  // Business Hours (GMT+3)
  businessHours: {
    start: "09:00",
    end: "23:00",
    timezone: "GMT+3"
  },

  // Discord Configuration
  discord: {
    inviteLink: "https://discord.gg/theturkishshop",
    username: "theturkishshop",
    botToken: "", // Add your Discord bot token here
    serverId: "", // Add your Discord server ID here
    orderChannelId: "", // Channel ID for order notifications
    supportChannelId: "" // Channel ID for support tickets
  },

  // PayPal Configuration - Rotating Accounts
  paypal: {
    // PayPal accounts will rotate in order
    accounts: [
      {
        email: "account1@example.com",
        link: "https://paypal.me/account1",
        name: "Account 1"
      },
      {
        email: "account2@example.com", 
        link: "https://paypal.me/account2",
        name: "Account 2"
      },
      {
        email: "account3@example.com",
        link: "https://paypal.me/account3",
        name: "Account 3"
      },
      {
        email: "account4@example.com",
        link: "https://paypal.me/account4",
        name: "Account 4"
      },
      {
        email: "account5@example.com",
        link: "https://paypal.me/account5",
        name: "Account 5"
      }
    ],
    // Instructions for customers
    instructions: "IMPORTANT: Send payment as Friends & Family only! Payments sent as Goods & Services will be refunded."
  },

  // Paysafecard Configuration
  paysafecard: {
    enabled: true,
    supportedCountries: [
      'Austria', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Czech Republic',
      'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland',
      'Italy', 'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Portugal',
      'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
      'United Kingdom', 'United States'
    ]
  },

  // Cryptocurrency Configuration
  crypto: {
    enabled: false, // Set to true when ready to enable
    wallets: {
      bitcoin: "",
      ethereum: "",
      usdt: "",
      litecoin: ""
    }
  },

  // Bank Transfer Configuration
  bankTransfer: {
    enabled: false, // Set to true when ready to enable
    banks: [
      {
        name: "",
        accountNumber: "",
        iban: "",
        swift: "",
        accountHolder: ""
      }
    ]
  },

  // Firebase Configuration
  firebase: {
    apiKey: "AIzaSyA_THzJ6K2JmgfQzk6Fxc2oY6337m-9b3w",
    authDomain: "the-turkish-shop.firebaseapp.com",
    projectId: "the-turkish-shop",
    storageBucket: "the-turkish-shop.firebasestorage.app",
    messagingSenderId: "447958991873",
    appId: "1:447958991873:web:28c8b83f53d8018ea5ac00",
    measurementId: "G-REM24ZKRRF"
  },

  // Email Service Configuration (Resend)
  email: {
    resendApiKey: "", // Add your Resend API key
    fromEmail: "noreply@theturkishshop.com",
    orderNotificationEmail: "orders@theturkishshop.com"
  },

  // Currency Configuration
  currency: {
    defaultCurrency: "USD",
    supportedCurrencies: ["USD", "EUR", "GBP", "TRY"],
    exchangeRateApiKey: "" // Add your exchange rate API key if needed
  },

  // Express Delivery Fee
  expressDelivery: {
    fee: 5, // in default currency
    estimatedTime: "5-60 minutes"
  },

  // Order ID Configuration
  orderIdPrefix: "TTS", // Results in order IDs like TTS-ABC123

  // SEO Configuration
  seo: {
    defaultTitle: "The Turkish Shop - Digital Game Currency & Products",
    defaultDescription: "Fast, safe, and affordable game currency and digital products. Valorant Points, Apex Coins, FIFA Points, Spotify Premium, Discord Nitro, and more!",
    keywords: "game currency, valorant points, apex coins, fifa points, spotify premium, discord nitro, digital products, game top up"
  },

  // Google Analytics
  googleAnalytics: {
    trackingId: "" // Add your GA tracking ID (e.g., G-XXXXXXXXXX)
  },

  // Social Media Links
  socialMedia: {
    twitter: "",
    instagram: "",
    youtube: "",
    tiktok: ""
  },

  // API Configuration
  api: {
    baseUrl: process.env.NODE_ENV === 'production' ? 'https://api.theturkishshop.com' : 'http://localhost:5001',
    steamApiKey: "", // For fetching Steam game prices
    playstationApiKey: "" // If available
  },

  // Feature Flags
  features: {
    liveChat: true,
    promoCodesEnabled: true,
    reviewsEnabled: true,
    expressDeliveryEnabled: true,
    multiCurrencyEnabled: true,
    emailNotificationsEnabled: true,
    discordBotEnabled: true,
    maintenanceMode: false
  },

  // Maintenance Mode Settings
  maintenance: {
    message: "We're currently performing maintenance. We'll be back shortly!",
    estimatedEndTime: ""
  },

  // Rate Limiting
  rateLimiting: {
    maxOrdersPerHour: 10,
    maxLoginAttemptsPerHour: 5,
    maxApiRequestsPerMinute: 60
  },

  // Admin Configuration
  admin: {
    emails: ["admin@theturkishshop.com"], // List of admin emails
    requireEmailVerification: true,
    require2FA: false
  },

  // Product-Specific Settings
  products: {
    valorant: {
      regions: ["TR", "EU", "NA"],
      deliveryTime: "5-30 minutes"
    },
    spotify: {
      plans: ["1 Month", "3 Months", "6 Months", "12 Months"],
      accountTypes: ["Fresh Account", "Upgrade Existing"]
    },
    discord: {
      types: ["Classic", "Nitro"],
      durations: ["1 Month", "3 Months", "12 Months"]
    }
  },

  // Legal Pages
  legal: {
    termsLastUpdated: new Date().toISOString(),
    privacyLastUpdated: new Date().toISOString(),
    refundPolicyLastUpdated: new Date().toISOString()
  }
};

// PayPal Account Rotation Logic
let currentPayPalIndex = 0;

export const getNextPayPalAccount = () => {
  const account = siteConfig.paypal.accounts[currentPayPalIndex];
  currentPayPalIndex = (currentPayPalIndex + 1) % siteConfig.paypal.accounts.length;
  return account;
};

// Get current PayPal account without rotating
export const getCurrentPayPalAccount = () => {
  return siteConfig.paypal.accounts[currentPayPalIndex];
};

// Validate configuration
export const validateConfig = () => {
  const errors: string[] = [];

  // Check PayPal accounts
  if (siteConfig.paypal.accounts.length === 0) {
    errors.push("No PayPal accounts configured");
  }

  siteConfig.paypal.accounts.forEach((account, index) => {
    if (!account.email || !account.link) {
      errors.push(`PayPal account ${index + 1} is missing email or link`);
    }
  });

  // Check Firebase config
  if (!siteConfig.firebase.apiKey || !siteConfig.firebase.projectId) {
    errors.push("Firebase configuration is incomplete");
  }

  // Check email config
  if (siteConfig.features.emailNotificationsEnabled && !siteConfig.email.resendApiKey) {
    errors.push("Email notifications are enabled but Resend API key is missing");
  }

  return errors;
};

export default siteConfig; 