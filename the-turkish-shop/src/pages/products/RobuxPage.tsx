import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { Calculator, ShoppingCart, Info, CheckCircle, Gift, Shield } from 'lucide-react';

// Import Robux icon
import RobuxIcon from '../../assets/icons/robux.webp';

const RobuxPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [robuxAmount, setRobuxAmount] = useState<string>('1000');
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Price calculation: £4.99 per 1000 robux
  const PRICE_PER_1000_ROBUX = 4.99;
  
  const calculatePrice = (amount: number): number => {
    return (amount / 1000) * PRICE_PER_1000_ROBUX;
  };
  
  const calculateOriginalPrice = (amount: number): number => {
    // Show original price as 2.5x higher (Turkish regional pricing benefit)
    return calculatePrice(amount) * 2.5;
  };
  
  // Predefined amounts for quick selection
  const quickAmounts = [1000, 2200, 4500, 10000, 22500, 50000];
  
  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^\d]/g, '');
    setRobuxAmount(numericValue);
  };
  
  const handleAddToCart = () => {
    const amount = parseInt(robuxAmount) || 0;
    if (amount < 100) {
      alert('Minimum order is 100 Robux');
      return;
    }
    
    const price = calculatePrice(amount);
    
    addToCart({
      id: `robux-${amount}-${Date.now()}`,
      name: 'Roblox Robux',
      type: 'Game Currency',
      amount: amount.toString(),
      price: price,
      image: '🎲'
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };
  
  const currentAmount = parseInt(robuxAmount) || 0;
  const currentPrice = calculatePrice(currentAmount);
  const originalPrice = calculateOriginalPrice(currentAmount);
  
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <MotionWrapper variant="fadeIn">
          {/* Back navigation */}
          <button 
            onClick={() => navigate('/products')} 
            className={`flex items-center mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'} hover:text-accent transition-colors`}
          >
            <span className="mr-2">←</span> Back to Products
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Product Info & Image */}
            <div>
              <div className={`bg-glass backdrop-blur-xl rounded-2xl p-8 border border-white/10 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img 
                      src={RobuxIcon} 
                      alt="Robux" 
                      className="w-32 h-32 object-contain"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Best Price
                    </div>
                  </div>
                </div>
                
                <h1 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Roblox Robux
                </h1>
                
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className={`text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                      All taxes and fees covered by us
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className={`text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                      Instant delivery after payment
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <Gift className="h-5 w-5 text-green-500" />
                    <span className={`text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                      Multiple delivery methods available
                    </span>
                  </div>
                </div>
                
                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-accent/10' : 'bg-accent/5'} border border-accent/20`}>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Limited Items Available!
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    We also sell limited items at competitive prices. Contact us for more information.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Calculator */}
            <div>
              <div className={`bg-glass backdrop-blur-xl rounded-2xl p-8 border border-white/10 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <Calculator className="h-6 w-6 text-accent" />
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Robux Calculator
                  </h2>
                </div>
                
                {/* Custom Amount Input */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Enter Robux Amount
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={robuxAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={`w-full px-4 py-3 pr-20 rounded-lg ${
                        isDarkMode 
                          ? 'bg-black/20 text-textLight border-white/10' 
                          : 'bg-white text-textDark border-gray-200'
                      } border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all`}
                      placeholder="Enter amount..."
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                      Robux
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                    Minimum order: 100 Robux
                  </p>
                </div>
                
                {/* Quick Select Amounts */}
                <div className="mb-6">
                  <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Quick Select
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRobuxAmount(amount.toString())}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          robuxAmount === amount.toString()
                            ? 'bg-accent text-white'
                            : isDarkMode
                              ? 'bg-white/10 text-textLight hover:bg-white/20'
                              : 'bg-black/5 text-textDark hover:bg-black/10'
                        }`}
                      >
                        {amount.toLocaleString()}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Price Display */}
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className="flex justify-between items-end mb-4">
                    <span className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      Amount:
                    </span>
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      {currentAmount.toLocaleString()} Robux
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end mb-2">
                    <span className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      Your Price:
                    </span>
                    <span className="text-3xl font-bold text-accent">
                      {formatPrice(currentPrice.toFixed(2))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      Regular Price:
                    </span>
                    <span className={`text-lg line-through ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                      {formatPrice(originalPrice.toFixed(2))}
                    </span>
                  </div>
                  
                  <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-green-500/10' : 'bg-green-50'} border border-green-500/20`}>
                    <p className="text-green-600 text-sm font-medium text-center">
                      You save {formatPrice((originalPrice - currentPrice).toFixed(2))} (60% OFF)
                    </p>
                  </div>
                </div>
                
                {/* Formula Info */}
                <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} border ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-accent mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                        Price Formula: <span className="font-medium">£4.99 per 1000 Robux</span>
                      </p>
                      <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                        All taxes, fees, and service charges are included in the price
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={currentAmount < 100}
                    className={`py-3 px-6 rounded-lg font-medium transition-all ${
                      currentAmount < 100
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-white text-black hover:bg-gray-200'
                          : 'bg-black text-white hover:bg-gray-800'
                    } flex items-center justify-center gap-2`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    disabled={currentAmount < 100}
                    className={`py-3 px-6 rounded-lg font-medium bg-accent text-white hover:bg-accent/90 transition-all ${
                      currentAmount < 100 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Buy Now
                  </motion.button>
                </div>
                
                {addedToCart && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <p className="text-green-500 text-sm text-center font-medium">
                      ✓ Added to cart successfully!
                    </p>
                  </motion.div>
                )}
              </div>
              
              {/* How to Receive */}
              <div className={`mt-6 p-6 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} border ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Delivery Methods
                </h3>
                <ul className="space-y-2">
                  <li className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    <span className="text-accent">•</span>
                    <span><strong>Gamepass:</strong> Create a gamepass and we'll purchase it</span>
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    <span className="text-accent">•</span>
                    <span><strong>Gift Card:</strong> Receive a Roblox gift card code</span>
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    <span className="text-accent">•</span>
                    <span><strong>Account Delivery:</strong> We add Robux directly to your account</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </div>
  );
};

export default RobuxPage; 