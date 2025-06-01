import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { CurrencyCode } from '../../contexts/CurrencyContext';

interface OrderDeliveryOptionsProps {
  selectedOption: 'Standard' | 'Express';
  onChange: (option: 'Standard' | 'Express') => void;
  currency: string;
}

const OrderDeliveryOptions: React.FC<OrderDeliveryOptionsProps> = ({ 
  selectedOption, 
  onChange,
  currency
}) => {
  const { isDarkMode } = useTheme();
  
  // Get correct express price based on currency symbol
  const getExpressPrice = () => {
    switch(currency) {
      case '£': return '£9.00';
      case '$': return '$12.15';
      case '€': return '€10.62';
      case 'C$': return 'C$16.65';
      case 'A$': return 'A$13.95';
      default: return '£9.00';
    }
  };
  
  const expressPrice = getExpressPrice();
  
  return (
    <div className="mb-6">
      <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
        Delivery Options
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Delivery Option */}
        <motion.div
          className={`p-4 rounded-lg border cursor-pointer ${
            selectedOption === 'Standard'
              ? isDarkMode 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-blue-500 bg-blue-50'
              : isDarkMode
                ? 'border-white/10 bg-white/5 hover:bg-white/10'
                : 'border-gray-200 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange('Standard')}
        >
          <div className="flex items-start">
            <div className="mr-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedOption === 'Standard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}>
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h4 className={`text-base font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Standard Delivery
              </h4>
              <p className="text-sm opacity-70 mt-1">
                Delivered within 1-3 days
              </p>
              <div className="mt-2 font-medium text-green-600">
                Free
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Express Delivery Option */}
        <motion.div
          className={`p-4 rounded-lg border cursor-pointer ${
            selectedOption === 'Express'
              ? isDarkMode 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-purple-500 bg-purple-50'
              : isDarkMode
                ? 'border-white/10 bg-white/5 hover:bg-white/10'
                : 'border-gray-200 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange('Express')}
        >
          <div className="flex items-start">
            <div className="mr-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedOption === 'Express'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100'
              }`}>
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h4 className={`text-base font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Express Delivery
              </h4>
              <p className="text-sm opacity-70 mt-1">
                Priority queue - delivered within 5-60 mins
              </p>
              <div className="mt-2 font-medium text-purple-600">
                +{expressPrice}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <p className="mt-3 text-xs opacity-70">
        Express orders are processed immediately and get priority in our delivery queue.
      </p>
    </div>
  );
};

export default OrderDeliveryOptions; 