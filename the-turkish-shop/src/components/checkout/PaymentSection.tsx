import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Upload, ExternalLink, Camera, CreditCard } from 'lucide-react';
import { FaPaypal } from 'react-icons/fa';
import { getNextPayPalAccount } from '../../config/siteConfig';
import siteConfig from '../../config/siteConfig';

// Available payment methods
interface PaymentMethod {
  id: string;
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface PaymentSectionProps {
  onPaymentMethodChange: (method: string) => void;
  onPaymentProofChange: (file: File | null) => void;
  onPaymentDataChange: (data: any) => void;
  selectedMethod: string;
  paymentData?: any;
  isExpressDelivery?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  onPaymentMethodChange,
  onPaymentProofChange,
  onPaymentDataChange,
  selectedMethod,
  paymentData = {},
  isExpressDelivery = false
}) => {
  const { isDarkMode } = useTheme();
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentPayPalAccount, setCurrentPayPalAccount] = useState(() => getNextPayPalAccount());

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'paypal',
      name: 'PayPal',
      subtitle: 'Friends & Family Only',
      icon: React.createElement(FaPaypal, { className: "h-5 w-5" }),
      color: 'text-[#00457C]',
      bgColor: isDarkMode ? 'bg-[#00457C]/20' : 'bg-[#00457C]/10'
    },
    {
      id: 'paysafecard',
      name: 'Paysafecard',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: isDarkMode ? 'bg-blue-600/20' : 'bg-blue-50'
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setPaymentProof(file);
      onPaymentProofChange(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setPaymentProof(null);
    setPreviewUrl('');
    onPaymentProofChange(null);
  };

  const handlePaysafecardDataChange = (field: string, value: string) => {
    onPaymentDataChange({
      ...paymentData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* PayPal Payment Instructions */}
      {selectedMethod === 'paypal' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-[#00457C]/10 border-[#00457C]/30 text-blue-300' 
              : 'bg-[#00457C]/5 border-[#00457C]/20 text-[#00457C]'
          }`}
        >
          <h4 className="font-semibold mb-3 flex items-center">
            {React.createElement(FaPaypal, { className: "h-5 w-5 mr-2" })}
            PayPal Payment Instructions
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
            } border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}>
              <p className="font-semibold">⚠️ {siteConfig.paypal.instructions}</p>
            </div>

            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <p className="font-medium mb-2">Current PayPal Account:</p>
              <p className={`${isDarkMode ? 'text-blue-300' : 'text-blue-600'} font-mono`}>
                {currentPayPalAccount.email}
              </p>
              <p className="text-xs mt-1 opacity-75">
                Account: {currentPayPalAccount.name}
              </p>
            </div>

            <ol className="list-decimal list-inside space-y-2">
              <li>Click the button below to open PayPal</li>
              <li>Send the exact amount as <strong>Friends & Family</strong></li>
              <li>Include your Order ID in the payment note</li>
              <li>Take a screenshot of the payment confirmation</li>
              <li>Upload the screenshot below</li>
            </ol>

            <a
              href={currentPayPalAccount.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-[#00457C] hover:bg-[#00457C]/80 text-white' 
                  : 'bg-[#00457C] hover:bg-[#00457C]/90 text-white'
              }`}
            >
              {React.createElement(FaPaypal, { className: "h-5 w-5" })}
              Open PayPal
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      )}

      {/* Paysafecard Payment Instructions */}
      {selectedMethod === 'paysafecard' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-blue-900/10 border-blue-700/30 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <h4 className="font-semibold mb-3">Paysafecard Payment</h4>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Select Your Country *
              </label>
              <select
                value={paymentData.country || ''}
                onChange={(e) => handlePaysafecardDataChange('country', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Choose your country...</option>
                {siteConfig.paysafecard.supportedCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                16-Digit Paysafecard PIN *
              </label>
              <input
                type="text"
                value={paymentData.pin || ''}
                onChange={(e) => {
                  // Only allow numbers and limit to 16 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                  handlePaysafecardDataChange('pin', value);
                }}
                placeholder="Enter your 16-digit PIN"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                maxLength={16}
                required
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {paymentData.pin ? `${paymentData.pin.length}/16 digits` : '0/16 digits'}
              </p>
            </div>

            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
            } text-sm`}>
              <p>⚠️ Make sure your Paysafecard has sufficient balance for the order total.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Screenshot Upload for PayPal */}
      {selectedMethod === 'paypal' && (
        <div className="space-y-4">
          <h4 className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Upload Payment Screenshot *
          </h4>
          
          {!previewUrl ? (
            <label className={`relative block w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDarkMode 
                ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <div className="text-center">
                <Upload className={`mx-auto h-12 w-12 mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Click to upload or drag and drop
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  PNG, JPG up to 5MB
                </p>
              </div>
            </label>
          ) : (
            <div className={`relative rounded-lg overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <img 
                src={previewUrl} 
                alt="Payment proof" 
                className="w-full h-48 object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                ×
              </button>
              <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {paymentProof?.name}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {paymentProof && (paymentProof.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}

          <div className={`flex items-start space-x-2 text-sm ${
            isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
          }`}>
            <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Make sure the screenshot clearly shows the transaction details including amount and recipient.</p>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => {
              onPaymentMethodChange(method.id);
              if (method.id === 'paypal') {
                // Get a new PayPal account for each new order
                setCurrentPayPalAccount(getNextPayPalAccount());
              }
            }}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              selectedMethod === method.id
                ? `${method.bgColor} border-current ${method.color}`
                : isDarkMode
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`h-8 w-8 mx-auto mb-2 ${method.color}`}>
              {method.icon}
            </div>
            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {method.name}
            </h4>
            {method.subtitle && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {method.subtitle}
              </p>
            )}
            {selectedMethod === method.id && (
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${method.color} bg-current`} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentSection; 