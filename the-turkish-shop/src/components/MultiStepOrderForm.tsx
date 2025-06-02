import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Added Link
import { useTheme } from '../contexts/ThemeContext';
import { createOrder, uploadPaymentProof } from '../firebase/orderService';
import { usePromoCode as updatePromoCodeUsage } from '../firebase/promoCodeService';
import { 
  Order, 
  PaymentMethod, 
  DeliveryMethod,
  GamePlatform,
  PLATFORM_EXEMPT_PRODUCTS,
  DeliveryType,
  PromoCode
} from '../firebase/types';
import PaymentProofUpload from './PaymentProofUpload';
import PaymentSection from './checkout/PaymentSection';
import PlatformSelector from './PlatformSelector';
import PromoCodeInput from './PromoCodeInput';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency, CurrencyCode } from '../contexts/CurrencyContext';
import siteConfig from '../config/siteConfig';

// Helper function to validate email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email === '' || emailRegex.test(email);
};

// Define form steps
type FormStep = 'payment' | 'delivery' | 'confirmation' | 'complete';

// Game-specific delivery options
type ValorantDeliveryOption = 'direct' | 'giftcard';
type ApexFCDeliveryOption = 'account' | 'giftcard';

// Country list for Paysafecard
const PAYSAFECARD_COUNTRIES = [
  'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 
  'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Poland',
  'Norway', 'Sweden', 'Finland', 'Denmark', 'Portugal', 'Ireland',
  'Greece', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania',
  'Bulgaria', 'Croatia', 'Slovenia', 'Luxembourg', 'United States', 'Canada', 'Australia'
];

// All countries list for game account country selection
const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kosovo', 
  'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 
  'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

interface MultiStepOrderFormProps {
  onOrderCreated?: (orderID: string) => void;
}

const MultiStepOrderForm: React.FC<MultiStepOrderFormProps> = ({ onOrderCreated }) => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { currency, setCurrency, symbol, convertPrice, formatPrice } = useCurrency();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [orderID, setOrderID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('payment');
  
  // Promo code state
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentData, setPaymentData] = useState<any>({});
  
  // Delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('direct');
  const [selectedPlatform, setSelectedPlatform] = useState<GamePlatform | undefined>(undefined);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('Standard');
  
  // Game-specific delivery options
  const [valorantDeliveryOption, setValorantDeliveryOption] = useState<ValorantDeliveryOption>('direct');
  const [apexFCDeliveryOption, setApexFCDeliveryOption] = useState<ApexFCDeliveryOption>('giftcard');
  
  // Account country (for direct top-ups) - not geographical country
  const [accountCountry, setAccountCountry] = useState<string>('Turkey');
  
  // Account details for account delivery
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [accountPassword, setAccountPassword] = useState<string>('');
  const [needs2FA, setNeeds2FA] = useState<boolean>(false);
  
  // User details state
  const [email, setEmail] = useState('');
  const [gameUsername, setGameUsername] = useState('');
  const [multipleAccounts, setMultipleAccounts] = useState<string>('');
  const [isMultipleAccounts, setIsMultipleAccounts] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Add state variable for payment screenshot
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  
  // Initialize email from current user if available
  React.useEffect(() => {
    if (currentUser && currentUser.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);
  
  // Check if cart is empty and show error if so
  React.useEffect(() => {
    if (items.length === 0) {
      setFormError('Your cart is empty. Please add items to your cart before proceeding.');
    } else {
      setFormError(null);
    }
  }, [items]);
  
  // Add state for selected currency (initialize with the global currency)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  
  // Update selectedCurrency when global currency changes
  React.useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);
  
  // Calculate express fee based on the current currency
  const expressFeePrices: Record<CurrencyCode, number> = {
    'GBP': 9.00,    // Base price
    'USD': 12.15,   // Updated to match new conversion rate: 9.00 * 1.35
    'EUR': 10.62,   // Updated to match new conversion rate: 9.00 * 1.18
    'CAD': 16.65,   // Updated to match new conversion rate: 9.00 * 1.85
    'AUD': 13.95    // Updated to match new conversion rate: 9.00 * 1.55
  };
  
  const expressFee = deliveryType === 'Express' ? expressFeePrices[currency] || 0 : 0;
  const subtotalAfterDiscount = subtotal - promoDiscount;
  const totalWithExpressFee = subtotalAfterDiscount + expressFee;
  
  // Handle currency change
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
  };
  
  // These use the context's convertPrice which automatically converts to the selected currency
  const convertedSubtotal = subtotal;
  const convertedExpressFee = expressFee;
  const convertedTotal = totalWithExpressFee;
  
  // Helper functions for game type detection using useCallback
  const hasValorantInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return (
        productName.includes('valorant points') ||
        productName.includes('valorant') ||
        productName.includes('vp')
      );
    });
  }, [items]);
  
  const hasApexCoinsInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return productName.includes('apex') && productName.includes('coin');
    });
  }, [items]);
  
  const hasFIFAPointsInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return (
        (productName.includes('fifa') && productName.includes('point')) ||
        (productName.includes('fc') && productName.includes('point'))
      );
    });
  }, [items]);
  
  const hasBrawlStarsInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return productName.includes('brawl') && productName.includes('star');
    });
  }, [items]);
  
  const hasSpotifyPremiumInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return productName.includes('spotify') && productName.includes('premium');
    });
  }, [items]);
  
  const hasDiscordNitroInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return productName.includes('discord') && productName.includes('nitro');
    });
  }, [items]);
  
  const hasRobloxRobuxInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return productName.includes('roblox') || productName.includes('robux');
    });
  }, [items]);
  
  const hasSteamGamesInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return productName.includes('steam') && productName.includes('game');
    });
  }, [items]);
  
  const hasPlayStationGamesInCart = useCallback(() => {
    return items.some(item => {
      const productName = item.name.toLowerCase();
      return productName.includes('playstation') || (productName.includes('ps') && productName.includes('game'));
    });
  }, [items]);
  
  // Check if cart has other types of items besides Steam or PlayStation games
  const hasOtherItemTypes = useCallback(() => {
    return items.some(item => 
      !item.type.toLowerCase().includes('steam') && 
      !item.type.toLowerCase().includes('playstation')
    );
  }, [items]);
  
  // Get platform-specific delivery instructions based on cart contents
  const getPlatformDeliveryInstructions = () => {
    if (hasSteamGamesInCart() && !hasOtherItemTypes()) {
      return (
        <div className={`mt-4 p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            How to Redeem Your Steam Key
          </h3>
          <ol className={`list-decimal list-inside text-xs space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Open Steam and log in to your account</li>
            <li>Go to Games → Activate a Product on Steam</li>
            <li>Enter your key and download the game</li>
          </ol>
        </div>
      );
    } else if (hasPlayStationGamesInCart() && !hasOtherItemTypes()) {
      return (
        <div className={`mt-4 p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            How to Redeem Your PSN Code
          </h3>
          <ol className={`list-decimal list-inside text-xs space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Go to Settings → Users and Accounts → Account → Redeem Code</li>
            <li>Enter the 12-digit PlayStation Network code</li>
            <li>Confirm to redeem to your account</li>
          </ol>
        </div>
      );
    }
    return null;
  };
  
  // Debug the cart items - remove in production
  React.useEffect(() => {
    console.log("Cart items:", items);
    console.log("FIFA Points in cart:", hasFIFAPointsInCart());
    console.log("Apex Coins in cart:", hasApexCoinsInCart());
    console.log("Valorant Points in cart:", hasValorantInCart());
    console.log("Brawl Stars in cart:", hasBrawlStarsInCart());
    console.log("Discord Nitro in cart:", hasDiscordNitroInCart());
    console.log("Spotify Premium in cart:", hasSpotifyPremiumInCart());
    console.log("Roblox Robux in cart:", hasRobloxRobuxInCart());
  }, [items, hasFIFAPointsInCart, hasApexCoinsInCart, hasValorantInCart, hasBrawlStarsInCart, hasDiscordNitroInCart, hasSpotifyPremiumInCart, hasRobloxRobuxInCart]);
  
  // Check if platform selection is required
  const requiresPlatformSelection = () => {
    // If cart has Steam games, platform is automatically PC
    if (hasSteamGamesInCart() && !hasOtherItemTypes()) {
      return false;
    }
    
    // If cart has PlayStation games, platform is automatically PlayStation
    if (hasPlayStationGamesInCart() && !hasOtherItemTypes()) {
      return false;
    }
    
    const firstItem = items[0]?.name || '';
    
    // Don't require platform for certain products
    if (
      PLATFORM_EXEMPT_PRODUCTS.some(product => 
        firstItem.toLowerCase().includes(product.toLowerCase())
      )
    ) {
      return false;
    }
    
    // Special cases
    if (hasBrawlStarsInCart()) {
      return false; // Brawl Stars is mobile only
    }

    // Return true for all other products that need platform selection
    return true;
  };

  // Check if there's a game-specific delivery option to show
  const showGameSpecificDelivery = useCallback(() => {
    return (
      hasValorantInCart() || 
      hasBrawlStarsInCart() || 
      hasApexCoinsInCart() || 
      hasFIFAPointsInCart() || 
      hasSpotifyPremiumInCart() ||
      hasDiscordNitroInCart() ||
      hasRobloxRobuxInCart()
    );
  }, [
    hasValorantInCart, 
    hasBrawlStarsInCart, 
    hasApexCoinsInCart, 
    hasFIFAPointsInCart, 
    hasSpotifyPremiumInCart,
    hasDiscordNitroInCart,
    hasRobloxRobuxInCart
  ]);
  
  // Get the correct default delivery method based on cart contents
  const getDefaultDeliveryMethod = () => {
    if (hasValorantInCart()) return valorantDeliveryOption;
    if (hasBrawlStarsInCart()) return 'direct';
    if (hasApexCoinsInCart() || hasFIFAPointsInCart()) return apexFCDeliveryOption;
    if (hasSpotifyPremiumInCart()) return 'direct';
    if (hasDiscordNitroInCart()) return 'gift_link';
    if (hasRobloxRobuxInCart()) return deliveryMethod || 'giftcard';
    return deliveryMethod;
  };
  
  // Move to next step
  const goToNextStep = () => {
    if (currentStep === 'payment') {
      if (paymentMethod === 'paypal' && !paymentProof) {
        setFormError('Please upload your PayPal payment screenshot before proceeding');
        return;
      }
      if (paymentMethod === 'paysafecard' && (!paymentData.country || !paymentData.pin || paymentData.pin.length !== 16)) {
        setFormError('Please fill in all Paysafecard details');
        return;
      }
      setCurrentStep('delivery');
      
      // Auto-select platform for Steam games
      if (hasSteamGamesInCart() && !hasOtherItemTypes()) {
        setSelectedPlatform('PC');
      }
      
      // Auto-select platform for PlayStation games
      if (hasPlayStationGamesInCart() && !hasOtherItemTypes()) {
        setSelectedPlatform('PlayStation');
      }
    } else if (currentStep === 'delivery') {
      if (!email) {
        setFormError('Please enter your email address');
        return;
      }
      
      // Account info validation for account delivery
      if ((hasApexCoinsInCart() || hasFIFAPointsInCart()) && apexFCDeliveryOption === 'account') {
        if (!accountEmail || !accountPassword) {
          setFormError('Please enter your account email and password');
          return;
        }
      }
      
      setCurrentStep('confirmation');
    }
    
    setFormError(null);
  };
  
  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep === 'delivery') {
      setCurrentStep('payment');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('delivery');
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // This is part of step navigation, not final submission logic by itself.
      // The actual order creation happens when currentStep is 'confirmation'.
      if (currentStep !== 'confirmation') {
        // Original logic for step navigation - assuming this is intended.
        // If currentStep is 'delivery', it seems to imply moving *back* to 'payment'
        // which is unusual for a "next" step button.
        // Or, if it's 'payment', it moves to 'confirmation'.
        // This might need review for clarity, but preserving existing flow for now.
        setCurrentStep(currentStep === 'delivery' ? 'payment' : 'confirmation');
        setIsLoading(false);
        return;
      }

      // --- Start of new/modified logic for screenshot upload ---
      let finalScreenshotUrl: string | null = paymentScreenshotUrl; // Use pre-uploaded URL if available

      if (paymentMethod === 'paypal' && paymentProof) { // If PayPal and a new file is selected
        try {
          // We need a unique identifier for the upload path.
          // If orderID is not yet available, use userID + timestamp.
          const placeholderId = currentUser ? `paypal-${currentUser.uid}-${Date.now()}` : `paypal-guest-${Date.now()}`;
          
          if (typeof uploadPaymentProof !== 'function') {
            console.error("uploadPaymentProof is not available or not a function");
            setFormError("Screenshot upload service is currently unavailable. Please try again later.");
            setIsLoading(false);
            return;
          }
          
          // Corrected argument order: orderID (placeholderId), then imageData (paymentProof)
          if (paymentProof instanceof File) { // Explicit type guard
            finalScreenshotUrl = await uploadPaymentProof(placeholderId, paymentProof);
          } else {
            // This should not be reached due to the outer if (paymentMethod === 'paypal' && paymentProof)
            console.error("Critical error: paymentProof was expected to be a File but it is not.");
            setFormError("A problem occurred with the payment proof file. Please re-select it.");
            setIsLoading(false);
            return;
          }
          // Update state as well so UI reflects the direct upload if needed elsewhere,
          // though handleSubmit is the critical point for orderData.
          setPaymentScreenshotUrl(finalScreenshotUrl);

        } catch (uploadError: any) {
          console.error("Error uploading payment proof during submit:", uploadError);
          setFormError(uploadError.message || 'Failed to upload payment proof. Please try again.');
          setIsLoading(false);
          return;
        }
      }
      // --- End of new/modified logic for screenshot upload ---

      // Check if payment proof is required and provided *after potential upload*
      if (paymentMethod === 'paypal' && !finalScreenshotUrl) {
        setFormError('Please upload your PayPal payment screenshot before proceeding');
        setIsLoading(false);
        return;
      }
      if (paymentMethod === 'paysafecard' && (!paymentData.country || !paymentData.pin || paymentData.pin.length !== 16)) {
        setFormError('Please fill in all Paysafecard details');
        setIsLoading(false);
        return;
      }
      setCurrentStep('delivery');

      // Get the product details from the cart items
      const productName = items.length > 0 ? items[0].name : '';
      const productTier = items.length > 0 ? items[0].amount : '';
      
      // Calculate total with delivery fee
      const totalWithDeliveryFee = subtotalAfterDiscount + expressFee;
      
      // Set up payment details based on payment method
      let paymentDetails: any = {}; // Ensure paymentDetails is always an object
      if (paymentMethod === 'paypal') {
        // PayPal details are primarily handled by the payment screenshot
        // If there are other specific details for PayPal, they can be added here.
        // PayPal details are handled by the payment screenshot
        paymentDetails = {};
      } else if (paymentMethod === 'paysafecard') {
        paymentDetails = {
          country: paymentData.country,
          code: paymentData.pin
        };
      }
      
      // Create the order data from the cart items
      const orderData: Omit<Order, 'orderID' | 'status' | 'createdAt' | 'queuePosition' | 'estimatedDeliveryTime'> = {
        product: productName,
        tier: productTier,
        price: totalWithDeliveryFee.toString(),
        buyerEmail: email,
        paymentMethod: paymentMethod as PaymentMethod,
        gameUsername,
        // Only include platform if it's selected
        ...(selectedPlatform ? { platform: selectedPlatform } : {}),
        items: items.map(item => ({
          product: item.name,
          amount: item.amount,
          price: item.price.toString(),
          quantity: item.quantity
        })),
        totalPrice: totalWithDeliveryFee.toString(),
        currency: currency,
        // ... existing code ...
        // Only include displayCurrency and displayTotalPrice if using a different currency
        ...(selectedCurrency !== currency ? {
          displayCurrency: selectedCurrency,
          displayTotalPrice: convertedTotal.toString()
        } : {}),
        deliveryType,
        deliveryMethod: getDefaultDeliveryMethod(),
        paymentDetails,
        // Add promo code info if applied
        ...(appliedPromo ? {
          promoCode: appliedPromo.code,
          promoDiscount: promoDiscount,
          promoId: appliedPromo.id
        } : {}),
        deliveryDetails: {
          // Game-specific delivery options
          ...(hasValorantInCart() && { 
            valorantDeliveryOption,
            accountCountry
          }),
          ...(hasApexCoinsInCart() || hasFIFAPointsInCart() ? {
            deliveryOption: apexFCDeliveryOption,
            ...(apexFCDeliveryOption === 'account' && {
              accountEmail,
              accountPassword,
              needs2FA
            }),
            ...(apexFCDeliveryOption === 'giftcard' && {
              accountCountry
            })
          } : {}),
          ...(hasSpotifyPremiumInCart() && deliveryMethod === 'direct' ? {
            accountEmail,
            accountPassword
          } : {}),
          ...(hasDiscordNitroInCart() && {
            deliveryMethod: 'gift_link',
            recipientEmail: email
          }),
          ...(hasBrawlStarsInCart() && {
            deliveryMethod: 'direct',
            gameUsername,
            platform: selectedPlatform
          }),
          ...(hasRobloxRobuxInCart() && {
            deliveryMethod: deliveryMethod || 'giftcard',
            ...(deliveryMethod === 'direct' && {
              robloxUsername: gameUsername
            }),
            ...(deliveryMethod === 'giftcard' && {
              accountCountry
            })
          }),
          ...(isMultipleAccounts && multipleAccounts ? { 
            multipleAccounts 
          } : {}),
          // Include game details if available in any cart item
          ...items.reduce((gameDetailsObj, item) => {
            if (item.gameDetails) {
              // For games from Steam or PSN, add those details
              if (item.gameDetails.platform === 'Steam' || item.gameDetails.platform === 'PSN') {
                return {
                  ...gameDetailsObj,
                  gameUrl: item.gameDetails.originalUrl,
                  originalPrice: item.gameDetails.originalPrice,
                  imageUrl: item.gameDetails.imageUrl,
                  userEmail: item.gameDetails.userEmail || email,
                  userMessage: item.gameDetails.message || '',
                  gamePlatform: item.gameDetails.platform
                };
              }
            }
            return gameDetailsObj;
          }, {})
        },
        country: accountCountry || '',
        notes: additionalNotes,
        // Add screenshot URL if available, using the potentially newly uploaded or existing URL
        ...(finalScreenshotUrl ? { screenshotURL: finalScreenshotUrl } : {}),
        isExpress: deliveryType === 'Express' // Ensure isExpress is explicitly set
      };
      
      // Create order
      const newOrderID = await createOrder(orderData);
      
      // If a promo code was used, update its usage count
      if (appliedPromo && appliedPromo.id) {
        try {
          await updatePromoCodeUsage(appliedPromo.id);
        } catch (error) {
          console.error('Error updating promo code usage:', error);
          // Don't fail the order if promo code update fails
        }
      }
      
      setOrderID(newOrderID);
      setCurrentStep('complete');
      setFormSuccess(true);
      
      // Clear the cart after successful order
      clearCart();
      
      if (onOrderCreated) {
        onOrderCreated(newOrderID);
      }
    } catch (error: any) {
      setFormError(error.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle screenshot upload success
  const handleUploadSuccess = (url: string) => {
    setPaymentScreenshotUrl(url);
    setFormError(null);
  };
  
  // Handle screenshot upload error
  const handleUploadError = (error: string) => {
    setFormError(error);
  };
  
  // Reset form
  const handleReset = () => {
    setPaymentMethod('');
    setPaymentData({});
    setPaymentProof(null);
    setDeliveryMethod('direct');
    setSelectedPlatform(undefined);
    setEmail('');
    setGameUsername('');
    setMultipleAccounts('');
    setIsMultipleAccounts(false);
    // Reset game-specific options
    setValorantDeliveryOption('direct');
    setApexFCDeliveryOption('giftcard');
    setAccountCountry('Turkey');
    setAccountEmail('');
    setAccountPassword('');
    setNeeds2FA(false);
    // Reset form state
    setFormError(null);
    setFormSuccess(false);
    setOrderID(null);
    setCurrentStep('payment');
  };
  
  // Check if express delivery is selected
  const isExpressDelivery = deliveryType === 'Express';
  
  // Handle promo code application
  const handleApplyPromo = (promoCode: PromoCode, discount: number) => {
    setAppliedPromo(promoCode);
    setPromoDiscount(discount);
  };
  
  // Handle promo code removal
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
  };
  
  // Render payment step  
  const renderPaymentStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">1. Payment</h3>
        
        <PaymentSection
          selectedMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          onPaymentProofChange={setPaymentProof}
          onPaymentDataChange={setPaymentData}
          paymentData={paymentData}
          isExpressDelivery={isExpressDelivery}
        />

        {/* Navigation buttons */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (paymentMethod === 'paypal' && !paymentProof) {
                alert('Please upload payment screenshot');
                return;
              }
              if (paymentMethod === 'paysafecard' && (!paymentData.country || !paymentData.pin || paymentData.pin.length !== 16)) {
                alert('Please fill in all Paysafecard details');
                return;
              }
              setCurrentStep('delivery');
            }}
            disabled={!paymentMethod}
            className={`
              px-8 py-3 rounded-full font-medium transition-all duration-300 transform
              ${paymentMethod
                ? 'bg-gradient-to-r from-accent to-purple-600 text-white hover:scale-105 hover:shadow-lg active:scale-95' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue to Delivery
          </button>
        </div>
      </div>
    );
  };
  
  // Render delivery details step
  const renderDeliveryStep = () => {
    // For Steam games, only offer "Steam Key" delivery
    if (hasSteamGamesInCart() && !hasOtherItemTypes()) {
    return (
        <div className="space-y-8">
          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Delivery Information
            </h2>
            
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } mb-6`}>
              <div className="mb-4">
                <div className="flex items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Platform: <span className="text-accent">PC (Steam)</span>
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Delivery Method: <span className="text-accent">Steam Key</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Add PlatformSelector here for Steam games */}
            <PlatformSelector headerText="How to Receive" />
            
          </div>
          
          {/* User Info */}
          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Information
            </h2>
            
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-4">
        {/* Email */}
        <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Where we'll send your game key"
                    className={`w-full px-4 py-2 rounded-lg ${
                      !isValidEmail(email) && email !== '' ? 'border-red-500' : 'border-gray-300'
                    } ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                  {!isValidEmail(email) && email !== '' && (
                    <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
                  )}
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    We'll send your purchase details to this email
                  </p>
                </div>
                
                {/* Game Link */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Game Link
                  </label>
                  <div className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700/50 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-300'
                  }`}>
                    {items.reduce((url, item) => {
                      if (item.gameDetails?.originalUrl) {
                        return item.gameDetails.originalUrl;
                      }
                      return url;
                    }, 'No game link provided')}
                  </div>
                </div>
                
                {/* Notes */}
                <div>
                  <label htmlFor="notes" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any special requests or information"
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={goToPreviousStep}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300 transform
                ${isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105 active:scale-95'
                }
              `}
            >
              ← Back
            </button>
            <button
              onClick={goToNextStep}
              disabled={!isValidEmail(email)}
              className={`
                px-8 py-3 rounded-full font-medium transition-all duration-300 transform
                ${isValidEmail(email)
                  ? 'bg-gradient-to-r from-accent to-purple-600 text-white hover:scale-105 hover:shadow-lg active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Continue to Review →
            </button>
          </div>
        </div>
      );
    }
    
    // For PlayStation games, only offer "PS Code" delivery
    if (hasPlayStationGamesInCart() && !hasOtherItemTypes()) {
      return (
        <div className="space-y-8">
          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Delivery Information
            </h2>
            
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } mb-6`}>
              <div className="mb-4">
                <div className="flex items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Platform: <span className="text-accent">PlayStation</span>
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Delivery Method: <span className="text-accent">PlayStation Code</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Add PlatformSelector here for PlayStation games */}
            <PlatformSelector headerText="How to Receive" />

          </div>
          
          {/* User Info */}
          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Information
            </h2>
            
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Where we'll send your game code"
                    className={`w-full px-4 py-2 rounded-lg ${
                      !isValidEmail(email) && email !== '' ? 'border-red-500' : 'border-gray-300'
                    } ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                  {!isValidEmail(email) && email !== '' && (
                    <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
                  )}
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    We'll send your purchase details to this email
                  </p>
                </div>
                
                {/* Game Link */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Game Link
                  </label>
                  <div className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700/50 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-300'
                  }`}>
                    {items.reduce((url, item) => {
                      if (item.gameDetails?.originalUrl) {
                        return item.gameDetails.originalUrl;
                      }
                      return url;
                    }, 'No game link provided')}
                  </div>
                </div>
                
                {/* Notes */}
                <div>
                  <label htmlFor="notes" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any special requests or information"
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-accent`}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={goToPreviousStep}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300 transform
                ${isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105 active:scale-95'
                }
              `}
            >
              ← Back
            </button>
            <button
              onClick={goToNextStep}
              disabled={!isValidEmail(email)}
              className={`
                px-8 py-3 rounded-full font-medium transition-all duration-300 transform
                ${isValidEmail(email)
                  ? 'bg-gradient-to-r from-accent to-purple-600 text-white hover:scale-105 hover:shadow-lg active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Continue to Review →
            </button>
          </div>
        </div>
      );
    }
    
    // For other types of products, continue with the original code...
    // ... existing code ...
    
    // For mixed cart or other items, use the original delivery step
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">2. Delivery Information</h3>
        
        {/* Email input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email for delivery and updates"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 focus:border-accent' 
                : 'bg-white border-gray-300 focus:border-accent'
            } focus:outline-none focus:ring-1 focus:ring-accent`}
          />
        </div>
        
        {/* Game Username input */}
        <div>
          <label htmlFor="gameUsername" className="block text-sm font-medium mb-2">
            Game Username/ID *
          </label>
          <input
            type="text"
            id="gameUsername"
            value={gameUsername}
            onChange={(e) => setGameUsername(e.target.value)}
            placeholder="Your in-game username or ID"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 focus:border-accent' 
                : 'bg-white border-gray-300 focus:border-accent'
            } focus:outline-none focus:ring-1 focus:ring-accent`}
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any specific instructions or information for your order"
            rows={3}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 focus:border-accent' 
                : 'bg-white border-gray-300 focus:border-accent'
            } focus:outline-none focus:ring-1 focus:ring-accent`}
          />
          <p className="mt-1 text-xs opacity-70">
            Add any additional information we should know about your order
          </p>
        </div>
        
        {/* Multiple accounts option */}
        <div>
          <div className="flex items-center mb-2">
            <input 
              type="checkbox" 
              id="multipleAccounts" 
              checked={isMultipleAccounts}
              onChange={(e) => setIsMultipleAccounts(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <label htmlFor="multipleAccounts" className="ml-2 text-sm font-medium">
              I need to specify multiple accounts
            </label>
          </div>
          
          {isMultipleAccounts && (
            <div>
              <textarea
                id="multipleAccountsDetails"
                value={multipleAccounts}
                onChange={(e) => setMultipleAccounts(e.target.value)}
                placeholder="Enter multiple account details (one per line)&#10;Format: Username - Amount&#10;Example:&#10;Player1 - 1000 V-Bucks&#10;Player2 - 2000 V-Bucks"
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-surface-dark border-white/10 focus:border-accent' 
                    : 'bg-white border-gray-300 focus:border-accent'
                } focus:outline-none focus:ring-1 focus:ring-accent`}
              />
              <p className="mt-1 text-xs opacity-70">
                Specify multiple accounts if you want to split your purchase between different users
              </p>
            </div>
          )}
        </div>
        
        {/* Platform Selection for game products */}
        {requiresPlatformSelection() && (
          <PlatformSelector
            headerText="How to Receive"
          />
        )}
        
        {/* Delivery Method */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Delivery Method
          </label>
          
          {/* Game-specific delivery options */}
          {hasValorantInCart() && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold">Valorant Points Delivery Options:</h4>
              
              {/* Direct topup option */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  valorantDeliveryOption === 'direct' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setValorantDeliveryOption('direct')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    valorantDeliveryOption === 'direct' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {valorantDeliveryOption === 'direct' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Direct Top-up</span>
                </div>
                
                {valorantDeliveryOption === 'direct' && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm mb-2">Required information:</p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="accountCountry" className="block text-xs mb-1">
                          Account Country *
                        </label>
                        <select
                          id="accountCountry"
                          value={accountCountry}
                          onChange={(e) => setAccountCountry(e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        >
                          {ALL_COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs opacity-70">
                          This is your account's region, not your geographical location. Turkish account is NOT required.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        We'll directly add Valorant Points to your account using your Riot ID.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Gift card option */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  valorantDeliveryOption === 'giftcard' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setValorantDeliveryOption('giftcard')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    valorantDeliveryOption === 'giftcard' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {valorantDeliveryOption === 'giftcard' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Gift Card Code</span>
                </div>
                
                {valorantDeliveryOption === 'giftcard' && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm mb-2">Required information:</p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="accountCountryGift" className="block text-xs mb-1">
                          Account Country *
                        </label>
                        <select
                          id="accountCountryGift"
                          value={accountCountry}
                          onChange={(e) => setAccountCountry(e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        >
                          {ALL_COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs opacity-70">
                          This is your account's region, not your geographical location. Turkish account is NOT required.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        You'll receive a gift card code to redeem in your Valorant account. Detailed redemption instructions will be provided based on your selected platform.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {hasBrawlStarsInCart() && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold">Brawl Stars Gems Delivery:</h4>
              
              {/* Direct topup option - only option for Brawl Stars */}
              <div className="p-3 rounded-lg border border-accent bg-accent/5">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-accent">
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  </div>
                  <span className="ml-3 font-medium">Direct Top-up (Mobile Only)</span>
                </div>
                
                <div className="mt-3 ml-8">
                  <p className="text-sm mb-2">Required information:</p>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="accountCountryBS" className="block text-xs mb-1">
                        Account Country *
                      </label>
                      <select
                        id="accountCountryBS"
                        value={accountCountry}
                        onChange={(e) => setAccountCountry(e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                          isDarkMode 
                            ? 'bg-surface-dark border-white/10 focus:border-accent' 
                            : 'bg-white border-gray-300 focus:border-accent'
                        } focus:outline-none focus:ring-1 focus:ring-accent`}
                      >
                        {ALL_COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs opacity-70">
                        This is your account's region, not your geographical location. Turkish account is NOT required.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs font-medium text-blue-600 mb-1">💎 How to Redeem Brawl Stars Gems:</p>
                    <ul className="text-xs text-blue-600 list-disc pl-4">
                      <li>Open Brawl Stars and tap your player icon (top-left)</li>
                      <li>Copy your Player Tag (e.g. #8G2YJRR) and provide it in the Game Username field</li>
                      <li>After payment is confirmed, your gems will be added directly to your account</li>
                      <li>No need to log out — just stay online or reopen the app after delivery</li>
                      <li>Orders are usually completed within 15–60 minutes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(hasApexCoinsInCart() || hasFIFAPointsInCart()) && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold">{hasApexCoinsInCart() ? 'Apex Coins' : 'FIFA FC Points'} Delivery Options:</h4>
              
              {/* Account delivery option */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  apexFCDeliveryOption === 'account' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setApexFCDeliveryOption('account')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    apexFCDeliveryOption === 'account' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {apexFCDeliveryOption === 'account' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Account Delivery (Faster)</span>
                </div>
                
                {apexFCDeliveryOption === 'account' && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm mb-2">Required account information:</p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="accountEmail" className="block text-xs mb-1">
                          Account Email/Username *
                        </label>
                        <input
                          type="text"
                          id="accountEmail"
                          value={accountEmail}
                          onChange={(e) => setAccountEmail(e.target.value)}
                          placeholder="Your EA account email or username"
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        />
                      </div>
                      <div>
                        <label htmlFor="accountPassword" className="block text-xs mb-1">
                          Account Password *
                        </label>
                        <input
                          type="password"
                          id="accountPassword"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          placeholder="Your EA account password"
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="needs2FA" 
                          checked={needs2FA}
                          onChange={(e) => setNeeds2FA(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                        />
                        <label htmlFor="needs2FA" className="ml-2 text-xs">
                          I have 2FA enabled (not required)
                        </label>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        We'll log into your account and add the {hasApexCoinsInCart() ? 'Apex Coins' : 'FIFA FC Points'} directly. 
                        This is the fastest method. Your account credentials are securely handled and never stored.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Gift card option */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  apexFCDeliveryOption === 'giftcard' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setApexFCDeliveryOption('giftcard')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    apexFCDeliveryOption === 'giftcard' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {apexFCDeliveryOption === 'giftcard' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Gift Card Code</span>
                </div>
                
                {apexFCDeliveryOption === 'giftcard' && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm mb-2">Required information:</p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="accountCountryEA" className="block text-xs mb-1">
                          Account Country *
                        </label>
                        <select
                          id="accountCountryEA"
                          value={accountCountry}
                          onChange={(e) => setAccountCountry(e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        >
                          {ALL_COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs opacity-70">
                          This is your account's region, not your geographical location. Turkish account is NOT required.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        You'll receive a gift card code to redeem for {hasApexCoinsInCart() ? 'Apex Coins' : 'FIFA FC Points'}. Detailed redemption instructions will be provided based on your selected platform.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {hasDiscordNitroInCart() && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold">Discord Nitro Delivery:</h4>
              
              {/* Discord Nitro option - only gift link available */}
              <div className="p-3 rounded-lg border border-accent bg-accent/5">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-accent">
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  </div>
                  <span className="ml-3 font-medium">Gift Link (Email Delivery)</span>
                </div>
                
                <div className="mt-3 ml-8">
                  <p className="text-sm mb-2">Information:</p>
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-600">
                      You'll receive an email with a Discord Nitro gift link. The gift link can be redeemed on any platform where Discord is available.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {hasRobloxRobuxInCart() && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold">Roblox Robux Delivery Options:</h4>
              
              {/* Option 1: Gift Card */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  deliveryMethod === 'giftcard' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setDeliveryMethod('giftcard')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'giftcard' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {deliveryMethod === 'giftcard' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Roblox Gift Card Code</span>
                </div>
                
                {deliveryMethod === 'giftcard' && (
                  <div className="mt-3 ml-8">
                    <div className="mt-2">
                      <label htmlFor="accountCountryRobux" className="block text-xs mb-1">
                        Select your account region
                      </label>
                      <select
                        id="accountCountryRobux"
                        value={accountCountry}
                        onChange={(e) => setAccountCountry(e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                          isDarkMode 
                            ? 'bg-surface-dark border-white/10 focus:border-accent' 
                            : 'bg-white border-gray-300 focus:border-accent'
                        } focus:outline-none focus:ring-1 focus:ring-accent`}
                      >
                        {['Turkey', 'United States', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'Argentina', 'Other'].map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        You'll receive a Roblox gift card code that can be redeemed on the Roblox website or app.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Option 2: Direct Account Delivery */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  deliveryMethod === 'direct' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setDeliveryMethod('direct')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'direct' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {deliveryMethod === 'direct' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Direct Account Delivery</span>
                </div>
                
                {deliveryMethod === 'direct' && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm mb-2">Required information:</p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="robloxUsername" className="block text-xs mb-1">
                          Roblox Username *
                        </label>
                        <input
                          type="text"
                          id="robloxUsername"
                          value={gameUsername}
                          onChange={(e) => setGameUsername(e.target.value)}
                          placeholder="Your Roblox username"
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        />
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        We'll add the Robux directly to your account. Make sure your username is correct.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {hasSpotifyPremiumInCart() && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold">Spotify Premium Delivery Options:</h4>
              
              {/* Option 1: Fresh Account */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  deliveryMethod === 'account' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setDeliveryMethod('account')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'account' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {deliveryMethod === 'account' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Fresh Account (Ready to Use)</span>
                </div>
                
                {deliveryMethod === 'account' && (
                  <div className="mt-3 ml-8">
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        We'll create a new Spotify Premium account and send you the login details. Just log in and start using Premium immediately.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Option 2: Your Own Account */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  deliveryMethod === 'direct' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setDeliveryMethod('direct')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'direct' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {deliveryMethod === 'direct' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Your Own Account (Upgrade to Premium)</span>
                </div>
                
                {deliveryMethod === 'direct' && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm mb-2">Required account information:</p>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="accountEmail" className="block text-xs mb-1">
                          Spotify Email/Username *
                        </label>
                        <input
                          type="text"
                          id="accountEmail"
                          value={accountEmail}
                          onChange={(e) => setAccountEmail(e.target.value)}
                          placeholder="Your Spotify account email or username"
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        />
                      </div>
                      <div>
                        <label htmlFor="accountPassword" className="block text-xs mb-1">
                          Spotify Password *
                        </label>
                        <input
                          type="password"
                          id="accountPassword"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          placeholder="Your Spotify account password"
                          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                            isDarkMode 
                              ? 'bg-surface-dark border-white/10 focus:border-accent' 
                              : 'bg-white border-gray-300 focus:border-accent'
                          } focus:outline-none focus:ring-1 focus:ring-accent`}
                        />
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-xs text-blue-600">
                        We'll apply Premium directly to your existing Spotify account. Your account credentials are securely handled and never stored.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Default delivery options for other products */}
          {!showGameSpecificDelivery() && (
            <div className="space-y-3">
              {/* Direct Delivery Option */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  deliveryMethod === 'direct' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setDeliveryMethod('direct')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'direct' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {deliveryMethod === 'direct' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Direct Delivery</span>
                </div>
                
                <p className="mt-2 text-sm ml-8">
                  We'll directly apply the purchase to your account using your provided game username/ID.
                </p>
              </div>
              
              {/* Account Delivery Option */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  deliveryMethod === 'account' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setDeliveryMethod('account')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'account' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {deliveryMethod === 'account' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Account Delivery</span>
                </div>
                
                <p className="mt-2 text-sm ml-8">
                  We'll provide you with account login details that have the product already applied.
                </p>
              </div>
              
              {/* Code Delivery Option */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer ${
                  deliveryMethod === 'code' 
                    ? 'border-accent bg-accent/5' 
                    : isDarkMode 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setDeliveryMethod('code')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    deliveryMethod === 'code' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {deliveryMethod === 'code' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Redemption Code</span>
                </div>
                
                <p className="mt-2 text-sm ml-8">
                  We'll send you a code to redeem the product yourself in the appropriate platform.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={goToPreviousStep}
            className={`
              px-6 py-3 rounded-full font-medium transition-all duration-300 transform
              ${isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105 active:scale-95'
              }
            `}
          >
            ← Back
          </button>
          <button
            onClick={goToNextStep}
            disabled={!isValidEmail(email)}
            className={`
              px-8 py-3 rounded-full font-medium transition-all duration-300 transform
              ${isValidEmail(email)
                ? 'bg-gradient-to-r from-accent to-purple-600 text-white hover:scale-105 hover:shadow-lg active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue to Review →
          </button>
        </div>
      </div>
    );
  };
  
  // Render confirmation step
  const renderConfirmationStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">3. Confirm Order</h3>
        
        <div className={`p-5 rounded-lg ${isDarkMode ? 'bg-surface-dark/80' : 'bg-gray-100'}`}>
          <h4 className="font-medium mb-3">Order Summary</h4>
          
          {items.map((item, index) => (
            <div key={item.id} className={`py-2 ${index > 0 ? 'border-t border-white/10' : ''}`}>
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{item.amount} x {item.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          ))}
          
          <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-bold">
            <span>Subtotal:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          {deliveryType === 'Express' && (
            <div className="flex justify-between text-purple-500">
              <span>Express Delivery Fee:</span>
              <span className="font-medium">+{formatPrice(expressFee)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold mt-1 pt-1 border-t border-white/10">
            <span>Total:</span>
            <span>{formatPrice(totalWithExpressFee)}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-medium">{paymentMethod}</span>
          </div>
          
          {paymentMethod === 'paypal' && (
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-medium">Screenshot uploaded</span>
            </div>
          )}
          
          {paymentMethod === 'paysafecard' && paymentData.country && (
            <div className="flex justify-between">
              <span>Country:</span>
              <span className="font-medium">{paymentData.country}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Delivery Type:</span>
            <span className={`font-medium ${deliveryType === 'Express' ? 'text-purple-500' : ''}`}>
              {deliveryType}
              {deliveryType === 'Express' && ' (Priority Queue)'}
            </span>
          </div>
          
          {/* Game-specific delivery information */}
          {hasValorantInCart() && (
            <>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium">
                  {valorantDeliveryOption === 'direct' ? 'Direct Top-up' : 'Gift Card Code'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Account Country:</span>
                <span className="font-medium">{accountCountry}</span>
              </div>
            </>
          )}
          
          {hasBrawlStarsInCart() && (
            <>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium">Direct Top-up (Mobile Only)</span>
              </div>
              <div className="flex justify-between">
                <span>Account Country:</span>
                <span className="font-medium">{accountCountry}</span>
              </div>
            </>
          )}
          
          {(hasApexCoinsInCart() || hasFIFAPointsInCart()) && (
            <>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium">
                  {apexFCDeliveryOption === 'account' ? 'Account Delivery' : 'Gift Card Code'}
                </span>
              </div>
              {apexFCDeliveryOption === 'account' ? (
                <>
                  <div className="flex justify-between">
                    <span>Account Email:</span>
                    <span className="font-medium">{accountEmail}</span>
                  </div>
                  {needs2FA && (
                    <div className="flex justify-between">
                      <span>2FA Enabled:</span>
                      <span className="font-medium">Yes</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Account Country:</span>
                  <span className="font-medium">{accountCountry}</span>
                </div>
              )}
            </>
          )}
          
          {hasDiscordNitroInCart() && (
            <div className="flex justify-between">
              <span>Delivery Method:</span>
              <span className="font-medium">Gift Link (Email Delivery)</span>
            </div>
          )}
          
          {hasRobloxRobuxInCart() && (
            <>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium">
                  {deliveryMethod === 'direct' ? 'Direct Account Delivery' : 'Roblox Gift Card Code'}
                </span>
              </div>
              {deliveryMethod === 'direct' ? (
                <div className="flex justify-between">
                  <span>Roblox Username:</span>
                  <span className="font-medium">{gameUsername}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>Account Country:</span>
                  <span className="font-medium">{accountCountry}</span>
                </div>
              )}
            </>
          )}
          
          {hasSpotifyPremiumInCart() && (
            <>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium">
                  {deliveryMethod === 'account' ? 'Fresh Account (Ready to Use)' : 'Your Own Account (Upgrade to Premium)'}
                </span>
              </div>
              {deliveryMethod === 'direct' && (
                <div className="flex justify-between">
                  <span>Spotify Account Email:</span>
                  <span className="font-medium">{accountEmail}</span>
                </div>
              )}
            </>
          )}
          
          {!showGameSpecificDelivery() && (
            <div className="flex justify-between">
              <span>Delivery Method:</span>
              <span className="font-medium">{deliveryMethod === 'direct' ? 'Direct Delivery' : deliveryMethod === 'account' ? 'Account Delivery' : 'Redemption Code'}</span>
            </div>
          )}
          
          {/* Platform-specific delivery info for Steam games */}
          {hasSteamGamesInCart() && !hasOtherItemTypes() && (
            <>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium">Steam Key</span>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <span className="font-medium">PC</span>
              </div>
            </>
          )}
          
          {/* Platform-specific delivery info for PlayStation games */}
          {hasPlayStationGamesInCart() && !hasOtherItemTypes() && (
            <>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium">PlayStation Code</span>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <span className="font-medium">PlayStation</span>
              </div>
            </>
          )}
          
          {requiresPlatformSelection() && selectedPlatform && !(hasSteamGamesInCart() || hasPlayStationGamesInCart()) && (
            <div className="flex justify-between">
              <span>Platform:</span>
              <span className="font-medium">{selectedPlatform}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="font-medium">{email}</span>
          </div>
          
          {/* Only show game username for non-Steam and non-PlayStation games */}
          {!(hasPlayStationGamesInCart() || hasSteamGamesInCart()) && (
          <div className="flex justify-between">
            <span>Game Username/ID:</span>
            <span className="font-medium">{gameUsername}</span>
          </div>
          )}
          
          {/* Show additional notes if provided */}
          {additionalNotes && (
            <div className="mt-2">
              <span className="font-medium">Additional Notes:</span>
              <div className="mt-1 p-2 bg-white/10 rounded text-sm whitespace-pre-line">
                {additionalNotes}
              </div>
            </div>
          )}
          
          {isMultipleAccounts && multipleAccounts && (
            <div className="mt-2">
              <span className="font-medium">Multiple Accounts:</span>
              <div className="mt-1 p-2 bg-white/10 rounded text-sm whitespace-pre-line">
                {multipleAccounts}
              </div>
            </div>
          )}
        </div>
        
        {/* Disclaimer */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-100'}`}>
          <p className="text-sm">
            By clicking "Place Order" you agree to our terms and conditions.
            {paymentMethod === 'paypal' && ' Your payment screenshot has been uploaded and will be verified once the order is placed.'}
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={goToPreviousStep}
            className={`
              px-6 py-3 rounded-full font-medium transition-all duration-300 transform
              ${isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105 active:scale-95'
              }
            `}
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (paymentMethod === 'paypal' && !paymentProof)}
            className={`px-6 py-2 rounded-lg ${
              (isLoading || (paymentMethod === 'paypal' && !paymentProof))
                ? `${isDarkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'} text-gray-500`
                : `${isDarkMode ? 'bg-accent text-white hover:bg-accent/90' : 'bg-accent text-white hover:bg-accent/90'}`
            }`}
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    );
  };
  
  // Render order complete with payment upload
  if (currentStep === 'complete' && orderID) {
    return (
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark text-textLight' : 'bg-surface text-textDark'}`}>
        <div className="text-center mb-6">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="mt-2 text-xl font-medium">Order Created Successfully!</h3>
          <p className="mt-1 text-sm opacity-70">
            Your order ID is: <span className="font-medium">{orderID}</span>
          </p>
          
          {paymentMethod === 'paypal' ? (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600">
                <strong>Payment Proof Received</strong> - Your payment is being verified and your order is now being processed.
              </p>
            </div>
          ) : (
          <p className="mt-1 text-sm opacity-70">
            Please upload payment proof to proceed with your order.
          </p>
          )}
        </div>
        
        {paymentMethod !== 'paypal' && (
        <PaymentProofUpload
          orderID={orderID}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-white/5 text-textLight hover:bg-white/10' 
                : 'bg-gray-200 text-textDark hover:bg-gray-300'
            } transition-colors`}
          >
            Create Another Order
          </button>
        </div>
      </div>
    );
  }
  
  // Main form container
  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark text-textLight' : 'bg-surface text-textDark'}`}>
      <h2 className="text-xl font-bold mb-4">Create New Order</h2>
      
      {/* Progress Steps */}
      <div className="relative mb-12">
        {/* Progress Line Background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-20"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-accent to-green-500 transition-all duration-500 ease-out"
          style={{
            width: `${
              currentStep === 'payment' ? '16.66%' : 
              currentStep === 'delivery' ? '50%' : 
              currentStep === 'confirmation' ? '83.33%' : '100%'
            }`
          }}
        ></div>
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {['payment', 'delivery', 'confirmation'].map((step, index) => {
            const stepIndex = ['payment', 'delivery', 'confirmation'].indexOf(currentStep);
            const isActive = currentStep === step;
            const isCompleted = index < stepIndex;
            
            return (
              <div key={step} className="flex flex-col items-center">
                {/* Step Circle */}
                <div className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 transform
                  ${isActive ? 'scale-110' : 'scale-100'}
                  ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600' : ''}
                  ${isActive ? 'bg-gradient-to-br from-accent to-purple-600' : ''}
                  ${!isActive && !isCompleted ? (isDarkMode ? 'bg-gray-800 border-2 border-gray-700' : 'bg-gray-100 border-2 border-gray-300') : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                  
                  {/* Pulse Animation for Active Step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20"></div>
                  )}
                </div>
                
                {/* Step Label */}
                <span className={`
                  mt-2 text-xs font-medium capitalize transition-colors duration-300
                  ${isActive ? (isDarkMode ? 'text-accent' : 'text-accent') : ''}
                  ${isCompleted ? 'text-green-500' : ''}
                  ${!isActive && !isCompleted ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : ''}
                `}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Error Message */}
      {formError && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {formError}
        </div>
      )}
      
      {/* Current Step Content */}
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'delivery' && renderDeliveryStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  );
};

export default MultiStepOrderForm; 