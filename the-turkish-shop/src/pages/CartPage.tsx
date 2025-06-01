import { Link } from 'react-router-dom';
import { Trash2, ChevronDown, ChevronUp, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MotionWrapper from '../components/animations/MotionWrapper';
import MotionButton from '../components/animations/MotionButton';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

const CartPage = () => {
  const { isDarkMode } = useTheme();
  const { 
    items: cartItems, 
    updateQuantity, 
    removeFromCart,
    subtotal,
    total
  } = useCart();
  const { formatPrice, currency } = useCurrency();
  
  // Calculate discount (example: 5% on orders over £20)
  const discount = subtotal > 20 ? subtotal * 0.05 : 0;
  
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Your Cart</h1>
        
        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            <MotionWrapper>
              <div className="flex flex-col items-center justify-center py-12 text-center bg-glass backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-glass">
                <ShoppingBag className={`h-20 w-20 mb-4 ${isDarkMode ? 'text-textLight/30' : 'text-textDark/30'}`} />
                <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Your cart is empty</h2>
                <p className={`max-w-md mb-6 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link to="/products">
                  <MotionButton variant="primary" className="px-6">
                    <span className="mr-2">Browse Products</span>
                    <ArrowRight className="h-4 w-4" />
                  </MotionButton>
                </Link>
              </div>
            </MotionWrapper>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <MotionWrapper className="lg:col-span-2">
                <div className="bg-glass backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-glass">
                  <div className="p-6 border-b border-white/10">
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Cart Items ({cartItems.length})
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-white/10">
                    <AnimatePresence initial={false}>
                      {cartItems.map((item, index) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          transition={{ 
                            duration: 0.3,
                            layout: {
                              type: "spring",
                              stiffness: 350,
                              damping: 25
                            }
                          }}
                          className={`flex justify-between p-6 items-center ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl ${isDarkMode ? 'border border-white/10' : 'border border-gray-200'}`}>
                              {item.image || '🎮'}
                            </div>
                            
                            <div>
                              <h3 className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                                {item.name}
                              </h3>
                              <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                                {item.amount}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex items-center">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className={`p-1 rounded-l-md ${
                                  isDarkMode 
                                    ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                                } transition-colors`}
                                disabled={item.quantity <= 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                              
                              <div className={`px-3 py-1 min-w-[40px] text-center ${
                                isDarkMode 
                                  ? 'bg-white/5 border-y border-white/10' 
                                  : 'bg-gray-100 border-y border-gray-200'
                              }`}>
                                {item.quantity}
                              </div>
                              
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className={`p-1 rounded-r-md ${
                                  isDarkMode 
                                    ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                                } transition-colors`}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-price font-bold">{formatPrice(item.price * item.quantity)}</p>
                              {currency !== 'GBP' && (
                                <p className="text-xs text-textDark/50">£{(item.price * item.quantity).toFixed(2)}</p>
                              )}
                              <motion.button 
                                onClick={() => removeFromCart(item.id)}
                                className={`mt-2 p-1 rounded-lg bg-white/5 border border-white/10 ${isDarkMode ? 'text-textLight' : 'text-textDark'} hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20`}
                                whileHover={{ 
                                  scale: 1.1,
                                  transition: {
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 10
                                  }
                                }}
                                whileTap={{ 
                                  scale: 0.9,
                                  transition: {
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 10
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </MotionWrapper>
              
              {/* Order Summary */}
              <MotionWrapper variant="slideInRight">
                <div className="bg-glass backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-glass">
                  <div className="p-6 border-b border-white/10">
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Order Summary</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Subtotal</span>
                      <div className="text-right">
                        <span className={`${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{formatPrice(subtotal)}</span>
                        {currency !== 'GBP' && (
                          <div className="text-xs text-textDark/50">£{subtotal.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Discount (5%)</span>
                        <div className="text-right">
                          <span className="text-green-500">-{formatPrice(discount)}</span>
                          {currency !== 'GBP' && (
                            <div className="text-xs text-green-500/70">-£{discount.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-white/10 pt-4 flex justify-between font-bold">
                      <span className={`${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Total</span>
                      <div className="text-right">
                        <span className="text-price">{formatPrice(subtotal - discount)}</span>
                        {currency !== 'GBP' && (
                          <div className="text-xs text-textDark/50">£{(subtotal - discount).toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Link to="/checkout">
                        <MotionButton variant="primary" className="w-full py-3">
                          Proceed to Checkout
                        </MotionButton>
                      </Link>
                    </div>
                    
                    <div className="mt-4">
                      <Link to="/products" className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'} hover:underline flex items-center justify-center`}>
                        <ArrowRight className="h-3 w-3 mr-1 rotate-180" />
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </MotionWrapper>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CartPage; 