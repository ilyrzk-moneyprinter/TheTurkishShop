import { motion } from 'framer-motion';
import React from 'react';

interface MotionButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
}) => {
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-accent text-textLight hover:bg-accent/90';
      case 'secondary':
        return 'bg-white/5 text-textDark hover:bg-white/10 border border-white/10';
      case 'ghost':
        return 'bg-transparent text-textDark hover:bg-white/5';
      case 'outline':
        return 'bg-transparent border border-white/10 text-textDark hover:bg-white/5';
      default:
        return 'bg-accent text-textLight hover:bg-accent/90';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${getVariantStyles()} px-4 py-2 rounded-lg font-medium transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default MotionButton; 