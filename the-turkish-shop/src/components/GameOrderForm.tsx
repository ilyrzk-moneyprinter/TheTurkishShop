import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Monitor, Gamepad2, Link as LinkIcon, ShoppingCart, X, Check, Loader2 } from 'lucide-react';
import { GameProduct } from '../firebase/gamePriceService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface GameOrderFormProps {
  platform: 'Steam' | 'PSN';
  onFetchGame: (url: string) => Promise<GameProduct>;
}

const GameOrderForm = ({ platform, onFetchGame }: GameOrderFormProps) => {
  const { isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Form states
  const [gameUrl, setGameUrl] = useState('');
  
  // Process states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameProduct | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Validation
  const isValidUrl = () => {
    if (!gameUrl) return false;
    
    // For PlayStation, check if it's a valid product ID format
    if (platform === 'PSN') {
      // Check for raw PlayStation product ID format (with or without dash)
      const isPSProductId = (
        gameUrl.match(/^[A-Z0-9]+-[A-Z0-9]+_[0-9]+$/i) !== null || // With dash: EP9000-CUSA07410_00
        gameUrl.match(/^[A-Z0-9]+[A-Z0-9]+_[0-9]+$/i) !== null     // Without dash: EP9000CUSA07410_00
      );
      
      if (isPSProductId) return true;
    }
    
    // Otherwise, check if it's a valid URL
    try {
      const url = new URL(gameUrl);
      if (platform === 'Steam') {
        return url.hostname.includes('steampowered.com');
      } else {
        return url.hostname.includes('playstation.com');
      }
    } catch (e) {
      return false;
    }
  };
  
  const canFetchGame = isValidUrl();
  const canAddToCart = gameData !== null;
  
  // Fetch game data from URL
  const handleFetchGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canFetchGame) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await onFetchGame(gameUrl);
      setGameData(data);
    } catch (err: any) {
      console.error('Game fetch error:', err);
      
      // Handle different error types with more specific messages
      if (err.response) {
        // Server responded with an error status code
        if (err.response.status === 404) {
          setError(`API endpoint not found (404). Check that the API server is running at http://localhost:5001.`);
        } else {
          setError(`Server error (${err.response.status}): ${err.response.data?.message || err.message}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error: Could not connect to the API server. Make sure the server is running at http://localhost:5001.');
      } else {
        // Error in setting up the request
        setError(`Error: ${err.message || 'Failed to fetch game data. Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add game to cart
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddToCart) return;
    
    setIsLoading(true);
    
    try {
      // Create a cart item with all necessary game details
      addToCart({
        id: `${platform}-Game-${gameData!.title}-${Date.now()}`,
        name: gameData!.title,
        type: 'Game',
        amount: platform === 'Steam' ? 'Steam Game' : 'PlayStation Game',
        price: gameData!.discounted,
        image: platform === 'Steam' ? '🎲' : '🎮',
        // Store additional details needed for checkout in the cart item
        gameDetails: {
          originalUrl: gameData!.originalUrl || gameUrl, // Original URL as entered by the user
          normalizedUrl: gameData!.url, // Normalized URL returned from the API
          platform: platform,
          originalPrice: gameData!.price,
          imageUrl: gameData!.image,
          productType: gameData!.productType
        }
      });
      
      // Show feedback
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
        navigate('/cart');
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setGameUrl('');
    setGameData(null);
    setAddedToCart(false);
    setError(null);
  };
  
  return (
    <div className={`${isDarkMode ? 'bg-black/70' : 'bg-glass'} backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-lg`}>
      <div className="flex items-center mb-6">
        {platform === 'Steam' ? (
          <Monitor className="w-6 h-6 mr-3 text-[#1b2838]" />
        ) : (
          <Gamepad2 className="w-6 h-6 mr-3 text-[#006FCD]" />
        )}
        <h2 className={`text-xl font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
          {platform === 'Steam' ? 'Steam Game' : 'PlayStation Game'} Order
        </h2>
      </div>
      
      {addedToCart ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-accent" />
          </div>
          <h3 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Added to Cart!
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
            Redirecting to checkout...
          </p>
        </motion.div>
      ) : (
        <>
          {!gameData ? (
            <form onSubmit={handleFetchGame} className="space-y-6">
              <div>
                <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                  {platform === 'Steam' ? 'Steam' : 'PlayStation'} Game URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon className={`w-5 h-5 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`} />
                  </div>
                  <input
                    type="text"
                    value={gameUrl}
                    onChange={(e) => setGameUrl(e.target.value)}
                    className={`bg-white/5 border border-white/10 text-sm rounded-lg block w-full pl-10 p-3 ${
                      isDarkMode ? 'text-textLight placeholder-textLight/30' : 'text-textDark placeholder-textDark/30'
                    } focus:outline-none focus:ring-2 focus:ring-accent/50`}
                    placeholder={platform === 'Steam' 
                      ? 'Paste Steam game URL here'
                      : 'Paste PlayStation game URL or product ID here'
                    }
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {platform === 'Steam' 
                    ? 'Example: https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/'
                    : 'Examples: \n• https://store.playstation.com/en-gb/product/EP9000-PPSA01284_00-0000000000000000\n• https://store.playstation.com/de-de/product/EP9000-PPSA01284_00-0000000000000000\n• EP9000-PPSA01284_00-0000000000000000 (just the product ID)'
                  }
                </p>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-sm text-red-500">{error}</p>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!canFetchGame || isLoading}
                type="submit"
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                  canFetchGame && !isLoading
                    ? 'bg-accent text-white hover:bg-accent/90'
                    : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Fetching Game Data...
                  </>
                ) : (
                  <>Check Game Price</>
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleAddToCart} className="space-y-6">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl overflow-hidden border border-white/10 mb-6"
                >
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img 
                      src={gameData.image} 
                      alt={gameData.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                      {gameData.productType}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className={`font-medium text-lg mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      {gameData.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                        Original price:
                      </span>
                      <span className={`text-sm line-through ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                        {formatPrice(gameData.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                        Your price (40%):
                      </span>
                      <span className="text-price font-bold">
                        {formatPrice(gameData.discounted)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-sm text-red-500">{error}</p>
                </motion.div>
              )}
              
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 border border-white/10 rounded-lg font-medium bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!canAddToCart || isLoading}
                  type="submit"
                  className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center ${
                    canAddToCart && !isLoading
                      ? 'bg-accent text-white hover:bg-accent/90'
                      : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default GameOrderForm; 