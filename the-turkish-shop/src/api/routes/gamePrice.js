const express = require('express');
const router = express.Router();
const { fetchGameData, normalizePlayStationUrl } = require('../gamePriceChecker');
const cors = require('cors');

// Apply CORS middleware
router.use(cors());

/**
 * POST /api/fetch-game
 * 
 * Fetches game data from the provided URL and calculates a discounted price
 * 
 * Request Body:
 * {
 *   "url": "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/"
 *   or
 *   "url": "https://store.playstation.com/en-gb/product/EP9000-CUSA07411_00-00000000GODOFWAR"
 *   or
 *   "url": "EP9000-CUSA07411_00-00000000GODOFWAR" (just the PlayStation product ID)
 * }
 * 
 * Response:
 * {
 *   "title": "Red Dead Redemption 2",
 *   "image": "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
 *   "price": 59.99,
 *   "discounted": 23.99,
 *   "currency": "GBP",
 *   "platform": "Steam",
 *   "url": "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/",
 *   "originalUrl": "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/"
 * }
 */
router.post('/fetch-game', async (req, res) => {
  try {
    const { url } = req.body;
    
    console.log('Received URL for fetch-game:', url);
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL parameter',
        message: 'Please provide a valid game store URL or product ID'
      });
    }
    
    try {
      // Let the gamePriceChecker handle the different formats
      const gameData = await fetchGameData(url);
      
      // Return the game data
      return res.json(gameData);
    } catch (error) {
      console.error('Error fetching game data:', error);
      return res.status(400).json({
        error: 'Error fetching game data',
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error processing game price request:', error);
    
    res.status(500).json({
      error: 'Failed to fetch game data',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * POST /api/test-ps-id
 * Simple endpoint to test PlayStation product ID handling
 */
router.post('/test-ps-id', (req, res) => {
  try {
    const { productId } = req.body;
    
    console.log('Received product ID:', productId);
    
    if (!productId) {
      return res.status(400).json({
        error: 'Missing product ID',
        message: 'Please provide a valid PlayStation product ID'
      });
    }
    
    // Create a normalized URL
    const normalizedUrl = `https://store.playstation.com/en-gb/product/${productId.trim()}`;
    
    // Return success with the normalized URL
    return res.json({
      success: true,
      originalId: productId,
      normalizedUrl: normalizedUrl,
      mockGame: {
        title: `PlayStation Game (${productId})`,
        platform: 'PSN',
        productType: 'Game',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PlayStation_logo.svg/2560px-PlayStation_logo.svg.png',
        price: 59.99,
        discounted: 23.99,
        currency: 'GBP',
        url: normalizedUrl,
        originalUrl: productId
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    
    res.status(500).json({
      error: 'Failed to process product ID',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

module.exports = router; 