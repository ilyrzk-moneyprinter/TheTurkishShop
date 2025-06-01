import React from 'react';
import { useCurrency, CurrencyCode } from '../contexts/CurrencyContext';

const CurrencyDebug: React.FC = () => {
  const { currency, userCountry, isLoading, setCurrency } = useCurrency();
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as CurrencyCode);
  };
  
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }
  
  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-2 text-xs z-50 rounded-tl-lg">
      <div>
        <strong>Country:</strong> {isLoading ? 'Loading...' : userCountry || 'Unknown'}
      </div>
      <div>
        <strong>Currency:</strong> {currency}
      </div>
      <div className="mt-1">
        <select 
          value={currency} 
          onChange={handleCurrencyChange}
          className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs"
        >
          <option value="GBP">GBP (£)</option>
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="CAD">CAD (C$)</option>
          <option value="AUD">AUD (A$)</option>
        </select>
      </div>
    </div>
  );
};

export default CurrencyDebug; 