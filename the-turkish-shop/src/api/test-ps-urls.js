const { normalizePlayStationUrl, extractPlayStationProductId } = require('./gamePriceChecker');

// Test various PlayStation URL formats
const testUrls = [
  // Standard format URLs with different regions
  'https://store.playstation.com/en-gb/product/EP9000-PPSA01284_00-0000000000000000',
  'https://store.playstation.com/de-de/product/EP9000-PPSA01284_00-0000000000000000',
  'https://store.playstation.com/fr-fr/product/EP9000-PPSA01284_00-0000000000000000',
  'https://store.playstation.com/ja-jp/product/EP9000-PPSA01284_00-0000000000000000',
  
  // Raw product IDs with dash - with and without trailing zeros
  'EP9000-PPSA01284_00-0000000000000000',
  'EP9000-PPSA01284_00',
  'UP1004-CUSA03041_00-REDEMPTION000002',
  
  // Raw product IDs without dash
  'EP9000PPSA01284_00-0000000000000000',
  'EP9000PPSA01284_00',
  'UP1004CUSA03041_00-REDEMPTION000002',
  
  // Alternate format (if supported)
  'https://store.playstation.com/#!/en-gb/tid=CUSA07410_00',
  
  // URLs with query parameters and fragments
  'https://store.playstation.com/en-gb/product/EP9000-PPSA01284_00-0000000000000000?PlatformPrivacyWs1=all&psappver=19.15.0&smcid=psapp',
  'https://store.playstation.com/en-gb/product/EP9000-PPSA01284_00-0000000000000000#gameOverview',
  
  // Different product ID patterns
  'https://store.playstation.com/en-us/product/UP0001-CUSA00288_00-ACUNITYMASTERPS4',
  'https://store.playstation.com/en-jp/product/JP0507-PPSA02442_00-HOGWARTS00000001'
];

console.log('Testing PlayStation URL normalization:');
console.log('=====================================');

testUrls.forEach(url => {
  try {
    console.log(`\nOriginal input: ${url}`);
    
    // Test extracting product ID
    const productId = extractPlayStationProductId(url);
    console.log(`Extracted Product ID: ${productId}`);
    
    // Test normalizing URL
    const { originalUrl, normalizedUrl } = normalizePlayStationUrl(url);
    console.log(`Original URL: ${originalUrl}`);
    console.log(`Normalized URL: ${normalizedUrl}`);
    
    console.log('Result: ✅ Success');
  } catch (error) {
    console.log(`Result: ❌ Error: ${error.message}`);
  }
});

console.log('\nAll tests completed!'); 