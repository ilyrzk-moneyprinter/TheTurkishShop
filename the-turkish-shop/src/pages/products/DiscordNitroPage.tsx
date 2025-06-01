import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import { products } from '../../data/products';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';

// Import Discord Nitro icon
import DiscordNitroIcon from '../../assets/icons/Nitro.webp';

const DiscordNitroPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [nitroMonths, setNitroMonths] = useState(1);
  const [nitroType, setNitroType] = useState('full'); // 'basic' or 'full'
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Find Discord Nitro product
  const nitroProduct = products.find(p => p.name === 'Discord Nitro');
  
  if (!nitroProduct) {
    return null;
  }
  
  // Calculate Nitro price based on type and duration
  const calculateNitroPrice = () => {
    const monthlyPrice = nitroType === 'basic' ? 1.49 : 3.99;
    
    // Full year discount for Nitro Full (£40 instead of £48)
    if (nitroType === 'full' && nitroMonths === 12) {
      return 40;
    }
    
    return monthlyPrice * nitroMonths;
  };
  
  // Calculate the original international price (2.5x Turkish price)
  const calculateOriginalPrice = () => {
    return (calculateNitroPrice() * 2.5).toFixed(2);
  };
  
  // Calculate savings for yearly subscription
  const calculateSavings = () => {
    if (nitroType === 'full' && nitroMonths === 12) {
      const regularPrice = 3.99 * 12;
      const discountedPrice = 40;
      const savings = regularPrice - discountedPrice;
      
      return {
        amount: savings.toFixed(2),
        percentage: Math.round((savings / regularPrice) * 100)
      };
    }
    
    return null;
  };
  
  const savings = calculateSavings();
  
  // Handle add to cart
  const handleAddToCart = () => {
    console.log(`Adding Discord Nitro ${nitroType} (${nitroMonths} months) to cart`);
    
    addToCart({
      id: `Discord-Nitro-${nitroType}-${nitroMonths}-${Date.now()}`,
      name: 'Discord Nitro',
      type: 'Subscription',
      amount: `${nitroType === 'basic' ? 'Basic' : 'Full'} - ${nitroMonths} ${nitroMonths === 1 ? 'month' : 'months'}`,
      price: calculateNitroPrice(),
      image: DiscordNitroIcon
    });
    
    // Show feedback
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };
  
  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };
  
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/products')} 
          className="flex items-center text-textDark hover:text-accent mb-6 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Products</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="hidden lg:flex items-center justify-center lg:col-span-1 bg-gradient-to-br from-indigo-500/20 to-purple-700/20 rounded-2xl p-8">
            <div className="h-64 w-64 rounded-full bg-white/10 border border-white/20 shadow-xl flex items-center justify-center overflow-hidden">
              <img 
                src={DiscordNitroIcon} 
                alt="Discord Nitro" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>
          
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-glass backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-textDark">Discord Nitro</h1>
                  <span className="ml-3 px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    Turkish Region
                  </span>
                </div>
                <p className="text-textDark/70">
                  Discounted Discord Nitro at Turkish regional prices. Safe and instant delivery.
                </p>
              </div>
              
              {/* Nitro Type Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-textDark mb-3">Select Nitro Type</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setNitroType('basic')}
                    className={`p-4 rounded-lg border transition-colors ${
                      nitroType === 'basic' 
                        ? 'border-accent bg-accent/10 text-accent' 
                        : 'border-white/10 bg-white/5 text-textDark hover:bg-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Nitro Basic</span>
                      <div className="flex items-center mt-1">
                        <span className={`${nitroType === 'basic' ? 'text-accent' : 'text-price'} font-bold`}>
                          {formatPrice(1.49)}/month
                        </span>
                      </div>
                      {currency !== 'GBP' && (
                        <span className="text-xs text-textDark/60">
                          (£1.49/month)
                        </span>
                      )}
                      <span className="text-xs mt-1 text-textDark/70">
                        Essential perks, affordable price
                      </span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setNitroType('full')}
                    className={`p-4 rounded-lg border transition-colors ${
                      nitroType === 'full' 
                        ? 'border-accent bg-accent/10 text-accent' 
                        : 'border-white/10 bg-white/5 text-textDark hover:bg-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Nitro Full</span>
                      <div className="flex items-center mt-1">
                        <span className={`${nitroType === 'full' ? 'text-accent' : 'text-price'} font-bold`}>
                          {formatPrice(3.99)}/month
                        </span>
                      </div>
                      {currency !== 'GBP' && (
                        <span className="text-xs text-textDark/60">
                          (£3.99/month)
                        </span>
                      )}
                      <span className="text-xs mt-1 text-textDark/70">
                        All perks, server boosts, HD streaming
                      </span>
                    </div>
                  </button>
                </div>
                
                {/* Duration slider (only for Nitro Full) */}
                {nitroType === 'full' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-textDark mb-3">Select Duration</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { months: 1, label: "1 Month" },
                        { months: 6, label: "6 Months" },
                        { months: 12, label: "12 Months (1 Year)" }
                      ].map(option => (
                        <button
                          key={option.months}
                          onClick={() => setNitroMonths(option.months)}
                          className={`p-4 rounded-lg border transition-colors ${
                            nitroMonths === option.months 
                              ? 'border-accent bg-accent/10 text-accent' 
                              : 'border-white/10 bg-white/5 text-textDark hover:bg-white/10'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{option.label}</span>
                            {option.months === 12 && (
                              <span className="mt-1 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                                Save 16%
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-white/5 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-textDark/70">Plan:</span>
                    <span className="font-medium text-textDark">Discord Nitro {nitroType === 'basic' ? 'Basic' : 'Full'}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-textDark/70">Duration:</span>
                    <span className="font-medium text-textDark">{nitroType === 'basic' ? '1 month' : `${nitroMonths} ${nitroMonths === 1 ? 'month' : 'months'}`}</span>
                  </div>
                  
                  {nitroType === 'full' && (
                    <div className="flex justify-between mb-2">
                      <span className="text-textDark/70">Monthly price:</span>
                      <div className="text-right">
                        <span className="font-medium text-textDark">{formatPrice(calculateNitroPrice() / nitroMonths)}/month</span>
                        {currency !== 'GBP' && (
                          <div className="text-xs text-textDark/60">
                            (£{(calculateNitroPrice() / nitroMonths).toFixed(2)}/month)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="h-px bg-white/10 my-3"></div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-textDark font-medium">Total price:</span>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-price font-bold text-2xl">{formatPrice(calculateNitroPrice())}</span>
                        <span className="text-sm text-textDark/50 line-through">{formatPrice(calculateOriginalPrice())}</span>
                      </div>
                      {currency !== 'GBP' && (
                        <div className="text-xs text-textDark/60">
                          (£{calculateNitroPrice().toFixed(2)})
                        </div>
                      )}
                      <span className="text-xs text-accent">Save 60% off international price</span>
                      {savings && (
                        <span className="text-xs text-accent">+ Save {formatPrice(savings.amount)} on yearly plan</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg text-sm text-accent mb-6">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p>Nitro will be delivered as a gift link to your email. No VPN required to redeem.</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-4 rounded-lg bg-white/5 border border-white/10 text-textDark hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    {addedToCart ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Cart
                      </span>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3 px-4 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="bg-glass backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-lg font-medium text-textDark mb-4">Nitro Benefits</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Custom animated emojis and stickers</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Higher quality video streaming</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Custom profiles and server avatars</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Larger file uploads (up to 100MB)</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Server boosts (Nitro Full only)</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Custom Discord tag number</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordNitroPage; 