import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import GameOrderForm from '../../components/GameOrderForm';
import { fetchSteamProduct } from '../../firebase/gamePriceService';

// Steam game data
const STEAM_GAMES = [
  { 
    id: 'rdr2', 
    name: 'Red Dead Redemption 2', 
    price: '59.99', 
    discountedPrice: '23.99', 
    currency: '£', 
    image: 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg',
    description: 'America, 1899. The end of the Wild West era has begun. After a robbery goes badly wrong in the western town of Blackwater, Arthur Morgan and the Van der Linde gang are forced to flee.',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    releaseDate: 'October 26, 2018',
    genre: ['Action', 'Adventure', 'Open World'],
    rating: 'PEGI 18',
    appId: '1174180'
  },
  { 
    id: 'elden-ring', 
    name: 'Elden Ring', 
    price: '49.99', 
    discountedPrice: '19.99', 
    currency: '£', 
    image: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
    description: 'A new fantasy action RPG from the creators of Dark Souls, Bloodborne, and Sekiro. Journey through the vast Lands Between in this open-world adventure.',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    releaseDate: 'February 25, 2022',
    genre: ['Action RPG', 'Open World'],
    rating: 'PEGI 16',
    appId: '1245620'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk 2077', 
    price: '39.99', 
    discountedPrice: '15.99', 
    currency: '£', 
    image: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
    description: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    releaseDate: 'December 10, 2020',
    genre: ['RPG', 'Open World', 'Action'],
    rating: 'PEGI 18',
    appId: '1091500'
  },
  { 
    id: 'gta5', 
    name: 'Grand Theft Auto V', 
    price: '29.99', 
    discountedPrice: '11.99', 
    currency: '£', 
    image: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png',
    description: 'Experience the blockbuster hit that changed the gaming industry. Explore Los Santos and Blaine County in this open-world action game.',
    developer: 'Rockstar North',
    publisher: 'Rockstar Games',
    releaseDate: 'September 17, 2013',
    genre: ['Action', 'Adventure', 'Open World'],
    rating: 'PEGI 18',
    appId: '271590'
  },
  { 
    id: 'resident-evil-4', 
    name: 'Resident Evil 4 Remake', 
    price: '49.99', 
    discountedPrice: '19.99', 
    currency: '£', 
    image: 'https://upload.wikimedia.org/wikipedia/en/d/df/Resident_Evil_4_remake_cover_art.jpg',
    description: 'Survival is just the beginning. Six years after the biological disaster in Raccoon City, Leon S. Kennedy is sent to a rural village in Spain to rescue the president\'s kidnapped daughter.',
    developer: 'Capcom',
    publisher: 'Capcom',
    releaseDate: 'March 24, 2023',
    genre: ['Survival Horror', 'Action'],
    rating: 'PEGI 18',
    appId: '2050650'
  },
  { 
    id: 'baldurs-gate', 
    name: "Baldur's Gate 3", 
    price: '59.99', 
    discountedPrice: '23.99', 
    currency: '£', 
    image: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Baldur%27s_Gate_3_cover_art.jpg',
    description: 'An epic RPG set in the Forgotten Realms. Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.',
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    releaseDate: 'August 3, 2023',
    genre: ['RPG', 'Turn-based Strategy'],
    rating: 'PEGI 18',
    appId: '1086940'
  }
];

// Steam URL game data type
interface SteamURLGame {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  currency: string;
  image: string;
  url: string;
  platform: string;
}

const SteamGamesPage = () => {
  const { isDarkMode } = useTheme();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customGameName, setCustomGameName] = useState('');
  const [customItemInCart, setCustomItemInCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlGame, setUrlGame] = useState<SteamURLGame | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Filter games based on search query
  const filteredGames = searchQuery 
    ? STEAM_GAMES.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        game.developer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : STEAM_GAMES;
  
  // Get selected game details
  const gameDetails = selectedGame 
    ? STEAM_GAMES.find(game => game.id === selectedGame) 
    : null;
  
  // Calculate custom price (40% of input price)
  const calculateCustomPrice = (url: string) => {
    // Extract price from URL
    // This is a simple implementation - in reality, you might want to fetch the page and parse it
    const priceRegex = /£(\d+\.\d+)|\$(\d+\.\d+)|(\d+\.\d+)€|(\d+\.\d+)/;
    const match = url.match(priceRegex);
    
    if (match) {
      // Find the first non-undefined capture group
      const priceStr = match.slice(1).find(m => m !== undefined);
      if (priceStr) {
        const originalPrice = parseFloat(priceStr);
        return (originalPrice * 0.4).toFixed(2);
      }
    }
    
    // If no price is found in the URL, try to parse the input directly as a price
    const directPrice = parseFloat(url);
    if (!isNaN(directPrice)) {
      return (directPrice * 0.4).toFixed(2);
    }
    
    return '';
  };
  
  // Handle custom URL input
  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract game name from URL
    let gameName = "Custom Game";
    const urlObj = (() => {
      try {
        return new URL(customUrl);
      } catch {
        return null;
      }
    })();
    
    if (urlObj) {
      // Try to extract game name from URL path
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const possibleName = pathParts[pathParts.length - 1]
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split('.')
          .shift();
        
        if (possibleName && possibleName.length > 2) {
          gameName = possibleName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
      }
    }
    
    setCustomGameName(gameName);
    setCustomPrice(calculateCustomPrice(customUrl));
    setCustomItemInCart(false);
  };
  
  // Add custom item to cart
  const addCustomItemToCart = () => {
    if (customPrice && customGameName) {
      // Use the actual cart context to add the item
      addToCart({
        id: `custom-steam-${customGameName}-${Date.now()}`,
        name: customGameName,
        type: 'Steam Game',
        amount: 'Steam Key',
        price: parseFloat(customPrice),
        image: '🎮'
      });
      
      // Show feedback
      setCustomItemInCart(true);
      
      // Clear the form after 2 seconds
      setTimeout(() => {
        setCustomUrl('');
        setCustomPrice('');
        setCustomGameName('');
        setCustomItemInCart(false);
      }, 2000);
    }
  };
  
  // Try with an alternative proxy
  const fetchWithFallbackProxy = (appId: string) => {
    // Use a different CORS proxy as a fallback
    const fallbackProxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}`)}`;
    
    return fetch(fallbackProxyUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      });
  };

  // Process game data from API response
  const processGameData = (gameData: any, appId: string) => {
    try {
      // Extract needed info
      const name = gameData.name;
      
      // Handle price information
      let originalPrice = 0;
      let currency = 'GBP';
      
      if (gameData.price_overview) {
        originalPrice = gameData.price_overview.initial / 100;
        currency = gameData.price_overview.currency;
      } else if (gameData.is_free) {
        originalPrice = 0;
      } else {
        // If no price info is available, use a fallback price
        originalPrice = Math.floor(Math.random() * 50) + 10;
      }
      
      // Calculate discount (40% of original)
      const discountedPrice = originalPrice * 0.4;
      
      // Use the game's header image if available
      const imageUrl = gameData.header_image || 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg';
      
      const newGame: SteamURLGame = {
        id: `steam-${appId}`,
        name: name,
        price: originalPrice,
        discountedPrice: discountedPrice,
        currency: currency,
        image: imageUrl,
        url: `https://store.steampowered.com/app/${appId}`,
        platform: 'Steam'
      };
      
      return newGame;
    } catch (error) {
      console.error('Error processing game data:', error);
      return null;
    }
  };

  // Load Steam game data from API
  const loadGameDataFromSteam = async (appId: string) => {
    try {
      // Create proxy URL to avoid CORS issues
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}`)}`;
      
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        // Parse the response
        const content = JSON.parse(data.contents);
        
        if (!content[appId] || !content[appId].success) {
          throw new Error('Failed to get game data from Steam');
        }
        
        return processGameData(content[appId].data, appId);
      } catch (error) {
        console.error('Error fetching game data with primary proxy:', error);
        // Try with fallback proxy
        console.log('Trying fallback proxy...');
        
        const data = await fetchWithFallbackProxy(appId);
        if (!data[appId] || !data[appId].success) {
          throw new Error('Failed to get game data from Steam');
        }
        
        return processGameData(data[appId].data, appId);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
      return null;
    }
  };

  // Handle URL input for the custom game price calculator
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!customUrl) {
      setError('Please enter a Steam store URL');
      return;
    }
    
    // Check if it's a Steam URL
    if (!customUrl.includes('store.steampowered.com')) {
      setError('Please enter a valid Steam store URL (e.g., https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/)');
      return;
    }
    
    // Check if it contains app ID in the URL
    if (!customUrl.includes('/app/')) {
      setError('URL must be for a specific game (e.g., https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Extract app ID from URL using regex
      const appIdMatch = customUrl.match(/app\/(\d+)/);
      if (!appIdMatch || !appIdMatch[1]) {
        setError('Could not extract Steam app ID from URL. Please make sure you entered a valid Steam store URL.');
        setIsLoading(false);
        return;
      }
      
      const appId = appIdMatch[1];
      console.log('Extracted app ID:', appId);
      
      loadGameDataFromSteam(appId).then(game => {
        if (game) {
          setUrlGame(game);
          setAddedToCart(false);
        } else {
          setError('Could not retrieve game data. Please try a different Steam game URL.');
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing the URL. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Add game to cart
  const handleAddToCart = () => {
    if (urlGame) {
      addToCart({
        id: urlGame.id,
        name: urlGame.name,
        type: 'Steam Game',
        amount: 'Steam Key',
        price: urlGame.discountedPrice,
        image: urlGame.image
      });
      
      setAddedToCart(true);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };
  
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <MotionWrapper variant="bouncyFadeIn" className="mb-10">
          <div className={`bg-glass backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg ${isDarkMode ? 'bg-opacity-20' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl">
                <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Steam Games
                </h1>
                <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                  Get Steam games at 40% of the original price. Paste any Steam game link to check the price and place an order.
                </p>
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Game Order Form */}
          <div className="lg:col-span-1">
            <GameOrderForm 
              platform="Steam" 
              onFetchGame={fetchSteamProduct} 
            />
          </div>
          
          {/* How It Works */}
          <div className="lg:col-span-2">
            <div className={`${isDarkMode ? 'bg-black/70' : 'bg-glass'} backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-lg h-full`}>
              <h2 className={`text-xl font-medium mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                How It Works
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Paste a Steam Game URL
                    </h3>
                    <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      Find any game on the Steam store and copy the URL. Paste it into the form to check the discounted price.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Confirm Your Order
                    </h3>
                    <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      Review the game details and the discounted price (40% of original). Enter your email and any special requests.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Complete Payment
                    </h3>
                    <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      After placing your order, you'll receive payment instructions via email. Once payment is confirmed, we'll process your order.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Receive Your Game
                    </h3>
                    <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      We'll send the Steam key or gift link to your email. You can then activate the game on your Steam account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Steam Games */}
        <MotionWrapper variant="bouncySlideUp" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Featured Steam Games
            </h2>
            
            {/* Search Input */}
            <div className="relative max-w-xs">
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl ${
                  isDarkMode ? 'text-textLight placeholder-textLight/50' : 'text-textDark placeholder-textDark/50'
                } focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className={`h-5 w-5 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`${isDarkMode ? 'bg-black/70' : 'bg-glass'} backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg`}>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredGames.map((game, index) => (
                <motion.div 
                  key={index} 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className={`${isDarkMode ? 'bg-gradient-to-br from-white/5 to-white/10' : 'bg-gradient-to-br from-white/20 to-white/30'} rounded-xl overflow-hidden border border-white/10 shadow-lg block h-full`}
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5">
                      <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{game.name}</h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Steam Key</p>
                      <div className="flex items-end gap-2">
                        <span className="text-price font-bold text-2xl">{formatPrice(game.discountedPrice)}</span>
                        <span className={`text-sm line-through ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                          {formatPrice(game.price)}
                        </span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.open(`https://store.steampowered.com/app/${game.appId}`)}
                        className="w-full mt-3 py-2.5 bg-accent text-textLight rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                      >
                        View on Steam
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </MotionWrapper>
        
        {/* FAQ Section */}
        <MotionWrapper variant="bouncyFadeIn">
          <div className={`${isDarkMode ? 'bg-black/70' : 'bg-glass'} backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  How do I receive my Steam game?
                </h3>
                <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                  After your payment is confirmed, we'll send the Steam key or gift link to your email. You can then activate the game on your Steam account.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Why are the games so much cheaper?
                </h3>
                <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                  We purchase games in regions with lower pricing (primarily Turkey) and pass those savings on to you. This is why you get games at around 40% of the original price.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Are there any region restrictions?
                </h3>
                <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                  Most Steam keys are region-free and can be activated worldwide. If there are any region restrictions, we'll inform you before processing your order.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  How long does delivery take?
                </h3>
                <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                  For most orders, we deliver within 24 hours after payment confirmation. During high-demand periods, it might take up to 48 hours.
                </p>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </div>
  );
};

export default SteamGamesPage; 