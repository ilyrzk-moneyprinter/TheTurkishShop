import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { createOrder } from '../firebase/orderService';
import { 
  Order, 
  PaymentMethod, 
  DeliveryMethod,
  PayPalDetails,
  PaysafecardDetails
} from '../firebase/types';
import { products } from '../data/products';
import PaymentProofUpload from './PaymentProofUpload';

// Define form steps
type FormStep = 'product' | 'payment' | 'delivery' | 'confirmation' | 'complete';

// Country list for Paysafecard
const PAYSAFECARD_COUNTRIES = [
  'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 
  'United States', 'Canada', 'Australia', 'Netherlands', 'Belgium'
];

interface OrderFormProps {
  onOrderCreated?: (orderID: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated }) => {
  const { isDarkMode } = useTheme();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [orderID, setOrderID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>('product');
  
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PayPal');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paysafecardCountry, setPaysafecardCountry] = useState('');
  const [paysafecardCode, setPaysafecardCode] = useState('');
  
  // Delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('direct');
  
  // User details state
  const [email, setEmail] = useState('');
  const [gameUsername, setGameUsername] = useState('');
  
  // Get tiers for selected product
  const getProductTiers = () => {
    const product = products.find(p => p.name === selectedProduct);
    return product ? product.tiers : [];
  };
  
  // Get price for selected tier
  const getSelectedPrice = () => {
    const product = products.find(p => p.name === selectedProduct);
    const tier = product?.tiers.find(t => t.amount === selectedTier);
    return tier?.price || '';
  };
  
  // Get currency for selected product
  const getSelectedCurrency = () => {
    const product = products.find(p => p.name === selectedProduct);
    return product?.currency || '£';
  };
  
  // Move to next step
  const goToNextStep = () => {
    if (currentStep === 'product') {
      if (!selectedProduct || !selectedTier) {
        setFormError('Please select a product and tier');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (paymentMethod === 'PayPal' && !paypalEmail) {
        setFormError('Please enter your PayPal email');
        return;
      }
      if (paymentMethod === 'Paysafecard' && !paysafecardCountry) {
        setFormError('Please select your country');
        return;
      }
      setCurrentStep('delivery');
    } else if (currentStep === 'delivery') {
      if (!email || !gameUsername) {
        setFormError('Please fill in all required fields');
        return;
      }
      setCurrentStep('confirmation');
    }
    
    setFormError(null);
  };
  
  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('product');
    } else if (currentStep === 'delivery') {
      setCurrentStep('payment');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('delivery');
    }
  };
  
  // Handle order submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Create payment details based on payment method
      let paymentDetails: any = {};
      
      if (paymentMethod === 'PayPal') {
        paymentDetails = {
          email: paypalEmail
        };
      } else if (paymentMethod === 'Paysafecard') {
        paymentDetails = {
          country: paysafecardCountry,
          code: paysafecardCode
        };
      }
      
      // Create order data
      const orderData: Omit<Order, 'orderID' | 'status' | 'createdAt'> = {
        product: selectedProduct,
        tier: selectedTier,
        price: getSelectedPrice(),
        currency: getSelectedCurrency(),
        paymentMethod,
        paymentDetails,
        deliveryMethod,
        buyerEmail: email,
        gameUsername,
        country: paymentMethod === 'Paysafecard' ? paysafecardCountry : undefined,
        deliveryType: 'Standard',
      };
      
      // Create order
      const newOrderID = await createOrder(orderData);
      
      setOrderID(newOrderID);
      setCurrentStep('complete');
      setFormSuccess(true);
      
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
    // No need to change state, already in complete step
  };
  
  // Handle screenshot upload error
  const handleUploadError = (error: string) => {
    setFormError(error);
  };
  
  // Reset form
  const handleReset = () => {
    setSelectedProduct('');
    setSelectedTier('');
    setPaymentMethod('PayPal');
    setPaypalEmail('');
    setPaysafecardCountry('');
    setPaysafecardCode('');
    setDeliveryMethod('direct');
    setEmail('');
    setGameUsername('');
    setFormError(null);
    setFormSuccess(false);
    setOrderID(null);
    setCurrentStep('product');
  };
  
  // Render product selection step
  const renderProductStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">1. Select Your Product</h3>
        
        {/* Product Selection */}
        <div>
          <label htmlFor="product" className="block text-sm font-medium mb-1">
            Product *
          </label>
          <select
            id="product"
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedTier('');
            }}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 focus:border-accent' 
                : 'bg-white border-gray-300 focus:border-accent'
            } focus:outline-none focus:ring-1 focus:ring-accent`}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.name} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Tier Selection */}
        <div>
          <label htmlFor="tier" className="block text-sm font-medium mb-1">
            Tier/Amount *
          </label>
          <select
            id="tier"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            required
            disabled={!selectedProduct}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 focus:border-accent' 
                : 'bg-white border-gray-300 focus:border-accent'
            } focus:outline-none focus:ring-1 focus:ring-accent ${!selectedProduct ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <option value="">Select tier/amount</option>
            {getProductTiers().map((tier) => (
              <option key={tier.amount} value={tier.amount}>
                {tier.amount} - {getSelectedCurrency()}{tier.price}
              </option>
            ))}
          </select>
        </div>
        
        {/* Product Details */}
        {selectedProduct && selectedTier && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-accent/10' : 'bg-accent/5'} border border-accent/20`}>
            <h4 className="font-medium mb-2">Order Summary</h4>
            <p>Product: {selectedProduct}</p>
            <p>Amount: {selectedTier}</p>
            <p>Price: {getSelectedCurrency()}{getSelectedPrice()}</p>
          </div>
        )}
        
        {/* Next Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={goToNextStep}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
          >
            Next: Payment Method
          </button>
        </div>
      </div>
    );
  };
  
  // Render payment method step
  const renderPaymentStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">2. Select Payment Method</h3>
        
        {/* Payment Method Selection */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-3">
            <label className="font-medium">Payment Method *</label>
            
            {/* PayPal Option */}
            <div 
              className={`p-4 rounded-lg border cursor-pointer ${
                paymentMethod === 'PayPal' 
                  ? 'border-accent bg-accent/5' 
                  : isDarkMode 
                    ? 'border-white/10 hover:bg-white/5' 
                    : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setPaymentMethod('PayPal')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    paymentMethod === 'PayPal' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {paymentMethod === 'PayPal' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">PayPal</span>
                </div>
                <div className="text-accent font-medium">
                  {getSelectedCurrency()}{getSelectedPrice()}
                </div>
              </div>
              
              {paymentMethod === 'PayPal' && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm">
                    Please send payment to: <span className="font-medium">payments@theturkishshop.com</span>
                  </p>
                  <div>
                    <label htmlFor="paypalEmail" className="block text-sm mb-1">
                      Your PayPal Email *
                    </label>
                    <input
                      type="email"
                      id="paypalEmail"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="Your PayPal email address"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-surface-dark border-white/10 focus:border-accent' 
                          : 'bg-white border-gray-300 focus:border-accent'
                      } focus:outline-none focus:ring-1 focus:ring-accent`}
                    />
                  </div>
                  <div className="flex justify-center">
                    <a 
                      href="https://paypal.me/theturkishshop" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#0070BA] text-white rounded-lg inline-flex items-center"
                    >
                      Pay with PayPal
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Paysafecard Option */}
            <div 
              className={`p-4 rounded-lg border cursor-pointer ${
                paymentMethod === 'Paysafecard' 
                  ? 'border-accent bg-accent/5' 
                  : isDarkMode 
                    ? 'border-white/10 hover:bg-white/5' 
                    : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setPaymentMethod('Paysafecard')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    paymentMethod === 'Paysafecard' ? 'bg-accent' : 'bg-gray-300'
                  }`}>
                    {paymentMethod === 'Paysafecard' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 font-medium">Paysafecard</span>
                </div>
                <div className="text-accent font-medium">
                  {getSelectedCurrency()}{getSelectedPrice()}
                </div>
              </div>
              
              {paymentMethod === 'Paysafecard' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="paysafecardCountry" className="block text-sm mb-1">
                      Your Country *
                    </label>
                    <select
                      id="paysafecardCountry"
                      value={paysafecardCountry}
                      onChange={(e) => setPaysafecardCountry(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-surface-dark border-white/10 focus:border-accent' 
                          : 'bg-white border-gray-300 focus:border-accent'
                      } focus:outline-none focus:ring-1 focus:ring-accent`}
                    >
                      <option value="">Select your country</option>
                      {PAYSAFECARD_COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="paysafecardCode" className="block text-sm mb-1">
                      Paysafecard Code (Optional)
                    </label>
                    <input
                      type="text"
                      id="paysafecardCode"
                      value={paysafecardCode}
                      onChange={(e) => setPaysafecardCode(e.target.value)}
                      placeholder="Enter your Paysafecard code (optional)"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-surface-dark border-white/10 focus:border-accent' 
                          : 'bg-white border-gray-300 focus:border-accent'
                      } focus:outline-none focus:ring-1 focus:ring-accent`}
                    />
                    <p className="mt-1 text-xs opacity-70">
                      You can also upload a screenshot of your Paysafecard receipt later
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Crypto Option (Coming Soon) */}
            <div 
              className={`p-4 rounded-lg border cursor-not-allowed opacity-60 ${
                isDarkMode 
                  ? 'border-white/10' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-300"></div>
                  <span className="ml-3 font-medium">Cryptocurrency</span>
                </div>
                <span className="text-sm">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-white/5 hover:bg-white/10' 
                : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors focus:outline-none`}
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={goToNextStep}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
          >
            Next: Delivery Details
          </button>
        </div>
      </div>
    );
  };
  
  // Render delivery details step
  const renderDeliveryStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">3. Delivery Details</h3>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 focus:border-accent' 
                : 'bg-white border-gray-300 focus:border-accent'
            } focus:outline-none focus:ring-1 focus:ring-accent`}
          />
          <p className="mt-1 text-xs opacity-70">
            We'll send order updates to this email address
          </p>
        </div>
        
        {/* Game Username */}
        <div>
          <label htmlFor="gameUsername" className="block text-sm font-medium mb-1">
            Game Username *
          </label>
          <input
            type="text"
            id="gameUsername"
            value={gameUsername}
            onChange={(e) => setGameUsername(e.target.value)}
            required
            placeholder="Your in-game username"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-surface-dark border-white/10 focus:border-accent' 
                : 'bg-white border-gray-300 focus:border-accent'
            } focus:outline-none focus:ring-1 focus:ring-accent`}
          />
        </div>
        
        {/* Delivery Method */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Delivery Method
          </label>
          
          <div className="space-y-3">
            {/* Direct Delivery */}
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
                <span className="ml-3 font-medium">Direct to Game Account</span>
              </div>
              {deliveryMethod === 'direct' && (
                <p className="mt-2 text-sm opacity-80 pl-8">
                  We'll send {selectedProduct} directly to your game account using your username.
                </p>
              )}
            </div>
            
            {/* Account Delivery */}
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
                <span className="ml-3 font-medium">New Account Delivery</span>
              </div>
              {deliveryMethod === 'account' && (
                <p className="mt-2 text-sm opacity-80 pl-8">
                  We'll provide you with a new account with the purchased items already included.
                </p>
              )}
            </div>
            
            {/* Code Delivery */}
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
              {deliveryMethod === 'code' && (
                <p className="mt-2 text-sm opacity-80 pl-8">
                  We'll provide you with a code that you can redeem in-game or on the platform.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-white/5 hover:bg-white/10' 
                : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors focus:outline-none`}
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={goToNextStep}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
          >
            Next: Review Order
          </button>
        </div>
      </div>
    );
  };
  
  // Render confirmation step
  const renderConfirmationStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">4. Review Your Order</h3>
        
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <h4 className="font-medium mb-4">Order Summary</h4>
          
          <div className="space-y-3 divide-y divide-gray-200 dark:divide-white/10">
            <div className="flex justify-between py-2">
              <span>Product:</span>
              <span className="font-medium">{selectedProduct}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span>Amount:</span>
              <span className="font-medium">{selectedTier}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span>Price:</span>
              <span className="font-medium">{getSelectedCurrency()}{getSelectedPrice()}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span>Payment Method:</span>
              <span className="font-medium">{paymentMethod}</span>
            </div>
            
            {paymentMethod === 'Paysafecard' && paysafecardCountry && (
              <div className="flex justify-between py-2">
                <span>Country:</span>
                <span className="font-medium">{paysafecardCountry}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2">
              <span>Delivery Method:</span>
              <span className="font-medium">
                {deliveryMethod === 'direct' ? 'Direct to Game Account' : 
                 deliveryMethod === 'account' ? 'New Account' : 'Redemption Code'}
              </span>
            </div>
            
            <div className="flex justify-between py-2">
              <span>Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span>Game Username:</span>
              <span className="font-medium">{gameUsername}</span>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-accent/10' : 'bg-accent/5'} border border-accent/20`}>
          <p className="text-sm">
            <strong>Important:</strong> After creating your order, you'll need to upload payment proof. 
            Our team will verify your payment and process your order as soon as possible.
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-white/5 hover:bg-white/10' 
                : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors focus:outline-none`}
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
              isLoading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isLoading ? 'Creating Order...' : 'Create Order'}
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
          <p className="mt-1 text-sm opacity-70">
            Please upload payment proof to proceed with your order.
          </p>
        </div>
        
        <PaymentProofUpload
          orderID={orderID}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        
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
      <div className="flex mb-8">
        {['product', 'payment', 'delivery', 'confirmation'].map((step, index) => (
          <div key={step} className="flex-1 relative">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step
                  ? 'bg-accent text-white'
                  : index < ['product', 'payment', 'delivery', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : isDarkMode
                      ? 'bg-white/10 text-white/60'
                      : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 ${
                  index < ['product', 'payment', 'delivery'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : isDarkMode
                      ? 'bg-white/10'
                      : 'bg-gray-200'
                }`}></div>
              )}
            </div>
            <span className={`absolute text-xs mt-1 left-0 w-full text-center ${
              currentStep === step
                ? isDarkMode ? 'text-white' : 'text-gray-800'
                : isDarkMode ? 'text-white/60' : 'text-gray-500'
            }`}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Error Message */}
      {formError && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {formError}
        </div>
      )}
      
      {/* Current Step Content */}
      {currentStep === 'product' && renderProductStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'delivery' && renderDeliveryStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  );
};

export default OrderForm;