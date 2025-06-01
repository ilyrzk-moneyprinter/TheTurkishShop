# The Turkish Shop

A modern e-commerce platform for digital game currencies and gift cards, built with React, TypeScript, Firebase, and Tailwind CSS.

![The Turkish Shop](https://theturkishshop.com/banner.png)

## Features

### Core Features
- 🛒 **Shopping Cart System** - Full cart functionality with persistent storage
- 💳 **Payment Integration** - PayPal and Paysafecard support
- 📦 **Order Management** - Real-time order tracking and queue system
- 🚀 **Express Delivery** - Priority processing for urgent orders
- 🌍 **Multi-Currency Support** - GBP, USD, EUR, CAD, AUD
- 🌓 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive Design** - Mobile-first approach

### Products
- **Game Currencies**: Valorant Points, Apex Coins, FIFA Points, Roblox Robux
- **Subscriptions**: Spotify Premium, Discord Nitro
- **Game Stores**: Steam Games, PlayStation Games
- **Mobile Gaming**: Brawl Stars Gems, Call of Duty Points

### Advanced Features
- 🎟️ **Promo Code System** - Discount codes with usage limits
- 🤖 **Discord Bot Integration** - Order notifications and support
- 📧 **Email Notifications** - Order confirmations and delivery emails
- 🔒 **Security Features** - Input validation, XSS protection, rate limiting
- 📊 **Analytics Integration** - Google Analytics e-commerce tracking
- 🔍 **SEO Optimized** - Meta tags, sitemap, structured data
- 👥 **User Profiles** - Order history and account management
- 🛡️ **Admin Dashboard** - Complete business management interface

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **React Helmet Async** - SEO management

### Backend
- **Firebase** - Authentication, Firestore, Storage
- **Express.js** - API server
- **Resend** - Email service
- **Discord.js** - Discord bot

### Tools & Services
- **Vite** - Build tool
- **ESLint** - Code linting
- **Google Analytics** - Analytics
- **DOMPurify** - XSS protection

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Resend API key (for emails)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/the-turkish-shop.git
cd the-turkish-shop
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```env
# Firebase
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# API
REACT_APP_API_URL=http://localhost:5001

# Email
REACT_APP_RESEND_API_KEY=your-resend-key

# Analytics
REACT_APP_GA_MEASUREMENT_ID=your-ga-id
```

5. Start development servers:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - API Server
cd src/api
node server.js
```

## Project Structure

```
the-turkish-shop/
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── api/
│   │   ├── server.js
│   │   ├── discord-bot.js
│   │   └── routes/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── CurrencyContext.tsx
│   │   └── ThemeContext.tsx
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── orderService.ts
│   │   ├── userService.ts
│   │   └── ...
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── admin/
│   │   └── ...
│   ├── services/
│   │   ├── analyticsService.ts
│   │   ├── emailService.ts
│   │   └── securityService.ts
│   └── App.tsx
├── .env.example
├── package.json
└── README.md
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:e2e     # Run E2E tests

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Type Checking
npm run type-check   # Run TypeScript compiler
```

## Features in Detail

### Order Management
- Real-time order tracking
- Queue position system
- Express vs Standard delivery
- Payment verification workflow
- Delivery proof uploads

### Admin Dashboard
- Revenue analytics
- Order processing
- User management
- Product catalog
- Promo code creation
- Support ticket handling

### Security Features
- Firebase Authentication
- Input sanitization
- XSS protection
- Rate limiting
- CSRF protection
- File upload validation

### Performance Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- CDN integration ready

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Firebase

```bash
# Build
npm run build

# Deploy
firebase deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

- Email: support@theturkishshop.com
- Discord: [Join our server](https://discord.gg/theturkishshop)
- Documentation: [docs.theturkishshop.com](https://docs.theturkishshop.com)

## Acknowledgments

- Built with ❤️ by The Turkish Shop team
- Special thanks to all contributors
- Powered by React and Firebase

---

© 2024 The Turkish Shop. All rights reserved.
