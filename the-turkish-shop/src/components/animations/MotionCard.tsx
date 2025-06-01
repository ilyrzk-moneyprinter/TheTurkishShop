import { motion } from 'framer-motion';
import React from 'react';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  onClick?: () => void;
}

const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = '',
  delay = 0,
  hoverScale = 1.02,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      whileHover={{
        scale: hoverScale,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      className={`${className} transition-all duration-300`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard; 