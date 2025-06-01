import { db } from './config';
import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp, DocumentData } from 'firebase/firestore';
import axios from 'axios';
import { User } from 'firebase/auth';

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
 * Extract app ID from Steam URL
 * @param url - Steam store URL
 * @returns Steam app ID
 */
function extractSteamAppId(url: string): string {
  // Regular expression to match app ID in various Steam URL formats
  const appIdMatch = url.match(/(?:store\.steampowered\.com\/app\/|steam:\/\/rungame\/)(\d+)/);
  if (appIdMatch && appIdMatch[1]) {
    return appIdMatch[1];
  }
  throw new Error('Could not extract Steam app ID from URL');
}

/**
 * Extract product ID from PlayStation Store URL
 * @param url - PlayStation Store URL
 * @returns PlayStation product ID
 */
function extractPlayStationId(url: string): string {
  // Extract the product ID from various PlayStation Store URL formats
  const idMatch = url.match(/(?:store\.playstation\.com\/[a-z-]+\/product\/)([A-Z0-9-]+)/i);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  throw new Error('Could not extract PlayStation product ID from URL');
}

/**
 * Fetch game data from Steam API
 * @param url - Steam store URL
 * @returns Game data object
 */
async function fetchSteamGameData(url: string): Promise<Omit<GamePrice, 'userId' | 'userEmail' | 'createdAt' | 'status'>> {
  try {
    const appId = extractSteamAppId(url);
    const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=uk`);
    
    // Check if the API returned valid data
    if (!response.data || !response.data[appId] || !response.data[appId].success) {
      throw new Error('Failed to fetch game data from Steam');
    }
    
    const gameData = response.data[appId].data;
    
    // Extract price (Steam API returns price in cents)
    let price = 0;
    if (gameData.price_overview) {
      price = gameData.price_overview.initial / 100;
    } else if (gameData.is_free) {
      price = 0;
    }
    
    // Calculate 60% discount (60% of original price = 40% of original price)
    const discountedPrice = parseFloat((price * 0.4).toFixed(2));
    
    return {
      gameTitle: gameData.name,
      imageUrl: gameData.header_image,
      originalPrice: price,
      discountedPrice: discountedPrice,
      currency: gameData.price_overview ? gameData.price_overview.currency : 'GBP',
      platform: 'Steam',
      originalUrl: url
    };
  } catch (error) {
    console.error('Error fetching Steam game data:', error);
    throw error;
  }
}

/**
 * Fetch game data by scraping PlayStation Store page
 * This would normally use a backend service, but for this prototype
 * we'll use a placeholder function that returns mock data
 */
async function fetchPlayStationGameData(url: string): Promise<Omit<GamePrice, 'userId' | 'userEmail' | 'createdAt' | 'status'>> {
  try {
    // In a real implementation, this would call a server-side function
    // to scrape the PlayStation store page
    
    // Extract product ID
    const productId = extractPlayStationId(url);
    
    // For demo purposes, return mock data
    // In production, this would be actual data from PlayStation Store
    return {
      gameTitle: `PlayStation Game (${productId})`,
      imageUrl: 'https://image.api.playstation.com/cdn/UP9000/CUSA07408_00/0cQ70KkYWtDOwV76XW3a5zrZZBR4zEV9.png',
      originalPrice: 69.99,
      discountedPrice: 27.99,
      currency: 'GBP',
      platform: 'PlayStation',
      originalUrl: url
    };
  } catch (error) {
    console.error('Error fetching PlayStation game data:', error);
    throw error;
  }
}

/**
 * Check a game price and save the result to Firestore
 * @param url - Game store URL (Steam or PlayStation)
 * @param currentUser - Current Firebase user (optional)
 * @returns Game price data
 */
export async function checkGamePrice(url: string, currentUser: User | null): Promise<GamePrice> {
  try {
    let gameData;
    
    // Determine store type from URL
    if (url.includes('store.steampowered.com')) {
      gameData = await fetchSteamGameData(url);
    } else if (url.includes('store.playstation.com')) {
      gameData = await fetchPlayStationGameData(url);
    } else {
      throw new Error('Unsupported game store URL. Please provide a Steam or PlayStation Store URL.');
    }
    
    // Prepare data for Firestore
    const gamePriceData: GamePrice = {
      ...gameData,
      userId: currentUser?.uid || null,
      userEmail: currentUser?.email || null,
      status: 'completed',
      createdAt: Timestamp.now()
    };
    
    // Add to Firestore
    const gamePriceRef = collection(db, 'gamePrices');
    const docRef = await addDoc(gamePriceRef, gamePriceData);
    
    // Return data with document ID
    return {
      ...gamePriceData,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error checking game price:', error);
    
    // Save failed attempt to Firestore
    const failedCheck: GamePrice = {
      userId: currentUser?.uid || null,
      userEmail: currentUser?.email || null,
      gameTitle: 'Unknown',
      originalUrl: url,
      originalPrice: 0,
      discountedPrice: 0,
      currency: 'GBP',
      platform: url.includes('steam') ? 'Steam' : url.includes('playstation') ? 'PlayStation' : 'Unknown',
      imageUrl: '',
      status: 'failed',
      createdAt: Timestamp.now()
    };
    
    const gamePriceRef = collection(db, 'gamePrices');
    await addDoc(gamePriceRef, failedCheck);
    
    throw error;
  }
}

/**
 * Get recent game price checks
 * @param limit - Maximum number of results to return
 * @returns Array of game price checks
 */
export async function getRecentGamePriceChecks(limitCount = 10): Promise<GamePrice[]> {
  const gamePriceRef = collection(db, 'gamePrices');
  const q = query(gamePriceRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  const querySnapshot = await getDocs(q);
  const gamePrices: GamePrice[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Omit<GamePrice, 'id'>;
    gamePrices.push({
      ...data,
      id: doc.id
    });
  });
  
  return gamePrices;
}

/**
 * Get game price checks for a specific user
 * @param userId - Firebase user ID
 * @returns Array of game price checks
 */
export async function getUserGamePriceChecks(userId: string): Promise<GamePrice[]> {
  const gamePriceRef = collection(db, 'gamePrices');
  const q = query(gamePriceRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  const gamePrices: GamePrice[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Omit<GamePrice, 'id'>;
    gamePrices.push({
      ...data,
      id: doc.id
    });
  });
  
  return gamePrices;
}

/**
 * Get all game price checks (for admin panel)
 * @returns Array of game price checks
 */
export async function getAllGamePriceChecks(): Promise<GamePrice[]> {
  const gamePriceRef = collection(db, 'gamePrices');
  const q = query(gamePriceRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  const gamePrices: GamePrice[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Omit<GamePrice, 'id'>;
    gamePrices.push({
      ...data,
      id: doc.id
    });
  });
  
  return gamePrices;
} 