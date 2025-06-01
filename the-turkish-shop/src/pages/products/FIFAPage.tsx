import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Zap, Shield, Check, AlertTriangle, Globe, ChevronDown, Star, Users, Award, Trophy, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import PlatformIcon from '../../components/PlatformIcon';
import { auth } from '../../firebase/config';
import { createOrder } from '../../firebase/orderService';
import { PaymentMethod, DeliveryType, GamePlatform } from '../../firebase/types';

const FIFAPage = () => {
  const { isDarkMode } = useTheme();
  const { formatPrice, currency } = useCurrency();
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const product = {
    name: "FIFA Points",
    region: "Turkey",
    currency: "£",
    tiers: [
      { amount: "1600", price: "5.49", save: null },
      { amount: "2800", price: "12.49", save: "10% off" },
      { amount: "5900", price: "22.99", save: "15% off" },
      { amount: "12000", price: "44.99", save: "20% off" },
      { amount: "18500", price: "69.99", save: "25% off" },
      { amount: "37000", price: "129.99", save: "Best Value" },
    ],
  };

  const handleAddToCart = () => {
    const tier = product.tiers[selectedTier];
    addToCart({
      id: `fifa-points-${tier.amount}`,
      name: product.name,
      price: parseFloat(tier.price),
      image: '/assets/icons/fifa.png',
      amount: tier.amount,
      type: 'game currency'
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!auth.currentUser) {
      window.location.href = '/login';
      return;
    }

    setPurchaseLoading(true);
    const tier = product.tiers[selectedTier];
    
    try {
      const orderData = {
        buyerEmail: auth.currentUser.email || '',
        product: product.name,
        tier: `${tier.amount} Points`,
        price: (parseFloat(tier.price) * quantity).toString(),
        currency: 'USD',
        paymentMethod: 'PayPal' as PaymentMethod,
        deliveryType: 'Standard' as DeliveryType,
        gameUsername: '',
        platform: 'PC' as GamePlatform
      };

      await createOrder(orderData);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`min-h-screen ${isDarkMode ? 'bg-dark' : 'bg-light'} transition-colors`}
    >
      <Helmet>
        <title>Buy FIFA Points - Cheap FIFA Points Turkey | The Turkish Shop</title>
        <meta name="description" content="Buy cheap FIFA Points from Turkey. Save up to 60% on FIFA Ultimate Team Points. Instant delivery, secure payment." />
      </Helmet>

      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 opacity-10" />
        <motion.div 
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2310B981" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Product Info */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <PlatformIcon platform="FIFA" className="h-16 w-16" />
                  </motion.div>
                  <div>
                    <span className="text-sm text-accent font-medium uppercase tracking-wide">Turkey Region</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm font-medium">4.8/5</span>
                      <span className="text-sm text-gray-500">(1,832 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <h1 className={`text-5xl md:text-6xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  FIFA Points
                </h1>
                
                <p className={`text-xl ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                  Build your Ultimate Team with discounted FIFA Points. Save up to 60% on packs, 
                  players, and FUT content with Turkish regional pricing!
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-semibold">Ultimate Team</p>
                      <p className="text-sm opacity-70">Build dream squad</p>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Shield className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-semibold">100% Safe</p>
                      <p className="text-sm opacity-70">EA approved</p>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Zap className="h-8 w-8 text-accent" />
                    <div>
                      <p className="font-semibold">Quick Delivery</p>
                      <p className="text-sm opacity-70">5-10 minutes</p>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                    <Award className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="font-semibold">Best Prices</p>
                      <p className="text-sm opacity-70">60% savings</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Column - Purchase Card */}
              <motion.div variants={itemVariants}>
                <div className={`rounded-3xl ${isDarkMode ? 'bg-black/40' : 'bg-white'} backdrop-blur-xl p-8 shadow-2xl border border-white/20`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Select FIFA Points
                    </h2>
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>

                  {/* Tier Selection Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {product.tiers.map((tier, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTier(index)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          selectedTier === index
                            ? 'border-accent bg-gradient-to-br from-accent/20 to-accent/10'
                            : isDarkMode
                            ? 'border-white/10 hover:border-white/20 bg-white/5'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        {selectedTier === index && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <Check className="h-5 w-5 text-accent" />
                          </motion.div>
                        )}
                        
                        {tier.save && (
                          <span className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            {tier.save}
                          </span>
                        )}
                        
                        <div className={`text-xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                          {tier.amount}
                        </div>
                        <div className="text-accent font-bold text-lg mt-1">
                          {formatPrice(parseFloat(tier.price))}
                        </div>
                        <div className="text-xs opacity-60 mt-1">
                          {formatPrice(parseFloat(tier.price) / parseInt(tier.amount) * 1000)}/1000
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Total Price Display */}
                  <motion.div 
                    layout
                    className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-lg ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                        Total Price
                      </span>
                      <div className="text-right">
                        <motion.span 
                          key={product.tiers[selectedTier].price}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-bold text-accent"
                        >
                          {formatPrice(parseFloat(product.tiers[selectedTier].price) * quantity)}
                        </motion.span>
                        <p className="text-sm opacity-60 line-through">
                          {formatPrice(parseFloat(product.tiers[selectedTier].price) * quantity * 2.5)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyNow}
                      disabled={purchaseLoading}
                      className="w-full py-4 bg-gradient-to-r from-accent to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-accent/50 transition-all flex items-center justify-center gap-3"
                    >
                      {purchaseLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          Buy Now - Quick Delivery
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        isDarkMode
                          ? 'bg-white/10 hover:bg-white/20 text-textLight border border-white/20'
                          : 'bg-gray-100 hover:bg-gray-200 text-textDark border border-gray-300'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="h-5 w-5 text-green-500" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Shield className="h-4 w-4" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      <Zap className="h-4 w-4" />
                      Fast Delivery
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div 
        variants={containerVariants}
        className={`py-20 px-6 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            variants={itemVariants}
            className={`text-4xl font-bold text-center mb-12 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}
          >
            Why Buy FIFA Points from Us?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Turkey Region Pricing",
                description: "Access exclusive Turkish prices and save up to 60% on every FIFA Points purchase.",
                color: "text-blue-500"
              },
              {
                icon: Trophy,
                title: "Build Your Ultimate Team",
                description: "Get more packs, better players, and dominate FUT with your saved money.",
                color: "text-yellow-500"
              },
              {
                icon: Shield,
                title: "100% Safe & Legal",
                description: "All codes are legitimate and purchased directly from EA. Your account is always safe.",
                color: "text-green-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white'} shadow-xl border border-white/10`}
              >
                <feature.icon className={`h-14 w-14 ${feature.color} mb-4`} />
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  {feature.title}
                </h3>
                <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div 
        variants={containerVariants}
        className="py-20 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            variants={itemVariants}
            className={`text-4xl font-bold text-center mb-12 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}
          >
            How to Buy FIFA Points
          </motion.h2>
          
          <div className="space-y-6">
            {[
              { step: 1, title: "Choose FIFA Points", desc: "Select the amount of FIFA Points you want", icon: "⚽" },
              { step: 2, title: "Secure Payment", desc: "Complete your purchase with our secure checkout", icon: "💳" },
              { step: 3, title: "Get Your Code", desc: "Receive your FIFA Points code via email", icon: "📧" },
              { step: 4, title: "Redeem & Play", desc: "Enter the code in FIFA Ultimate Team", icon: "🎮" }
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                whileHover={{ x: 10 }}
                className={`flex gap-6 p-6 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'} border border-white/10`}
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-accent to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 text-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {item.title}
                  </h3>
                  <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    {item.desc}
                  </p>
                </div>
                <div className="text-3xl">{item.icon}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        variants={containerVariants}
        className={`py-20 px-6 ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}
      >
        <div className="max-w-4xl mx-auto">
          <motion.button
            variants={itemVariants}
            onClick={() => setShowDetails(!showDetails)}
            className={`w-full flex items-center justify-between p-8 rounded-2xl ${
              isDarkMode ? 'bg-white/5' : 'bg-white'
            } shadow-xl border border-white/10`}
          >
            <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Important Information
            </h3>
            <motion.div
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className={`h-6 w-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`} />
            </motion.div>
          </motion.button>
          
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className={`mt-6 p-8 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white'} shadow-xl border border-white/10 space-y-6`}
            >
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold mb-2 text-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Region Requirements
                  </h4>
                  <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    These codes work for Turkish EA accounts. Make sure your EA account region is set to Turkey.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold mb-2 text-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    All Platforms Supported
                  </h4>
                  <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    FIFA Points work on PC, PlayStation, Xbox, and all platforms where you play FIFA Ultimate Team.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FIFAPage; 