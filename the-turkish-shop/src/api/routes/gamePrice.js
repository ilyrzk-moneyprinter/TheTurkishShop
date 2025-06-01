const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

// Apply CORS middleware
router.use(cors());

// Helper function to validate URLs
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

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

    // Log request details for debugging
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    console.log('Request Body:', req.body);
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required'
      });
    }

    if (!isValidURL(url)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid URL format'
      });
    }

    console.log('Received URL for fetch-game:', url);

    // Handle Steam URLs
    if (url.includes('store.steampowered.com')) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const gameTitle = $('.apphub_AppName').text().trim();
        const priceText = $('.game_purchase_price').first().text().trim() || 
                         $('.discount_final_price').first().text().trim();
        const imageUrl = $('.game_header_image_full').attr('src');
        
        return res.status(200).json({
          success: true,
          game: {
            title: gameTitle,
            price: priceText,
            imageUrl: imageUrl,
            url: url
          }
        });
      } catch (error) {
        console.error('Error fetching Steam game data:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch Steam game data'
        });
      }
    } else {
      // For unsupported stores
      return res.status(400).json({
        success: false,
        error: 'Unsupported game store URL'
      });
    }
  } catch (error) {
    console.error('Error fetching game data:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
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

// Health check route
router.get('/game-price/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'game-price-api',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 