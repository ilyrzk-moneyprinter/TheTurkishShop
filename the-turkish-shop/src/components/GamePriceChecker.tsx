import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

// Type for the game data returned from the API
interface GameData {
  title: string;
  image: string;
  price: number;
  discounted: number;
  currency: string;
  platform: string;
  url: string;
}

interface GamePriceCheckerProps {
  // Add any props here if needed
}

/**
 * Game Price Checker Component
 * 
 * A React component that allows users to enter a Steam or PlayStation Store URL
 * and view the discounted price for the game.
 */
const GamePriceChecker: React.FC<GamePriceCheckerProps> = () => {
  const { isDarkMode } = useTheme();
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!url) {
      setError('Please enter a game URL');
      return;
    }
    
    // Check if it's a Steam or PlayStation URL
    if (!url.includes('store.steampowered.com') && !url.includes('store.playstation.com')) {
      setError('Please enter a valid Steam or PlayStation Store URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make the API call directly to the appropriate API
      let platform: string;
      if (url.includes('store.steampowered.com')) {
        platform = 'Steam';
      } else if (url.includes('store.playstation.com')) {
        platform = 'PlayStation';
      } else {
        platform = 'Unknown';
      }
      
      // For demo purposes, simulate the API call with mock data
      // In a real implementation, this would call a proper API
      setTimeout(() => {
        const mockData: GameData = {
          title: platform === 'Steam' ? 'Steam Game' : 'PlayStation Game',
          image: platform === 'Steam' 
            ? 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg'
            : 'https://image.api.playstation.com/cdn/UP9000/CUSA07408_00/0cQ70KkYWtDOwV76XW3a5zrZZBR4zEV9.png',
          price: platform === 'Steam' ? 59.99 : 69.99,
          discounted: platform === 'Steam' ? 23.99 : 27.99,
          currency: 'GBP',
          platform: platform,
          url: url
        };
        
        setGameData(mockData);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      // Handle the error and show user-friendly message
      setError('An error occurred while fetching game data. Please try again.');
      setIsLoading(false);
    }
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Format price with currency symbol
  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€'
    };
    
    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${price.toFixed(2)}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-black/20 backdrop-blur-xl border border-white/10' 
            : 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg'
        }`}
      >
        <motion.h2 
          variants={itemVariants}
          className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Game Price Checker
        </motion.h2>
        
        <motion.p 
          variants={itemVariants}
          className={`mb-6 ${
            isDarkMode ? 'text-white/80' : 'text-gray-600'
          }`}
        >
          Enter a Steam or PlayStation Store URL to check the discounted Turkish price.
        </motion.p>
        
        <motion.form 
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://store.steampowered.com/app/XXX or https://store.playstation.com/product/XXX"
              className={`flex-grow px-4 py-3 rounded-xl ${
                isDarkMode 
                  ? 'bg-white/5 border border-white/10 text-white placeholder-white/40' 
                  : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-accent/50`}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                isDarkMode
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-accent text-white hover:bg-accent/90'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Checking...' : 'Check Price'}
            </motion.button>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}
        </motion.form>
        
        <AnimatePresence mode="wait">
          {gameData && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl overflow-hidden ${
                isDarkMode 
                  ? 'bg-white/5 border border-white/10' 
                  : 'bg-white border border-gray-100 shadow-md'
              }`}
            >
              <div className="aspect-video w-full bg-gray-900 overflow-hidden relative">
                {gameData.image && (
                  <img 
                    src={gameData.image} 
                    alt={gameData.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div 
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                    gameData.platform === 'Steam' 
                      ? 'bg-[#1b2838] text-white' 
                      : 'bg-[#006FCD] text-white'
                  }`}
                >
                  {gameData.platform}
                </div>
              </div>
              
              <div className="p-5">
                <h3 
                  className={`text-xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {gameData.title}
                </h3>
                
                <div className={`text-sm mb-4 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Turkish Region
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-3 sm:mb-0">
                    <div className={`text-xs mb-1 ${
                      isDarkMode ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      Original Price
                    </div>
                    <div className={`text-lg line-through ${
                      isDarkMode ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      {formatPrice(gameData.price, gameData.currency)}
                    </div>
                  </div>
                  
                  <div>
                    <div className={`text-xs mb-1 ${
                      isDarkMode ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      Turkish Price (60% Off)
                    </div>
                    <div className="text-2xl font-bold text-price">
                      {formatPrice(gameData.discounted, gameData.currency)}
                    </div>
                  </div>
                </div>
                
                <motion.a
                  href={gameData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-4 block w-full py-3 rounded-lg text-center font-medium ${
                    gameData.platform === 'Steam'
                      ? 'bg-[#1b2838] text-white hover:bg-[#2a4059]'
                      : 'bg-[#006FCD] text-white hover:bg-[#0082ef]'
                  } transition-colors`}
                >
                  View on {gameData.platform}
                </motion.a>
              </div>
            </motion.div>
          )}
          
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <div className="loader">
                <div className={`w-12 h-12 rounded-full border-4 border-t-accent ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                } animate-spin`}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GamePriceChecker; 