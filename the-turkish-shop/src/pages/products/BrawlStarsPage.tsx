import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Zap, Shield, Check, AlertTriangle, Globe, ChevronDown, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import PlatformIcon from '../../components/PlatformIcon';
import { auth } from '../../firebase/config';
import { createOrder } from '../../firebase/orderService';
import { PaymentMethod, DeliveryType, GamePlatform } from '../../firebase/types';

const BrawlStarsPage = () => {
  const { isDarkMode } = useTheme();
  const { formatPrice, currency } = useCurrency();
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const product = {
    name: "Brawl Stars Gems",
    region: "Turkey",
    currency: "£",
    tiers: [
      { amount: "360", price: "7.49" },
      { amount: "950", price: "14.99" },
      { amount: "2000", price: "24.99" },
      { amount: "5000", price: "44.99" },
      { amount: "7500", price: "64.49" },
      { amount: "12500", price: "94.99" },
    ],
  };

  const handleAddToCart = () => {
    const tier = product.tiers[selectedTier];
    addToCart({
      id: `brawl-stars-gems-${tier.amount}`,
      name: product.name,
      price: parseFloat(tier.price),
      image: '/assets/icons/brawlstars.webp',
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
        tier: `${tier.amount} Gems`,
        price: (parseFloat(tier.price) * quantity).toString(),
        currency: 'USD',
        paymentMethod: 'PayPal' as PaymentMethod,
        deliveryType: 'Standard' as DeliveryType,
        gameUsername: '',
        platform: 'Mobile' as GamePlatform
      };

      await createOrder(orderData);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark' : 'bg-light'} transition-colors`}>
      <Helmet>
        <title>Buy Brawl Stars Gems - Cheap Gems Turkey | The Turkish Shop</title>
        <meta name="description" content="Buy cheap Brawl Stars Gems from Turkey. Save up to 60% on Gems. Instant delivery, secure payment. Get your Brawl Stars Gems now!" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-10" />
        <div className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <PlatformIcon platform="BrawlStars" className="h-12 w-12" />
                <span className="text-sm text-accent font-medium uppercase tracking-wide">Turkey Region</span>
              </div>
              
              <h1 className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Brawl Stars Gems
              </h1>
              
              <p className={`text-lg ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                Get Brawl Stars Gems at Turkish prices and save big on all your purchases. 
                Unlock brawlers, skins, brawl passes, and more!
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  <span className={`text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    Instant Delivery
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className={`text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    100% Secure
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent" />
                  <span className={`text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    4.9/5 Rating
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Product Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={`rounded-2xl ${isDarkMode ? 'bg-black/20' : 'bg-white'} backdrop-blur-sm p-8 shadow-2xl`}>
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Select Gems Amount
                </h2>

                {/* Tier Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {product.tiers.map((tier, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTier(index)}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        selectedTier === index
                          ? 'border-accent bg-accent/10'
                          : isDarkMode
                          ? 'border-white/10 hover:border-white/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selectedTier === index && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-accent" />
                        </div>
                      )}
                      <div className={`text-lg font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                        {tier.amount}
                      </div>
                      <div className="text-accent font-bold">
                        {formatPrice(parseFloat(tier.price))}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Quantity Selection */}
                <div className="mb-6">
                  <label className={`block text-sm mb-2 ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`w-10 h-10 rounded-lg ${
                        isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      -
                    </button>
                    <span className={`text-xl font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className={`w-10 h-10 rounded-lg ${
                        isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Price */}
                <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                      Total Price
                    </span>
                    <span className={`text-2xl font-bold text-accent`}>
                      {formatPrice(parseFloat(product.tiers[selectedTier].price) * quantity)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    disabled={purchaseLoading}
                    className="w-full py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
                  >
                    {purchaseLoading ? (
                      'Processing...'
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Buy Now
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-textLight'
                        : 'bg-gray-100 hover:bg-gray-200 text-textDark'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-5 w-5" />
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 px-6 ${isDarkMode ? 'bg-black/10' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Why Buy Brawl Stars Gems from Us?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white'} shadow-lg`}
            >
              <Globe className="h-12 w-12 text-accent mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Turkey Region Prices
              </h3>
              <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                Access the best prices available in the Turkish region and save up to 60% on every purchase.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white'} shadow-lg`}
            >
              <Zap className="h-12 w-12 text-accent mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Instant Delivery
              </h3>
              <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                Receive your Gems code immediately after payment. No waiting, no delays.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-white'} shadow-lg`}
            >
              <Shield className="h-12 w-12 text-accent mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Safe & Secure
              </h3>
              <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                100% legitimate codes with secure payment processing. Your account safety is guaranteed.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            How to Buy Brawl Stars Gems
          </h2>
          
          <div className="space-y-6">
            {[
              { step: 1, title: "Select Gems Amount", desc: "Choose the amount of Gems you want to purchase" },
              { step: 2, title: "Complete Payment", desc: "Pay securely with your preferred payment method" },
              { step: 3, title: "Receive Code", desc: "Get your Gems code instantly via email" },
              { step: 4, title: "Redeem In-Game", desc: "Enter the code in Brawl Stars to add Gems to your account" }
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: item.step * 0.1 }}
                className={`flex gap-4 p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`py-16 px-6 ${isDarkMode ? 'bg-black/10' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`w-full flex items-center justify-between p-6 rounded-lg ${
              isDarkMode ? 'bg-white/5' : 'bg-white'
            } shadow-lg`}
          >
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Important Information
            </h3>
            <ChevronDown className={`h-5 w-5 transition-transform ${showDetails ? 'rotate-180' : ''} ${
              isDarkMode ? 'text-textLight' : 'text-textDark'
            }`} />
          </button>
          
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 p-6 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white'} shadow-lg space-y-4`}
            >
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Supercell ID Required
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    You need a Supercell ID to redeem Gems. Make sure your account is set to Turkey region.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    All Platforms
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    Gems work on both iOS and Android devices with the same Supercell ID.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrawlStarsPage; 