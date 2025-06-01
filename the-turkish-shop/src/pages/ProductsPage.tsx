import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import MotionWrapper from '../components/animations/MotionWrapper';
import PlatformIcon from '../components/PlatformIcon';
import { Monitor, Gamepad2, Smartphone, Music, Coins, Package, Gift, AlertCircle } from 'lucide-react';
import { getAllProducts, Product } from '../firebase/productService';

// Import game icons
import BrawlStarsIcon from '../assets/icons/brawlstars.webp';
import CODIcon from '../assets/icons/cod.webp';
import DiscordNitroIcon from '../assets/icons/Nitro.webp';
import RobuxIcon from '../assets/icons/robux.webp';
import SpotifyPremiumIcon from '../assets/icons/Spotify-Premium.webp';
import ValorantIcon from '../assets/icons/valorant.png';
import VBucksIcon from '../assets/icons/Vbucks.webp';
import FIFAIcon from '../assets/icons/fifa.png';
import R6Icon from '../assets/icons/R6.webp';

// Use direct URLs for icons with issues
const ApexCoinsIcon = 'https://cdn.freebiesupply.com/logos/large/2x/apex-coins-logo-png-transparent.png';

// Product categories
const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🛒' },
  { id: 'games', name: 'Game Currency', icon: '🎮' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '🎵' },
  { id: 'steam', name: 'Steam Games', icon: '🎲' },
  { id: 'playstation', name: 'PlayStation', icon: '🎯' },
  { id: 'other', name: 'Other', icon: '📦' }
];

// Define the Platform type
interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  path?: string;
}

// Game platforms with proper icons
const PLATFORMS: Platform[] = [
  { id: 'pc', name: 'PC Games', icon: 'PC', color: '#1b2838', path: '/products/pc-games' },
  { id: 'console', name: 'Console', icon: 'PlayStation', color: '#006FCD', path: '/products/console-games' },
  { id: 'mobile', name: 'Mobile Games', icon: 'Mobile', color: '#F2662F' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'Discord', color: '#1DB954' },
  { id: 'gamesdlcs', name: 'Games/DLCs', icon: 'Steam', color: '#FF9900' },
  { id: 'other', name: 'Other Products', icon: 'PC', color: '#FF6B6B' }
];

// Gaming products
const GAMING_PRODUCTS = products.filter(p => 
  ['Fortnite V-Bucks', 'FIFA Points', 'Rainbow Six Credits', 'Apex Legends Coins', 'Brawl Stars Gems', 'Valorant Points', 'Call of Duty Points', 'Roblox Robux'].includes(p.name)
);

// Subscription products
const SUBSCRIPTION_PRODUCTS = products.filter(p => 
  ['Spotify Premium', 'Discord Nitro'].includes(p.name)
);

// Steam products (placeholder - would come from real data)
const STEAM_PRODUCTS = [
  { name: 'Red Dead Redemption 2', price: '59.99', discountedPrice: '23.99', currency: '£', image: 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg' },
  { name: 'Elden Ring', price: '49.99', discountedPrice: '19.99', currency: '£', image: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg' },
  { name: 'Cyberpunk 2077', price: '39.99', discountedPrice: '15.99', currency: '£', image: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg' }
];

// PlayStation products (placeholder - would come from real data)
const PLAYSTATION_PRODUCTS = [
  { name: 'God of War Ragnarok', price: '69.99', discountedPrice: '27.99', currency: '£', image: 'https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg' },
  { name: 'Spider-Man 2', price: '69.99', discountedPrice: '27.99', currency: '£', image: 'https://upload.wikimedia.org/wikipedia/en/e/ef/Spider-Man_2_Game_Cover.jpg' },
  { name: 'Horizon Forbidden West', price: '59.99', discountedPrice: '23.99', currency: '£', image: 'https://upload.wikimedia.org/wikipedia/en/6/69/Horizon_Forbidden_West_cover_art.jpg' }
];

// PC Games products
const PC_GAMES_PRODUCTS = products.filter(p => 
  ['Fortnite V-Bucks', 'Valorant Points', 'Call of Duty Points', 'Apex Legends Coins', 'FIFA Points', 'Rainbow Six Credits', 'Roblox Robux'].includes(p.name)
);

// Console Games products
const CONSOLE_GAMES_PRODUCTS = products.filter(p => 
  ['Fortnite V-Bucks', 'FIFA Points', 'Rainbow Six Credits', 'Roblox Robux', 'Apex Legends Coins', 'Valorant Points', 'Call of Duty Points'].includes(p.name)
);

// Mobile Games products
const MOBILE_GAMES_PRODUCTS = products.filter(p => 
  ['Call of Duty Points', 'Brawl Stars Gems', 'Roblox Robux'].includes(p.name)
);

// Define a type for game products
interface GameProduct {
  name: string;
  price: string;
  discountedPrice: string;
  currency: string;
  image: string;
  platform: string;
}

// Games/DLCs category (combines Steam and PlayStation)
const GAMES_DLCS_PRODUCTS: GameProduct[] = [
  ...STEAM_PRODUCTS.map(game => ({...game, platform: 'Steam'})),
  ...PLAYSTATION_PRODUCTS.map(game => ({...game, platform: 'PlayStation'}))
];

// Other products
const OTHER_PRODUCTS = products.filter(p => 
  ['Roblox Robux'].includes(p.name)
);

// Convert product name to URL slug
const getProductSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Get product URL based on product name
const getProductUrl = (product: typeof products[0]) => {
  // Special cases for products with dedicated pages
  if (product.name === 'Spotify Premium') {
    return '/products/spotify-premium';
  }
  if (product.name === 'Discord Nitro') {
    return '/products/discord-nitro';
  }
  
  // Default case: use the slug
  return `/products/${getProductSlug(product.name)}`;
};

// Get the correct icon for a product
const getProductIcon = (productName: string) => {
  switch (productName) {
    case 'Fortnite V-Bucks':
      return VBucksIcon;
    case 'FIFA Points':
      return FIFAIcon;
    case 'Rainbow Six Credits':
      return R6Icon;
    case 'Apex Legends Coins':
      return ApexCoinsIcon;
    case 'Brawl Stars Gems':
      return BrawlStarsIcon;
    case 'Valorant Points':
      return ValorantIcon;
    case 'Call of Duty Points':
      return CODIcon;
    case 'Discord Nitro':
      return DiscordNitroIcon;
    case 'Spotify Premium':
      return SpotifyPremiumIcon;
    case 'Roblox Robux':
      return RobuxIcon;
    default:
      return 'https://via.placeholder.com/150';
  }
};

const ProductsPage = () => {
  const { isDarkMode } = useTheme();
  const { formatPrice, currency } = useCurrency();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Firebase on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await getAllProducts();
      setDbProducts(fetchedProducts.filter(p => p.inStock));
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Using default products.');
    } finally {
      setLoading(false);
    }
  };

  // Get products to display based on active category and search query
  const getFilteredProducts = () => {
    // First, check if we have database products
    const hasDbProducts = dbProducts.length > 0;
    
    // Combine static products with database products
    const allAvailableProducts = hasDbProducts ? dbProducts : [];
    
    let filteredProducts;
    switch (activeCategory) {
      case 'games':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.type === 'game' || p.type === 'currency');
        } else {
        filteredProducts = GAMING_PRODUCTS;
        }
        break;
      case 'subscriptions':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.type === 'subscription');
        } else {
        filteredProducts = SUBSCRIPTION_PRODUCTS;
        }
        break;
      case 'pc':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.platform === 'steam' || p.platform === 'epic' || p.platform === 'origin' || p.platform === 'uplay');
        } else {
          filteredProducts = PC_GAMES_PRODUCTS;
        }
        break;
      case 'console':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.platform === 'playstation' || p.platform === 'xbox' || p.platform === 'nintendo');
        } else {
          filteredProducts = CONSOLE_GAMES_PRODUCTS;
        }
        break;
      case 'mobile':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.platform === 'mobile');
        } else {
          filteredProducts = MOBILE_GAMES_PRODUCTS;
        }
        break;
      case 'gamesdlcs':
        // For Games/DLCs we'll handle this differently - not using individual game products
        return [];
      case 'steam':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.platform === 'steam');
        } else {
        return [];
        }
        break;
      case 'playstation':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.platform === 'playstation');
        } else {
        return [];
        }
        break;
      case 'other':
        if (hasDbProducts) {
          filteredProducts = dbProducts.filter(p => p.type === 'other');
        } else {
        filteredProducts = OTHER_PRODUCTS;
        }
        break;
      default:
        filteredProducts = hasDbProducts ? dbProducts : products;
    }

    // Apply search filter if query exists
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      if (hasDbProducts) {
        const dbFilteredProducts = filteredProducts as Product[];
        return dbFilteredProducts.filter((p: Product) => 
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.tags?.some((tag: string) => tag.toLowerCase().includes(query))
        );
      } else {
        const staticFilteredProducts = filteredProducts as typeof products[0][];
        return staticFilteredProducts.filter((p) => 
        p.name.toLowerCase().includes(query)
      );
      }
    }

    return filteredProducts;
  };

  // Get base price for a product
  const getBasePrice = (product: typeof products[0]) => {
    return product.tiers[0].price;
  };
  
  // Calculate original price (before Turkish discount)
  const getOriginalPrice = (discountedPrice: string) => {
    // Original price is approximately 2.5x the Turkish price (60% discount)
    return (parseFloat(discountedPrice) * 2.5).toFixed(2);
  };
  
  // Daily deals (could be randomized or special offers)
  const dailyDeals = [
    products.find(p => p.name === 'FIFA Points'),
    products.find(p => p.name === 'Spotify Premium'),
    products.find(p => p.name === 'Call of Duty Points')
  ].filter(Boolean);

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

  // Check if Steam or PlayStation category is active - only show them on the 'all', 'steam', or 'playstation' categories
  // but NOT on the 'gamesdlcs' category since we're handling those with a different UI
  const showSteamProducts = activeCategory === 'steam' || activeCategory === 'all';
  const showPlayStationProducts = activeCategory === 'playstation' || activeCategory === 'all';
  
  // Don't show the special sections when on gamesdlcs filter
  const hideGameSections = activeCategory === 'gamesdlcs';

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section with Search */}
        <MotionWrapper variant="bouncyFadeIn" className="mb-10">
          <div className={`bg-glass backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg ${isDarkMode ? 'bg-opacity-20' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl">
                <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Shop All Products
                </h1>
                <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                  Browse our selection of discounted game currencies and digital products at Turkish prices.
                </p>
              </div>
              
              {/* Search Box */}
              <div className="w-full md:w-auto">
                <div className={`relative max-w-md mx-auto md:mx-0 transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl ${
                      isDarkMode ? 'text-textLight placeholder-textLight/50' : 'text-textDark placeholder-textDark/50'
                    } focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-300`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className={`h-5 w-5 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Category Pills */}
        <MotionWrapper variant="bouncySlideUp" className="mb-10">
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                  activeCategory === category.id 
                    ? 'bg-accent text-textLight' 
                    : `bg-glass backdrop-blur-md border border-white/10 ${isDarkMode ? 'text-textLight' : 'text-textDark'} hover:bg-white/10`
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </MotionWrapper>

        {/* Game Platforms */}
        <MotionWrapper variant="bouncyFadeIn" className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Browse by Platform</h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
          >
            {PLATFORMS.map((platform, index) => {
              return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                  <div 
                  onClick={(e) => {
                      e.preventDefault();
                      setActiveCategory(platform.id);
                  }}
                    className={`bg-glass backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:shadow-xl transition-all text-center block h-full cursor-pointer ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'}`}
                >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <PlatformIcon platform={platform.icon} size={32} />
                    </div>
                    <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{platform.name}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </MotionWrapper>
        
        {/* All Products Grid with Games/DLCs section for the gamesdlcs category */}
        <MotionWrapper variant="bouncyFadeIn" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              {activeCategory === 'all' ? 'All Products' : 
                activeCategory === 'games' ? 'Game Currency' : 
                activeCategory === 'subscriptions' ? 'Subscriptions' : 
                activeCategory === 'pc' ? 'PC Games' :
                activeCategory === 'console' ? 'Console Games' :
                activeCategory === 'mobile' ? 'Mobile Games' :
                activeCategory === 'gamesdlcs' ? 'Games & DLCs' :
                activeCategory === 'steam' ? 'Steam Games' :
                activeCategory === 'playstation' ? 'PlayStation Games' :
                activeCategory === 'other' ? 'Other Products' :
                'Products'}
            </h2>
          </div>
          
          {/* Special Games/DLCs section with two main cards */}
          {activeCategory === 'gamesdlcs' ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Steam Games Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-glass backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-lg ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'}`}
              >
                <div className="bg-[#1b2838] aspect-video w-full overflow-hidden flex items-center justify-center relative">
                  <img 
                    src="https://cdn.cloudflare.steamstatic.com/store/home/store_home_share.jpg" 
                    alt="Steam Games" 
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute flex flex-col items-center">
                    <Monitor size={64} color="#ffffff" />
                    <h3 className="text-white text-2xl font-bold mt-3">Steam Games</h3>
                    <p className="text-white/70 mt-1">Get 60% off with Turkish prices</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className={`mb-4 ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    Browse our selection of discounted Steam games at 40% of the original price. All keys are region-free and can be activated worldwide.
                  </p>
                  
                  <Link to="/products/steam-games">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 bg-[#1b2838] text-white rounded-lg hover:bg-[#2a3f5a] transition-colors text-sm font-medium"
                    >
                      Browse Steam Games
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
              
              {/* PlayStation Games Card */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-glass backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-lg ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'}`}
              >
                <div className="bg-[#006FCD] aspect-video w-full overflow-hidden flex items-center justify-center relative">
                  <img 
                    src="https://www.playstation.com/remote/image/upload/website/metanav/games2.jpg" 
                    alt="PlayStation Games" 
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute flex flex-col items-center">
                    <Gamepad2 size={64} color="#ffffff" />
                    <h3 className="text-white text-2xl font-bold mt-3">PlayStation Games</h3>
                    <p className="text-white/70 mt-1">Get 60% off with Turkish prices</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className={`mb-4 ${isDarkMode ? 'text-textLight/80' : 'text-textDark/80'}`}>
                    Browse our selection of discounted PlayStation games at 40% of the original price. All codes are region-free and can be activated worldwide.
                  </p>
                  
                  <Link to="/products/playstation-games">
                    <motion.button 
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 bg-[#006FCD] text-white rounded-lg hover:bg-[#0081ef] transition-colors text-sm font-medium"
                    >
                      Browse PlayStation Games
                    </motion.button>
                </Link>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
                </div>
              ) : error && dbProducts.length === 0 ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <p className={`${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{error}</p>
                  </div>
                </div>
              ) : getFilteredProducts().length === 0 ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <p className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                    No products found matching your criteria.
                  </p>
                </div>
              ) : (
                getFilteredProducts().map((product, index) => {
                  // Check if it's a database product
                  const isDbProduct = 'type' in product && 'tiers' in product && product.tiers.length > 0;
                  
                  if (isDbProduct) {
                    const dbProduct = product as Product;
                    const lowestTier = dbProduct.tiers.reduce((prev, current) => 
                      prev.price < current.price ? prev : current
                    );
                    
                    return (
                      <motion.div 
                        key={dbProduct.id || index}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link 
                          to={`/products/${dbProduct.slug || dbProduct.id}`}
                          className={`bg-glass backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-lg block h-full transition-all duration-300 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'}`}
                        >
                          <div className={`aspect-square ${isDarkMode ? 'bg-gradient-to-br from-black/30 to-black/10' : 'bg-gradient-to-br from-white/10 to-white/5'} flex items-center justify-center p-8`}>
                            {dbProduct.imageURL ? (
                              <img 
                                src={dbProduct.imageURL}
                                alt={dbProduct.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <motion.div 
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                className="w-28 h-28 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg"
                              >
                                <Package className="w-16 h-16" />
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="p-5">
                            <h3 className={`font-medium text-lg mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                              {dbProduct.name}
                            </h3>
                            <p className={`text-sm mb-3 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                              {dbProduct.shortDescription || dbProduct.category}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className={`text-xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                                    {formatPrice(lowestTier.price)}
                                  </span>
                                  {lowestTier.originalPrice && (
                                    <span className={`text-sm line-through ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                                      {formatPrice(lowestTier.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                {dbProduct.tiers.length > 1 && (
                                  <p className={`text-xs ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                                    {dbProduct.tiers.length} options available
                                  </p>
                                )}
                              </div>
                              
                              {lowestTier.originalPrice && (
                                <span className="px-2 py-1 bg-accent text-textLight text-xs rounded-full">
                                  -{Math.round(((lowestTier.originalPrice - lowestTier.price) / lowestTier.originalPrice) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  } else {
                    // Handle static products
                    const staticProduct = product as typeof products[0];
                    
                    return (
                      <motion.div 
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link 
                          to={getProductUrl(staticProduct)}
                          className={`bg-glass backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 shadow-lg block h-full transition-all duration-300 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-white/20'}`}
                        >
                          <div className={`aspect-square ${isDarkMode ? 'bg-gradient-to-br from-black/30 to-black/10' : 'bg-gradient-to-br from-white/10 to-white/5'} flex items-center justify-center p-8`}>
                            <motion.div 
                              whileHover={{ rotate: 5, scale: 1.1 }}
                              className="w-28 h-28 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                            >
                              <img 
                                src={getProductIcon(staticProduct.name)}
                                alt={staticProduct.name}
                                className="w-20 h-20 object-contain"
                              />
                            </motion.div>
                          </div>
                          
                          <div className="p-5">
                            <h3 className={`font-medium text-lg mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                              {staticProduct.name}
                            </h3>
                            <p className={`text-sm mb-3 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                              Turkish Region
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className={`text-xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                                    {formatPrice(getBasePrice(staticProduct))}
                                  </span>
                                  <span className={`text-sm line-through ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                                    {formatPrice(parseFloat(getOriginalPrice(getBasePrice(staticProduct))))}
                                  </span>
                                </div>
                                <p className={`text-xs ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                                  {staticProduct.tiers.length} options
                                </p>
                              </div>
                              
                              <span className="px-2 py-1 bg-accent text-textLight text-xs rounded-full">
                                -60%
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  }
                })
              )}
          </motion.div>
          )}
        </MotionWrapper>

        {/* Daily Deals */}
        <MotionWrapper variant="bouncySlideUp" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Daily Deals</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-accent font-medium"
            >
              See All
            </motion.button>
          </div>
          
          <div className={`${isDarkMode ? 'bg-black/70' : 'bg-glass'} backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg`}>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {dailyDeals.map((product, index) => product && (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to={getProductUrl(product)}
                    className={`${isDarkMode ? 'bg-gradient-to-br from-white/5 to-white/10' : 'bg-gradient-to-br from-white/20 to-white/30'} rounded-xl p-5 border border-white/10 shadow-lg block h-full`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-white/10 flex items-center justify-center">
                          <img 
                            src={getProductIcon(product.name)}
                            alt={product.name}
                            className="w-9 h-9 object-contain"
                          />
                        </div>
                        <div>
                          <span className="inline-block bg-accent/20 text-accent text-xs font-medium px-2 py-1 rounded-md">
                            Special Offer
                          </span>
                        </div>
                      </div>
                      <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{product.name}</h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>Turkish Region</p>
                      <div className="mt-auto">
                        <div className="flex items-end gap-2">
                          <span className="text-price font-bold text-2xl">{formatPrice(getBasePrice(product))}</span>
                          {currency !== 'GBP' && (
                            <span className={`text-sm line-through ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>
                              {formatPrice(getOriginalPrice(getBasePrice(product)))}
                            </span>
                          )}
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full mt-3 py-2.5 bg-accent text-textLight rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                        >
                          View Options
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </MotionWrapper>

        {/* Steam Games (conditionally shown) */}
        {showSteamProducts && !hideGameSections && activeCategory === 'steam' && (
          <MotionWrapper variant="bouncySlideUp" className="mb-12">
            <div className={`bg-glass backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-lg text-center`}>
              <Monitor size={64} className="mx-auto mb-4 text-accent" />
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Steam Games Collection
              </h2>
              <p className={`mb-6 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                Browse our extensive collection of Steam games at 60% off retail prices
              </p>
              <Link to="/products/steam-games">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-[#1b2838] text-white rounded-lg hover:bg-[#2a3f5a] transition-colors font-medium"
                >
                  Browse Steam Games Collection
                        </motion.button>
                    </Link>
            </div>
          </MotionWrapper>
        )}

        {/* PlayStation Games (conditionally shown) */}
        {showPlayStationProducts && !hideGameSections && activeCategory === 'playstation' && (
          <MotionWrapper variant="bouncySlideUp" className="mb-12">
            <div className={`bg-glass backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-lg text-center`}>
              <Gamepad2 size={64} className="mx-auto mb-4 text-accent" />
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                PlayStation Games Collection
              </h2>
              <p className={`mb-6 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                Browse our extensive collection of PlayStation games at 60% off retail prices
              </p>
              <Link to="/products/playstation-games">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-[#006FCD] text-white rounded-lg hover:bg-[#0081ef] transition-colors font-medium"
                >
                  Browse PlayStation Games Collection
                        </motion.button>
                    </Link>
            </div>
          </MotionWrapper>
        )}
      </div>
    </div>
  );
};

export default ProductsPage; 