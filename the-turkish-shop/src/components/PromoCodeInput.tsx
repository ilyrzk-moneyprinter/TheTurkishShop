import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Check, X } from 'lucide-react';
import { validatePromoCode } from '../firebase/promoCodeService';
import { PromoCode } from '../firebase/types';

interface PromoCodeInputProps {
  orderTotal: number;
  onApplyPromo: (promoCode: PromoCode, discount: number) => void;
  onRemovePromo: () => void;
  isDarkMode: boolean;
  appliedPromo?: PromoCode | null;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  orderTotal,
  onApplyPromo,
  onRemovePromo,
  isDarkMode,
  appliedPromo
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await validatePromoCode(code, orderTotal);
      
      if (result.valid && result.promoCode && result.discount) {
        onApplyPromo(result.promoCode, result.discount);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message || 'Invalid promo code');
      }
    } catch (err) {
      setError('Error applying promo code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onRemovePromo();
    setCode('');
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Promo Code
        </h3>
      </div>

      {!appliedPromo ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className={`flex-1 px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApply}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? 'Applying...' : 'Apply'}
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-green-50 border-green-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className={isDarkMode ? 'text-green-400' : 'text-green-700'}>
                {appliedPromo.code} applied
              </span>
            </div>
            <button
              onClick={handleRemove}
              className={`text-sm hover:underline ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Remove
            </button>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {appliedPromo.type === 'percentage' 
              ? `${appliedPromo.value}% discount`
              : `£${appliedPromo.value} off`
            }
          </p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-500 text-sm"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {success && !appliedPromo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-green-500 text-sm"
        >
          <Check className="w-4 h-4" />
          Promo code applied successfully!
        </motion.div>
      )}
    </div>
  );
};

export default PromoCodeInput; 