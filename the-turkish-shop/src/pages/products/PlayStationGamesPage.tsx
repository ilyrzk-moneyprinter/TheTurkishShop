import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import GameOrderForm from '../../components/GameOrderForm';
import { fetchPlayStationProduct } from '../../firebase/gamePriceService';

// PlayStation game data
const PLAYSTATION_GAMES = [
  {
    id: 'god-of-war',
    name: 'God of War Ragnarok',
    price: '69.99',
    discountedPrice: '27.99',
    currency: '£',
    image: 'https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg',
    description: 'Join Kratos and Atreus on a mythic journey for answers before Ragnarök arrives. Together, father and son must put everything on the line as they journey to each of the Nine Realms.',
    developer: 'Santa Monica Studio',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: 'November 9, 2022',
    genre: ['Action', 'Adventure'],
    rating: 'PEGI 18',
    productId: 'EP9000-PPSA08330_00-GOWRAGNAROK00000'
  },
  {
    id: 'spider-man-2',
    name: 'Spider-Man 2',
    price: '69.99',
    discountedPrice: '27.99',
    currency: '£',
    image: 'https://upload.wikimedia.org/wikipedia/en/e/ef/Spider-Man_2_Game_Cover.jpg',
    description: 'Spider-Men, Peter Parker and Miles Morales, return for an exciting new adventure in the critically acclaimed Marvel\'s Spider-Man franchise for PlayStation 5.',
    developer: 'Insomniac Games',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: 'October 20, 2023',
    genre: ['Action', 'Adventure', 'Open World'],
    rating: 'PEGI 16',
    productId: 'EP9000-PPSA08595_00-SPIDERMANPS5SIEA'
  },
  {
    id: 'horizon',
    name: 'Horizon Forbidden West',
    price: '59.99',
    discountedPrice: '23.99',
    currency: '£',
    image: 'https://upload.wikimedia.org/wikipedia/en/6/69/Horizon_Forbidden_West_cover_art.jpg',
    description: 'Join Aloy as she braves the Forbidden West – a majestic but dangerous frontier that conceals mysterious new threats.',
    developer: 'Guerrilla Games',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: 'February 18, 2022',
    genre: ['Action RPG', 'Open World'],
    rating: 'PEGI 16',
    productId: 'EP9000-PPSA01521_00-FORBIDDENWEST000'
  },
  {
    id: 'tlou2',
    name: 'The Last of Us Part II',
    price: '39.99',
    discountedPrice: '15.99',
    currency: '£',
    image: 'https://upload.wikimedia.org/wikipedia/en/4/4f/The_Last_of_Us_Part_II.jpg',
    description: 'Five years after their dangerous journey across the post-pandemic United States, Ellie and Joel have settled down in Jackson, Wyoming. Living amongst a thriving community of survivors has allowed them peace and stability, despite the constant threat of the infected and other, more desperate survivors.',
    developer: 'Naughty Dog',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: 'June 19, 2020',
    genre: ['Action', 'Adventure', 'Survival Horror'],
    rating: 'PEGI 18',
    productId: 'EP9000-CUSA10249_00-THELASTOFUSPART2'
  },
  {
    id: 'ghost-of-tsushima',
    name: 'Ghost of Tsushima',
    price: '49.99',
    discountedPrice: '19.99',
    currency: '£',
    image: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Ghost_of_Tsushima.jpg',
    description: 'In the late 13th century, the Mongol empire has laid waste to entire nations along their campaign to conquer the East. Tsushima Island is all that stands between mainland Japan and a massive Mongol invasion fleet led by the ruthless and cunning general, Khotun Khan.',
    developer: 'Sucker Punch Productions',
    publisher: 'Sony Interactive Entertainment',
    releaseDate: 'July 17, 2020',
    genre: ['Action', 'Adventure', 'Open World'],
    rating: 'PEGI 18',
    productId: 'EP9000-CUSA13323_00-GHOSTSHIP0000000'
  },
  {
    id: 'ff16',
    name: 'Final Fantasy XVI',
    price: '69.99',
    discountedPrice: '27.99',
    currency: '£',
    image: 'https://upload.wikimedia.org/wikipedia/en/9/9d/Final_Fantasy_XVI_cover.jpg',
    description: 'The 16th standalone entry in the legendary Final Fantasy series. Experience an epic dark fantasy world where the fate of the land is decided by the mighty Eikons and the Dominants who wield them.',
    developer: 'Square Enix',
    publisher: 'Square Enix',
    releaseDate: 'June 22, 2023',
    genre: ['Action RPG', 'Fantasy'],
    rating: 'PEGI 18',
    productId: 'EP0082-PPSA05170_00-FF16SIEA00000000'
  }
];

// PlayStation URL game data type
interface PSURLGame {
  id: string;
  name: string;
  price: number;
  discountedPrice: number;
  currency: string;
  image: string;
  url: string;
  platform: string;
}

const PlayStationGamesPage = () => {
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
  const [urlGame, setUrlGame] = useState<PSURLGame | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Filter games based on search query
  const filteredGames = searchQuery 
    ? PLAYSTATION_GAMES.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        game.developer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : PLAYSTATION_GAMES;
  
  // Get selected game details
  const gameDetails = selectedGame 
    ? PLAYSTATION_GAMES.find(game => game.id === selectedGame) 
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
        id: `custom-ps-${customGameName}-${Date.now()}`,
        name: customGameName,
        type: 'PlayStation Game',
        amount: 'Digital Code',
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
  const fetchWithFallbackProxy = (url: string) => {
    // Use a different CORS proxy as a fallback
    const fallbackProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    return fetch(fallbackProxyUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      });
  };

  // Process game data from API response
  const processGameData = (gameData: any, productId: string) => {
    try {
      // Extract needed info - in a real implementation, you would parse the PS Store data
      // This is a simplified version since PS Store doesn't have a public API
      const urlMatch = customUrl.match(/\/([^\/]+)\/product\/([^\/]+)/);
      let title = "PlayStation Game";
      
      if (urlMatch && urlMatch[2]) {
        title = urlMatch[2]
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split('.')
          .shift() || title;
          
        title = title
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
      
      // Extract price from URL or input
      const priceRegex = /£(\d+\.\d+)|\$(\d+\.\d+)|(\d+\.\d+)€|(\d+\.\d+)/;
      const match = customUrl.match(priceRegex);
      let originalPrice = 0;
      let currency = 'GBP';
      
      if (match) {
        // Find the first non-undefined capture group
        const priceStr = match.slice(1).find(m => m !== undefined);
        if (priceStr) {
          originalPrice = parseFloat(priceStr);
        }
      } else {
        // If no price is found, use a fallback price based on game title
        // More expensive for new titles, cheaper for older ones
        if (title.toLowerCase().includes('2023') || title.toLowerCase().includes('2022')) {
          originalPrice = 69.99;
        } else if (title.toLowerCase().includes('2021')) {
          originalPrice = 49.99;
        } else {
          originalPrice = 39.99;
        }
      }
      
      // Calculate discount (40% of original)
      const discountedPrice = originalPrice * 0.4;
      
      // Try to extract image from URL metadata or use a default
      const defaultImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PlayStation_logo.svg/2560px-PlayStation_logo.svg.png';
      
      const newGame: PSURLGame = {
        id: `ps-${productId || Date.now()}`,
        name: title,
        price: originalPrice,
        discountedPrice: discountedPrice,
        currency: currency,
        image: defaultImage,
        url: customUrl,
        platform: 'PlayStation'
      };
      
      return newGame;
    } catch (error) {
      console.error('Error processing game data:', error);
      return null;
    }
  };

  // Load PlayStation game data from API
  const loadGameDataFromPS = async (url: string) => {
    try {
      // In a real implementation, you would fetch data from the PlayStation Store
      // However, PlayStation doesn't offer a public API, so we'll extract information from the URL
      // and use some basic logic to simulate the response
      
      // Extract product ID from URL
      const productIdMatch = url.match(/\/([^\/]+)\/product\/([^\/]+)/);
      let productId = '';
      
      if (productIdMatch && productIdMatch[2]) {
        productId = productIdMatch[2];
      }
      
      // Simulate API call
      return new Promise<PSURLGame | null>((resolve) => {
        setTimeout(() => {
          const gameData = processGameData({}, productId);
          resolve(gameData);
        }, 1000);
      });
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
      setError('Please enter a PlayStation Store URL');
      return;
    }
    
    // Check if it's a PlayStation URL
    if (!customUrl.includes('store.playstation.com')) {
      setError('Please enter a valid PlayStation Store URL (e.g., https://store.playstation.com/en-gb/product/EP9000-PPSA08330_00-GOWRAGNAROK00000)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      loadGameDataFromPS(customUrl).then(game => {
        if (game) {
          setUrlGame(game);
          setAddedToCart(false);
        } else {
          setError('Could not retrieve game data. Please try a different PlayStation game URL.');
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
        type: 'PlayStation Game',
        amount: 'PS Code',
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
                  PlayStation Games
                </h1>
                <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                  Get PlayStation games at 40% of the original price. Paste any PlayStation Store link to check the price and place an order.
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
              platform="PSN" 
              onFetchGame={fetchPlayStationProduct} 
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
                      Paste a PlayStation Store URL
                    </h3>
                    <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                      Find any game on the PlayStation Store and copy the URL. Paste it into the form to check the discounted price.
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
                      We'll send the PlayStation Store code to your email. You can then redeem it on your PlayStation account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured PlayStation Games */}
        <MotionWrapper variant="bouncySlideUp" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Featured PlayStation Games
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
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>PlayStation Digital Code</p>
                      <div className="flex items-end gap-2">
                        <span className="text-price font-bold text-2xl">{formatPrice(game.discountedPrice)}</span>
                        <span className={`text-sm line-through ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                          {formatPrice(game.price)}
                        </span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.open(`https://store.playstation.com/en-gb/search/${encodeURIComponent(game.name)}`)}
                        className="w-full mt-3 py-2.5 bg-accent text-textLight rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                      >
                        View on PlayStation Store
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
                  How do I receive my PlayStation game?
                </h3>
                <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                  After your payment is confirmed, we'll send the PlayStation digital code to your email. You can then redeem it on your PlayStation account.
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
                  PlayStation codes are region-specific. We provide codes that work with EU/UK accounts. If you have a different region account, please mention it in your order notes.
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

export default PlayStationGamesPage; 