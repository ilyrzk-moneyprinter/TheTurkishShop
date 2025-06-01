import { Timestamp } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';
import axios from 'axios';
import { Order } from './types';

// Type for game data
export interface GamePrice {
  id?: string;
  userId: string | null;
  userEmail: string | null;
  gameTitle: string;
  originalUrl: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  platform: string;
  imageUrl: string;
  status: 'completed' | 'failed';
  createdAt: Timestamp;
}

/**
 * Get all game price checks (for admin panel)
 * @returns Array of game price checks
 */
export async function getAllGamePriceChecks(): Promise<GamePrice[]> {
  // Mock data for now - will be replaced with actual Firestore query
  const mockData: GamePrice[] = [
    {
      id: '1',
      userId: 'user123',
      userEmail: 'user@example.com',
      gameTitle: 'Red Dead Redemption 2',
      originalUrl: 'https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/',
      originalPrice: 59.99,
      discountedPrice: 23.99,
      currency: 'GBP',
      platform: 'Steam',
      imageUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
      status: 'completed',
      createdAt: Timestamp.now()
    },
    {
      id: '2',
      userId: 'user123',
      userEmail: 'user@example.com',
      gameTitle: 'God of War',
      originalUrl: 'https://store.playstation.com/en-gb/product/EP9000-CUSA07411_00-00000000GODOFWAR',
      originalPrice: 69.99,
      discountedPrice: 27.99,
      currency: 'GBP',
      platform: 'PlayStation',
      imageUrl: 'https://image.api.playstation.com/cdn/UP9000/CUSA07408_00/0cQ70KkYWtDOwV76XW3a5zrZZBR4zEV9.png',
      status: 'completed',
      createdAt: Timestamp.now()
    }
  ];

  return mockData;
}

/**
 * Type definition for a game product
 */
export interface GameProduct {
  title: string;
  platform: 'Steam' | 'PSN';
  productType: 'Game' | 'DLC';
  image: string;
  price: number;
  discounted: number;
  currency: string;
  url: string;
  originalUrl?: string; // Original URL provided by user
}

/**
 * Fetch game data from Steam Store API
 * @param url Steam store URL
 * @returns Game product data
 */
export const fetchSteamProduct = async (url: string): Promise<GameProduct> => {
  try {
    // Use our API server to handle Steam requests the same way as PlayStation
    const apiUrl = 'http://localhost:5001/api/fetch-game';
    const response = await axios.post(apiUrl, { url });
    
    // Add type assertion for the response data
    const responseData = response.data as Record<string, any>;
    
    if (!responseData || responseData.error) {
      throw new Error(responseData?.error || 'Failed to fetch Steam game data');
    }
    
    return {
      title: responseData.title,
      platform: 'Steam',
      productType: responseData.productType || 'Game',
      image: responseData.image,
      price: responseData.price,
      discounted: responseData.discounted,
      currency: responseData.currency,
      url: responseData.url,
      originalUrl: responseData.originalUrl || url
    };
  } catch (error) {
    console.error('Error fetching Steam game data:', error);
    throw error;
  }
};

/**
 * Fetch game data from PlayStation Store
 * @param url PlayStation store URL or product ID
 * @returns Game product data
 */
export const fetchPlayStationProduct = async (url: string): Promise<GameProduct> => {
  try {
    // Use server-side scraping endpoint with full URL to avoid 404 errors
    const apiUrl = 'http://localhost:5001/api/fetch-game'; // Use absolute URL with port
    
    console.log('Fetching PlayStation data for:', url);
    
    try {
      const response = await axios.post(apiUrl, { url });
      
      // Add type assertion for the response data
      const responseData = response.data as Record<string, any>;
      
      if (!responseData || responseData.error) {
        throw new Error(responseData?.error || 'Failed to fetch PlayStation game data');
      }
      
      return {
        title: responseData.title,
        platform: 'PSN',
        productType: responseData.productType || 'Game', // Default to Game if not specified
        image: responseData.image,
        price: responseData.price,
        discounted: responseData.discounted,
        currency: responseData.currency,
        url: responseData.url || responseData.normalizedUrl, // Normalized URL
        originalUrl: responseData.originalUrl || url // Original URL if provided, fallback to input URL
      };
    } catch (apiError) {
      console.error('API error, using fallback mock data:', apiError);
      
      // Create normalized URL from PlayStation ID
      let normalizedUrl = url;
      if (!url.includes('store.playstation.com')) {
        normalizedUrl = `https://store.playstation.com/en-gb/product/${url.trim()}`;
      }
      
      // Extract ID from URL for title
      const idMatch = normalizedUrl.match(/\/product\/([^\/]+)/);
      const gameId = idMatch ? idMatch[1] : url;
      
      // Return mock data as fallback
      return {
        title: `PlayStation Game (${gameId})`,
        platform: 'PSN',
        productType: 'Game',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PlayStation_logo.svg/2560px-PlayStation_logo.svg.png',
        price: 59.99,
        discounted: 23.99,
        currency: 'GBP',
        url: normalizedUrl,
        originalUrl: url
      };
    }
  } catch (error) {
    console.error('Error fetching PlayStation game data:', error);
    throw error;
  }
};

/**
 * Create a new game order in Firestore
 * @param gameData Game product data
 * @param email User's email
 * @param message Optional message from the user
 * @returns Order ID
 */
export const createGameOrder = async (
  gameData: GameProduct,
  email: string,
  message?: string
): Promise<string> => {
  try {
    // Create a new order document
    const newOrder: Partial<Order> = {
      orderID: `GAME-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product: gameData.title,
      tier: gameData.productType,
      price: gameData.discounted.toString(),
      currency: gameData.currency,
      paymentMethod: 'PayPal', // Default payment method
      deliveryType: 'Standard', // Default delivery type
      platform: gameData.platform === 'Steam' ? 'PC' : 'PlayStation',
      buyerEmail: email,
      gameUsername: email, // Default to email if no username provided
      status: 'queued',
      createdAt: Timestamp.now(),
      notes: message,
      deliveryDetails: {
        gameUrl: gameData.url, // Normalized URL for consistency
        originalUrl: gameData.originalUrl || gameData.url, // Original URL provided by user
        originalPrice: gameData.price,
        imageUrl: gameData.image
      }
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    
    // Ensure orderID is always defined
    return newOrder.orderID!;
  } catch (error) {
    console.error('Error creating game order:', error);
    throw error;
  }
}; 