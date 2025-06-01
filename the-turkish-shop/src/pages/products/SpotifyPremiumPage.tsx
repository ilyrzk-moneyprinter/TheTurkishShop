import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import { products } from '../../data/products';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';

// Import Spotify icon
import SpotifyIcon from '../../assets/icons/Spotify-Premium.webp';

const SpotifyPremiumPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [spotifyMonths, setSpotifyMonths] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Find Spotify Premium product
  const spotifyProduct = products.find(p => p.name === 'Spotify Premium');
  
  if (!spotifyProduct) {
    return null;
  }

  // Calculate Spotify price based on duration
  const calculateSpotifyPrice = () => {
    // Price structure based on the data provided
    if (spotifyMonths === 1) return 3.99;
    if (spotifyMonths === 3) return 9.99;
    if (spotifyMonths === 6) return 14.99;
    if (spotifyMonths === 12) return 29.99;
    return 3.99 * spotifyMonths; // Fallback
  };

  // Calculate the original international price (2.5x Turkish price)
  const calculateOriginalPrice = () => {
    return (calculateSpotifyPrice() * 2.5).toFixed(2);
  };

  // Calculate the savings percentage for longer subscriptions
  const calculateSavings = () => {
    const monthlyPrice = 3.99;
    const currentTotal = calculateSpotifyPrice();
    const regularPrice = monthlyPrice * spotifyMonths;
    const savings = regularPrice - currentTotal;
    
    if (savings <= 0) return null;
    
    return {
      amount: savings.toFixed(2),
      percentage: Math.round((savings / regularPrice) * 100)
    };
  };

  const savings = calculateSavings();

  // Handle add to cart
  const handleAddToCart = () => {
    console.log("Adding Spotify Premium to cart:", spotifyMonths);
    
    addToCart({
      id: `Spotify-Premium-${spotifyMonths}-${Date.now()}`,
      name: 'Spotify Premium',
      type: 'Subscription',
      amount: `${spotifyMonths} ${spotifyMonths === 1 ? 'month' : 'months'}`,
      price: calculateSpotifyPrice(),
      image: SpotifyIcon
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
          <div className="hidden lg:flex items-center justify-center lg:col-span-1 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-2xl p-8">
            <div className="h-64 w-64 rounded-full bg-white/10 border border-white/20 shadow-xl flex items-center justify-center overflow-hidden">
              <img 
                src={SpotifyIcon} 
                alt="Spotify Premium" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>
          
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-glass backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-textDark">Spotify Premium</h1>
                  <span className="ml-3 px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    Turkish Region
                  </span>
                </div>
                <p className="text-textDark/70">
                  Discounted Spotify Premium at Turkish regional prices. Safe and instant delivery.
                </p>
              </div>
              
              {/* Subscription duration selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-textDark mb-3">Select Subscription Duration</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { months: 1, label: "1 Month" },
                    { months: 3, label: "3 Months" },
                    { months: 6, label: "6 Months" },
                    { months: 12, label: "12 Months (1 Year)" }
                  ].map(option => (
                    <button
                      key={option.months}
                      onClick={() => setSpotifyMonths(option.months)}
                      className={`p-4 rounded-lg border transition-colors ${
                        spotifyMonths === option.months 
                          ? 'border-accent bg-accent/10 text-accent' 
                          : 'border-white/10 bg-white/5 text-textDark hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{option.label}</span>
                        <div className="flex items-center mt-1">
                          <span className={`${spotifyMonths === option.months ? 'text-accent' : 'text-price'} font-bold`}>
                            {formatPrice(option.months === 1 ? 3.99 : 
                               option.months === 3 ? 9.99 : 
                               option.months === 6 ? 14.99 : 
                               29.99)}
                          </span>
                          {option.months > 1 && (
                            <span className="ml-2 text-xs text-textDark/60 line-through">
                              {formatPrice(3.99 * option.months)}
                            </span>
                          )}
                        </div>
                        {option.months > 1 && (
                          <span className="text-xs mt-1 text-accent">
                            Save {Math.round(100 - ((option.months === 3 ? 9.99 : option.months === 6 ? 14.99 : 29.99) / (3.99 * option.months) * 100))}%
                          </span>
                        )}
                        {currency !== 'GBP' && (
                          <span className="text-xs text-textDark/60">
                            (£{option.months === 1 ? "3.99" : 
                               option.months === 3 ? "9.99" : 
                               option.months === 6 ? "14.99" : 
                               "29.99"})
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Subscription details */}
                <div className="p-4 bg-white/5 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-textDark/70">Plan:</span>
                    <span className="font-medium text-textDark">Spotify Premium</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-textDark/70">Duration:</span>
                    <span className="font-medium text-textDark">{spotifyMonths} {spotifyMonths === 1 ? 'month' : 'months'}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-textDark/70">Monthly price:</span>
                    <div className="text-right">
                      <span className="font-medium text-textDark">{formatPrice(calculateSpotifyPrice() / spotifyMonths)}/month</span>
                      {currency !== 'GBP' && (
                        <div className="text-xs text-textDark/60">
                          (£{(calculateSpotifyPrice() / spotifyMonths).toFixed(2)}/month)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-px bg-white/10 my-3"></div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-textDark font-medium">Total price:</span>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-price font-bold text-2xl">{formatPrice(calculateSpotifyPrice())}</span>
                        <span className="text-sm text-textDark/50 line-through">{formatPrice(calculateOriginalPrice())}</span>
                      </div>
                      {currency !== 'GBP' && (
                        <div className="text-xs text-textDark/60">
                          (£{calculateSpotifyPrice().toFixed(2)})
                        </div>
                      )}
                      <span className="text-xs text-accent">Save 60% off international price</span>
                      {savings && (
                        <span className="text-xs text-accent">+ Save {formatPrice(savings.amount)} on monthly plan</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg text-sm text-accent mb-6">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p>Spotify Premium will be delivered as a premium account or a premium upgrade to your existing account.</p>
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
              <h3 className="text-lg font-medium text-textDark mb-4">What's Included</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Ad-free music listening</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Download to listen offline</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Premium sound quality</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">On-demand playback</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">No regional restrictions - works worldwide</p>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-accent">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-textDark/70">Instant delivery to your email</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPremiumPage; 