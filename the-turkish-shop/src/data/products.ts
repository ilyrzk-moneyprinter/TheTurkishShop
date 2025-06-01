export interface ProductTier {
  amount: string;
  price: string;
}

export interface Product {
  id: string;
  name: string;
  region: string;
  currency: string;
  tiers: ProductTier[];
  notes?: string;
  category?: string;
  platform?: string;
  featured?: boolean;
  description?: string;
  image?: string;
  originalPrice?: number;
  price?: number;
  slug?: string;
}

// Generate slugs for all products
const addSlugsAndCategories = (products: Product[]): Product[] => {
  return products.map(product => {
    // Generate slug from name
    const slug = product.name.toLowerCase().replace(/ /g, '-');
    
    // Determine category based on product name
    let category = 'Game Currency';
    if (product.name.includes('Spotify')) category = 'Subscription';
    if (product.name.includes('Discord Nitro')) category = 'Subscription';
    
    return {
      ...product,
      slug,
      category
    };
  });
};

export const products: Product[] = addSlugsAndCategories([
  // Valorant Points
  {
    id: 'valorant-points',
    name: 'Valorant Points',
    region: 'TR',
    currency: 'GBP',
    platform: 'valorant',
    category: 'games',
    featured: true,
    description: 'Get Valorant Points at discounted prices',
    image: '/assets/icons/valorant.png',
    slug: 'valorant',
    tiers: [
      { amount: '2150', price: '7.49' },
      { amount: '3650', price: '12.49' },
      { amount: '5500', price: '19.99' },
      { amount: '11500', price: '37.49' },
      { amount: '23000', price: '64.99' },
      { amount: '46000', price: '104.99' }
    ]
  },
  // Fortnite V-Bucks
  {
    id: 'fortnite-vbucks',
    name: 'Fortnite V-Bucks',
    region: 'TR',
    currency: 'GBP',
    platform: 'fortnite',
    category: 'games',
    featured: true,
    description: 'Purchase Fortnite V-Bucks at competitive prices',
    image: '/assets/icons/Vbucks.webp',
    slug: 'fortnite-vbucks',
    tiers: [
      { amount: '1000', price: '3.99' },
      { amount: '2800', price: '7.99' },
      { amount: '5000', price: '13.99' },
      { amount: '13500', price: '24.99' },
      { amount: '27000', price: '47.99' },
      { amount: '40500', price: '65.99' },
      { amount: '54000', price: '89.99' },
      { amount: '108000', price: '119.99' }
    ]
  },
  // Call of Duty Points
  {
    id: 'call-of-duty-points',
    name: 'Call of Duty Points',
    region: 'TR',
    currency: 'GBP',
    platform: 'cod',
    category: 'games',
    featured: true,
    description: 'Buy COD Points for Warzone and Modern Warfare',
    image: '/assets/icons/cod.webp',
    slug: 'call-of-duty-points',
    tiers: [
      { amount: '1000', price: '3.99' },
      { amount: '2400', price: '7.99' },
      { amount: '5000', price: '17.99' },
      { amount: '9000', price: '32.99' },
      { amount: '13500', price: '54.99' }
    ]
  },
  // FIFA Points
  {
    id: 'fifa-points',
    name: 'FIFA Points',
    region: 'TR',
    currency: 'GBP',
    platform: 'fifa',
    category: 'games',
    featured: true,
    description: 'Get FIFA Points for Ultimate Team',
    image: '/assets/icons/fifa.png',
    slug: 'fifa-points',
    tiers: [
      { amount: '1600', price: '5.49' },
      { amount: '2800', price: '12.49' },
      { amount: '5900', price: '22.99' },
      { amount: '12000', price: '44.99' },
      { amount: '18500', price: '69.99' },
      { amount: '37000', price: '129.99' }
    ]
  },
  // Rainbow Six Credits
  {
    id: 'rainbow-six-credits',
    name: 'Rainbow Six Credits',
    region: 'TR',
    currency: 'GBP',
    platform: 'r6',
    category: 'games',
    featured: true,
    description: 'Purchase R6 Credits for Rainbow Six Siege',
    image: '/assets/icons/R6.webp',
    slug: 'rainbow-six-credits',
    tiers: [
      { amount: '1200', price: '3.49' },
      { amount: '2600', price: '7.99' },
      { amount: '5000', price: '14.99' },
      { amount: '7500', price: '19.99' },
      { amount: '16000', price: '35.99' },
      { amount: '25000', price: '49.99' }
    ]
  },
  // Brawl Stars Gems
  {
    id: 'brawl-stars-gems',
    name: 'Brawl Stars Gems',
    region: 'TR',
    currency: 'GBP',
    platform: 'brawlstars',
    category: 'games',
    featured: false,
    description: 'Buy Brawl Stars Gems at great prices',
    image: '/assets/icons/brawlstars.webp',
    slug: 'brawl-stars-gems',
    tiers: [
      { amount: '360', price: '7.49' },
      { amount: '950', price: '14.99' },
      { amount: '2000', price: '24.99' },
      { amount: '5000', price: '44.99' },
      { amount: '7500', price: '64.49' },
      { amount: '12500', price: '94.99' }
    ],
    notes: 'Requires Supercell ID'
  },
  // Discord Nitro
  {
    id: 'discord-nitro',
    name: 'Discord Nitro',
    region: 'TR',
    currency: 'GBP',
    platform: 'discord',
    category: 'subscription',
    featured: true,
    description: 'Discord Nitro subscription at Turkish prices',
    image: '/assets/icons/discord-icon.png',
    slug: 'discord-nitro',
    tiers: [
      { amount: 'Basic Monthly', price: '1.49' },
      { amount: 'Full Monthly', price: '3.99' }
    ]
  },
  // Spotify Premium
  {
    id: 'spotify-premium',
    name: 'Spotify Premium',
    region: 'TR',
    currency: 'GBP',
    platform: 'spotify',
    category: 'subscription',
    featured: true,
    description: 'Spotify Premium subscription at discounted rates',
    image: '/assets/icons/Spotify-Premium.webp',
    slug: 'spotify-premium',
    tiers: [
      { amount: '1 Month', price: '3.99' },
      { amount: '3 Months', price: '9.99' },
      { amount: '6 Months', price: '14.99' },
      { amount: '12 Months', price: '29.99' }
    ]
  },
  // Apex Legends Coins
  {
    id: 'apex-legends-coins',
    name: 'Apex Legends Coins',
    region: 'TR',
    currency: 'GBP',
    platform: 'apex',
    category: 'games',
    featured: true,
    description: 'Buy Apex Coins for Apex Legends',
    image: '/assets/icons/apex.png',
    slug: 'apex-legends',
    tiers: [
      { amount: '11500', price: '14.99' },
      { amount: '23000', price: '24.99' },
      { amount: '46000', price: '44.99' },
      { amount: '92000', price: '79.99' },
      { amount: '124000', price: '124.99' },
      { amount: '179000', price: '179.99' }
    ]
  },
  // Roblox Robux
  {
    id: 'roblox-robux',
    name: 'Roblox Robux',
    region: 'TR',
    currency: 'GBP',
    platform: 'roblox',
    category: 'games',
    featured: true,
    description: 'Get Roblox Robux at best prices',
    image: '/assets/icons/robux.webp',
    slug: 'roblox-robux',
    tiers: [
      { amount: '1000', price: '4.99' }
    ],
    notes: 'Limited items also available'
  }
]); 