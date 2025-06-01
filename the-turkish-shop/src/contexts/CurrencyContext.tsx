import React, { createContext, useContext, useState, useEffect } from 'react';

// Define currency types
export type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'CAD' | 'AUD';

// Define currency symbols
const currencySymbols: Record<CurrencyCode, string> = {
  GBP: '£',
  EUR: '€',
  USD: '$',
  CAD: 'C$',
  AUD: 'A$'
};

// Approximate exchange rates (as of now)
// In a production app, you'd want to fetch these from an API
const exchangeRates: Record<CurrencyCode, number> = {
  GBP: 1.00,    // Base currency
  EUR: 1.18,    // 1 GBP = 1.18 EUR (updated)
  USD: 1.35,    // 1 GBP = 1.35 USD (updated) 
  CAD: 1.85,    // 1 GBP = 1.85 CAD (updated)
  AUD: 1.55     // 1 GBP = 1.55 AUD (updated)
};

// European Union country codes
const euCountries = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

// Map regions to currencies
const regionToCurrency = (countryCode: string): CurrencyCode => {
  // UK uses GBP
  if (['GB', 'UK'].includes(countryCode)) {
    return 'GBP';
  }
  
  // Euro countries
  if (euCountries.includes(countryCode)) {
    return 'EUR';
  }
  
  // North America
  if (countryCode === 'US') {
    return 'USD';
  }
  
  if (countryCode === 'CA') {
    return 'CAD';
  }
  
  // Oceania
  if (['AU', 'NZ'].includes(countryCode)) {
    return 'AUD';
  }
  
  // Default to GBP for unknown regions
  return 'GBP';
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  symbol: string;
  convertPrice: (priceInGBP: number | string) => number;
  formatPrice: (priceInGBP: number | string) => string;
  userCountry: string | null;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'GBP',
  setCurrency: () => {},
  symbol: '£',
  convertPrice: (price) => typeof price === 'string' ? parseFloat(price) : price,
  formatPrice: (price) => `£${typeof price === 'string' ? price : price.toFixed(2)}`,
  userCountry: null,
  isLoading: true
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('GBP');
  const [symbol, setSymbol] = useState<string>('£');
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Update symbol when currency changes
  useEffect(() => {
    setSymbol(currencySymbols[currency]);
  }, [currency]);

  // Fetch user's country from IP
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        setIsLoading(true);
        
        // Try the first IP API
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          
          if (data && data.country_code) {
            const countryCode = data.country_code;
            setUserCountry(countryCode);
            
            // Set currency based on country
            const detectedCurrency = regionToCurrency(countryCode);
            setCurrency(detectedCurrency);
            
            console.log(`User location detected (ipapi): ${data.country_name} (${countryCode})`);
            console.log(`Setting currency to: ${detectedCurrency}`);
            return; // Successfully got location, exit the function
          }
        } catch (error) {
          console.error('Error with ipapi.co:', error);
          // Continue to backup API
        }
        
        // Backup IP API
        try {
          const response = await fetch('https://ipinfo.io/json?token=c4f93efe9f3df9');
          const data = await response.json();
          
          if (data && data.country) {
            const countryCode = data.country;
            setUserCountry(countryCode);
            
            // Set currency based on country
            const detectedCurrency = regionToCurrency(countryCode);
            setCurrency(detectedCurrency);
            
            console.log(`User location detected (ipinfo): ${data.city}, ${data.region} (${countryCode})`);
            console.log(`Setting currency to: ${detectedCurrency}`);
            return; // Successfully got location, exit the function
          }
        } catch (error) {
          console.error('Error with ipinfo.io:', error);
          // Continue to default fallback
        }
        
        // If both APIs fail, default to GBP
        console.warn('Could not detect location, defaulting to GBP');
        setCurrency('GBP');
        
      } catch (error) {
        console.error('Error in location detection process:', error);
        // Default to GBP if there's an error
        setCurrency('GBP');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserLocation();
  }, []);

  // Currency conversion function
  const convertPrice = (priceInGBP: number | string): number => {
    const price = typeof priceInGBP === 'string' ? parseFloat(priceInGBP) : priceInGBP;
    const rate = exchangeRates[currency];
    return price * rate;
  };

  // Format price in the selected currency
  const formatPrice = (priceInGBP: number | string): string => {
    const convertedPrice = convertPrice(priceInGBP);
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        symbol, 
        convertPrice, 
        formatPrice,
        userCountry,
        isLoading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider; 