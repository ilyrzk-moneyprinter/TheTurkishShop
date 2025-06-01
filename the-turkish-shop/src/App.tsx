import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LiveChatBubble from './components/LiveChatBubble';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import SpotifyPremiumPage from './pages/products/SpotifyPremiumPage';
import DiscordNitroPage from './pages/products/DiscordNitroPage';
import SteamGamesPage from './pages/products/SteamGamesPage';
import PlayStationGamesPage from './pages/products/PlayStationGamesPage';
import RobuxPage from './pages/products/RobuxPage';
import ValorantPage from './pages/products/ValorantPage';
import FortnitePage from './pages/products/FortnitePage';
import CallOfDutyPage from './pages/products/CallOfDutyPage';
import FIFAPage from './pages/products/FIFAPage';
import RainbowSixPage from './pages/products/RainbowSixPage';
import BrawlStarsPage from './pages/products/BrawlStarsPage';
import ApexLegendsPage from './pages/products/ApexLegendsPage';
import GenericProductPage from './pages/products/GenericProductPage';
import VouchesPage from './pages/VouchesPage';
import HelpPage from './pages/HelpPage';
import HowToReceivePage from './pages/HowToReceivePage';
import HowLongItTakesPage from './pages/HowLongItTakesPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import CartPage from './pages/CartPage';
import OrderStatusPage from './pages/OrderStatusPage';
import CreateOrderPage from './pages/CreateOrderPage';
import UserDashboardPage from './pages/UserDashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import UserProfilePage from './pages/UserProfilePage';

// Admin pages
import OrderManagementPage from './pages/admin/OrderManagementPage';
import EnhancedOrderManagementPage from './pages/admin/EnhancedOrderManagementPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import EnhancedProductManagementPage from './pages/admin/EnhancedProductManagementPage';
import VouchManagementPage from './pages/admin/VouchManagementPage';
import HelpManagementPage from './pages/admin/HelpManagementPage';
import GamePriceManagementPage from './pages/admin/GamePriceManagementPage';
import PromoCodeManagementPage from './pages/admin/PromoCodeManagementPage';
import DatabaseInitPage from './pages/admin/DatabaseInitPage';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import CurrencyProvider from './contexts/CurrencyContext';

// Protected route component that requires authentication
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

// Admin route component that requires admin role
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Inner app component that can use the theme
function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-primary text-textLight' : 'bg-primary text-textDark'}`}>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/valorant-points" element={<ValorantPage />} />
            <Route path="/products/fortnite-v-bucks" element={<FortnitePage />} />
            <Route path="/products/call-of-duty-points" element={<CallOfDutyPage />} />
            <Route path="/products/fifa-points" element={<FIFAPage />} />
            <Route path="/products/rainbow-six-credits" element={<RainbowSixPage />} />
            <Route path="/products/brawl-stars-gems" element={<BrawlStarsPage />} />
            <Route path="/products/apex-legends-coins" element={<ApexLegendsPage />} />
            <Route path="/products/roblox-robux" element={<RobuxPage />} />
            <Route path="/products/discord-nitro" element={<DiscordNitroPage />} />
            <Route path="/products/spotify-premium" element={<SpotifyPremiumPage />} />
            <Route path="/products/steam-games" element={<SteamGamesPage />} />
            <Route path="/products/playstation-games" element={<PlayStationGamesPage />} />
            <Route path="/products/:slug" element={<GenericProductPage />} />
            <Route path="/vouches" element={<VouchesPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/how-to-receive" element={<HowToReceivePage />} />
            <Route path="/how-long-it-takes" element={<HowLongItTakesPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/cart" element={<CartPage />} />
            
            {/* Protected routes that require authentication */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/order-status" element={
              <ProtectedRoute>
                <OrderStatusPage />
              </ProtectedRoute>
            } />
            <Route path="/create-order" element={
              <ProtectedRoute>
                <CreateOrderPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminRoute>
                <OrderManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/enhanced-orders" element={
              <AdminRoute>
                <EnhancedOrderManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/products" element={
              <AdminRoute>
                <ProductManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/enhanced-products" element={
              <AdminRoute>
                <EnhancedProductManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/vouches" element={
              <AdminRoute>
                <VouchManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/help" element={
              <AdminRoute>
                <HelpManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/game-prices" element={
              <AdminRoute>
                <GamePriceManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/promo-codes" element={
              <AdminRoute>
                <PromoCodeManagementPage />
              </AdminRoute>
            } />
            <Route path="/admin/database-init" element={
              <AdminRoute>
                <DatabaseInitPage />
              </AdminRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <LiveChatBubble />
      </div>
    </Router>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
