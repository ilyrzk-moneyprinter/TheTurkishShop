import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { submitReceiptForm } from '../firebase/orderService';
import { OrderReceiptForm as ReceiptFormType } from '../firebase/types';

interface OrderReceiptFormProps {
  orderID: string;
  onSubmitSuccess?: () => void;
}

const OrderReceiptForm: React.FC<OrderReceiptFormProps> = ({ orderID, onSubmitSuccess }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Omit<ReceiptFormType, 'orderID'>>({
    gameAccount: '',
    gamePassword: '',
    platform: '',
    additionalInfo: '',
    contactMethod: 'discord',
    contactDetails: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    
    try {
      const success = await submitReceiptForm({
        orderID,
        ...formData
      });
      
      if (success) {
        setFormSuccess(true);
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        setFormError('Failed to submit form. Please try again.');
      }
    } catch (error: any) {
      setFormError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (formSuccess) {
    return (
      <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark text-textLight' : 'bg-surface text-textDark'}`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="mt-2 text-xl font-medium">Delivery Information Submitted!</h3>
          <p className="mt-1 text-sm opacity-70">
            We've received your information and will deliver your order as soon as possible.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark text-textLight' : 'bg-surface text-textDark'}`}>
      <h2 className="text-xl font-bold mb-4">Order Delivery Information</h2>
      
      {formError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Game Account */}
          <div>
            <label htmlFor="gameAccount" className="block text-sm font-medium mb-1">
              Game Account Username
            </label>
            <input
              type="text"
              id="gameAccount"
              name="gameAccount"
              value={formData.gameAccount}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-surface-dark border-white/10 focus:border-accent' 
                  : 'bg-white border-gray-300 focus:border-accent'
              } focus:outline-none focus:ring-1 focus:ring-accent`}
            />
          </div>
          
          {/* Game Password (Optional) */}
          <div>
            <label htmlFor="gamePassword" className="block text-sm font-medium mb-1">
              Game Account Password (Optional)
            </label>
            <input
              type="password"
              id="gamePassword"
              name="gamePassword"
              value={formData.gamePassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-surface-dark border-white/10 focus:border-accent' 
                  : 'bg-white border-gray-300 focus:border-accent'
              } focus:outline-none focus:ring-1 focus:ring-accent`}
            />
            <p className="mt-1 text-xs opacity-70">
              Only required for certain products. Your password is securely encrypted.
            </p>
          </div>
          
          {/* Platform */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium mb-1">
              Platform
            </label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-surface-dark border-white/10 focus:border-accent' 
                  : 'bg-white border-gray-300 focus:border-accent'
              } focus:outline-none focus:ring-1 focus:ring-accent`}
            >
              <option value="">Select Platform</option>
              <option value="PC">PC</option>
              <option value="PlayStation">PlayStation</option>
              <option value="Xbox">Xbox</option>
              <option value="Mobile">Mobile</option>
              <option value="Switch">Nintendo Switch</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Additional Info */}
          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">
              Additional Information (Optional)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-surface-dark border-white/10 focus:border-accent' 
                  : 'bg-white border-gray-300 focus:border-accent'
              } focus:outline-none focus:ring-1 focus:ring-accent`}
            />
          </div>
          
          {/* Contact Method */}
          <div>
            <label htmlFor="contactMethod" className="block text-sm font-medium mb-1">
              Preferred Contact Method
            </label>
            <select
              id="contactMethod"
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-surface-dark border-white/10 focus:border-accent' 
                  : 'bg-white border-gray-300 focus:border-accent'
              } focus:outline-none focus:ring-1 focus:ring-accent`}
            >
              <option value="discord">Discord</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          
          {/* Contact Details */}
          <div>
            <label htmlFor="contactDetails" className="block text-sm font-medium mb-1">
              Contact Details
            </label>
            <input
              type="text"
              id="contactDetails"
              name="contactDetails"
              value={formData.contactDetails}
              onChange={handleInputChange}
              required
              placeholder={
                formData.contactMethod === 'discord' ? 'Discord username (e.g. username#1234)' :
                formData.contactMethod === 'email' ? 'Email address' :
                formData.contactMethod === 'whatsapp' ? 'WhatsApp number' :
                'Telegram username'
              }
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-surface-dark border-white/10 focus:border-accent' 
                  : 'bg-white border-gray-300 focus:border-accent'
              } focus:outline-none focus:ring-1 focus:ring-accent`}
            />
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-accent text-white hover:bg-accent/90' 
                : 'bg-accent text-white hover:bg-accent/90'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
          >
            {isLoading ? 'Submitting...' : 'Submit Information'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderReceiptForm; 