import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DollarSign, Euro, PoundSterling } from 'lucide-react';
import { useCurrency, CurrencyCode } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';

interface Currency {
  code: CurrencyCode;
  name: string;
}

const CurrencySelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency } = useCurrency();
  const { isDarkMode } = useTheme();

  // Available currencies
  const currencies: Currency[] = [
    { code: 'GBP', name: 'British Pound' },
    { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  const getCurrencyIcon = (curr: string) => {
    switch (curr) {
      case 'USD':
        return <DollarSign className="h-4 w-4" />;
      case 'EUR':
        return <Euro className="h-4 w-4" />;
      case 'GBP':
        return <PoundSterling className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-lg transition-colors ${
          isDarkMode ? 'text-textLight hover:bg-white/10' : 'text-textDark hover:bg-black/10'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {getCurrencyIcon(selectedCurrency.code)}
        <span className="text-sm font-medium">{selectedCurrency.code}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50 ${
              isDarkMode 
                ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/20' 
                : 'bg-white/80 backdrop-blur-2xl border border-gray-200/50'
            }`}
          >
            <div className="py-1">
              {currencies.map((curr) => (
                <motion.button
                  key={curr.code}
                  onClick={() => handleCurrencyChange(curr.code)}
                  className={`w-full px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                    currency === curr.code
                      ? isDarkMode 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-accent/10 text-accent'
                      : isDarkMode
                        ? 'text-textLight hover:bg-white/10'
                        : 'text-textDark hover:bg-black/5'
                  }`}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {getCurrencyIcon(curr.code)}
                  <span className="flex-1 text-left">{curr.name}</span>
                  {currency === curr.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-accent rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySelector; 