import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../firebase/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, CurrencyCode } from '../contexts/CurrencyContext';
import OrderDeliveryOptions from '../components/orders/OrderDeliveryOptions';
import MotionWrapper from '../components/animations/MotionWrapper';
import { DeliveryType, PaymentMethod } from '../firebase/types';

const CreateOrderPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { currency, formatPrice } = useCurrency();
  
  // Form state
  const [product, setProduct] = useState('Fortnite V-Bucks');
  const [tier, setTier] = useState('1000');
  const [price, setPrice] = useState('7.99');
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [gameUsername, setGameUsername] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Standard' | 'Express'>('Standard');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate total price with express fee if applicable
  const expressFeePrices: Record<CurrencyCode, number> = {
    'GBP': 9.00,    // Base price
    'USD': 12.15,   // Updated to match new conversion rate: 9.00 * 1.35
    'EUR': 10.62,   // Updated to match new conversion rate: 9.00 * 1.18
    'CAD': 16.65,   // Updated to match new conversion rate: 9.00 * 1.85
    'AUD': 13.95    // Updated to match new conversion rate: 9.00 * 1.55
  };
  
  const expressFee = deliveryType === 'Express' ? expressFeePrices[currency as CurrencyCode] || 0 : 0;
  const basePrice = parseFloat(price);
  const totalPrice = basePrice + expressFee;
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Create order data
      const orderData = {
        product,
        tier,
        price: totalPrice.toString(),
        currency,
        buyerEmail: currentUser?.email || '',
        paymentMethod: paymentMethod as PaymentMethod,
        gameUsername,
        deliveryType: deliveryType as DeliveryType,
        // Add other required fields as needed
      };
      
      // Create order in Firebase
      const orderId = await createOrder(orderData);
      
      // Navigate to order status page
      navigate(`/order-status?id=${orderId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred creating your order');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper>
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Create Custom Order
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Information */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'} shadow-glass border border-white/10`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Product Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Product
                  </label>
                  <select
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-black/20 text-textLight' : 'bg-white text-textDark'
                    } border border-transparent focus:border-accent focus:outline-none`}
                  >
                    <option value="Fortnite V-Bucks">Fortnite V-Bucks</option>
                    <option value="Valorant Points">Valorant Points</option>
                    <option value="FIFA FC Points">FIFA FC Points</option>
                    <option value="Apex Coins">Apex Coins</option>
                    <option value="Spotify Premium">Spotify Premium</option>
                    <option value="Discord Nitro">Discord Nitro</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Tier/Amount
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => {
                      setTier(e.target.value);
                      // Set price based on tier (simplified example)
                      if (e.target.value === '1000') setPrice('7.99');
                      else if (e.target.value === '2800') setPrice('19.99');
                      else if (e.target.value === '5000') setPrice('31.99');
                      else if (e.target.value === '13500') setPrice('79.99');
                    }}
                    className={`w-full px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-black/20 text-textLight' : 'bg-white text-textDark'
                    } border border-transparent focus:border-accent focus:outline-none`}
                  >
                    <option value="1000">1000 {product.includes('V-Bucks') ? 'V-Bucks' : product.includes('Points') ? 'Points' : 'Units'}</option>
                    <option value="2800">2800 {product.includes('V-Bucks') ? 'V-Bucks' : product.includes('Points') ? 'Points' : 'Units'}</option>
                    <option value="5000">5000 {product.includes('V-Bucks') ? 'V-Bucks' : product.includes('Points') ? 'Points' : 'Units'}</option>
                    <option value="13500">13500 {product.includes('V-Bucks') ? 'V-Bucks' : product.includes('Points') ? 'Points' : 'Units'}</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Game Username/ID
                  </label>
                  <input
                    type="text"
                    value={gameUsername}
                    onChange={(e) => setGameUsername(e.target.value)}
                    placeholder="Enter your in-game username or ID"
                    className={`w-full px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-black/20 text-textLight' : 'bg-white text-textDark'
                    } border border-transparent focus:border-accent focus:outline-none`}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Delivery Options */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'} shadow-glass border border-white/10`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Delivery Options
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard Delivery Option */}
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${
                    deliveryType === 'Standard'
                      ? isDarkMode 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-blue-500 bg-blue-50'
                      : isDarkMode
                        ? 'border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setDeliveryType('Standard')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                      deliveryType === 'Standard'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      {deliveryType === 'Standard' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Standard Delivery</span>
                      <p className="text-sm opacity-70 mt-1">
                        Delivered within 1-3 days
                      </p>
                      <div className="mt-2 font-medium text-green-600">
                        Free
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Express Delivery Option */}
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${
                    deliveryType === 'Express'
                      ? isDarkMode 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-purple-500 bg-purple-50'
                      : isDarkMode
                        ? 'border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setDeliveryType('Express')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                      deliveryType === 'Express'
                        ? 'bg-purple-500 text-white'
                        : isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      {deliveryType === 'Express' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Express Delivery</span>
                      <p className="text-sm opacity-70 mt-1">
                        Priority queue - delivered within 5-60 mins
                      </p>
                      <div className="mt-2 font-medium text-purple-600">
                        +{formatPrice(expressFee)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'} shadow-glass border border-white/10`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Payment Method
              </h2>
              
              <div className="space-y-4">
                <div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-black/20 text-textLight' : 'bg-white text-textDark'
                    } border border-transparent focus:border-accent focus:outline-none`}
                  >
                    <option value="PayPal">PayPal</option>
                    <option value="Paysafecard">Paysafecard</option>
                    <option value="Crypto">Cryptocurrency</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'} shadow-glass border border-white/10`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Product:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {product} - {tier}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Price:</span>
                  <div className="text-right">
                    <span className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      {formatPrice(basePrice)}
                    </span>
                    {currency !== 'GBP' && (
                      <div className="text-xs text-textDark/50">
                        £{basePrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                
                {deliveryType === 'Express' && (
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Express Fee:</span>
                    <div className="text-right">
                      <span className="text-purple-600">
                        +{formatPrice(expressFee)}
                      </span>
                      {currency !== 'GBP' && (
                        <div className="text-xs text-purple-600/70">
                          +£{expressFee.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-white/10 pt-3 mt-3 flex justify-between">
                  <span className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Total:</span>
                  <div className="text-right">
                    <span className="text-price font-bold">
                      {formatPrice(totalPrice)}
                    </span>
                    {currency !== 'GBP' && (
                      <div className="text-xs text-textDark/50">
                        £{totalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg ${
                  isDarkMode 
                    ? 'bg-accent text-white hover:bg-accent/90' 
                    : 'bg-accent text-white hover:bg-accent/90'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </MotionWrapper>
    </div>
  );
};

export default CreateOrderPage; 