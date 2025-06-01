import React from 'react';
import { motion } from 'framer-motion';

type AnimationVariant = 
  | 'fadeIn' 
  | 'slideInLeft' 
  | 'slideInRight' 
  | 'slideInUp' 
  | 'slideInDown'
  | 'scaleIn'
  | 'rotateIn'
  | 'bounceIn'
  | 'bouncySlideUp'
  | 'bouncyFadeIn'
  | 'elasticScale'
  | 'smoothFloat'
  | 'pulseScale'
  | 'slideAndBounce'
  | 'fadeAndScale';

interface MotionWrapperProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  className?: string;
  delay?: number;
  duration?: number;
}

const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  slideInUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  slideInDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -90 },
    animate: { opacity: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 260, damping: 12 }
  },
  bouncySlideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 120, damping: 14, bounce: 0.4 }
  },
  bouncyFadeIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 300, damping: 20, bounce: 0.5 }
  },
  elasticScale: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: "spring", stiffness: 400, damping: 10, bounce: 0.8 }
  },
  smoothFloat: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: [0, -10, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  pulseScale: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  slideAndBounce: {
    initial: { opacity: 0, x: -100, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  fadeAndScale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { opacity: { duration: 0.3 }, scale: { type: "spring", stiffness: 200, damping: 15, delay: 0.1 } }
  }
};

const MotionWrapper: React.FC<MotionWrapperProps> = ({ 
  children, 
  variant = 'fadeIn', 
  className = '',
  delay = 0,
  duration
}) => {
  const selectedAnimation = animationVariants[variant];
  
  // Apply custom delay and duration if provided
  const customTransition = {
    ...selectedAnimation.transition,
    delay: delay > 0 ? delay : (selectedAnimation.transition as any).delay,
    duration: duration || (selectedAnimation.transition as any).duration
  };

  return (
    <motion.div
      initial={selectedAnimation.initial}
      animate={selectedAnimation.animate}
      transition={customTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MotionWrapper; 