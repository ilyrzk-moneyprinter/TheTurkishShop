import React from 'react';
import { MdPhoneAndroid } from 'react-icons/md';

// Use React.createElement approach instead of direct JSX for icons
interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 24, className = '' }) => {
  const platformLower = platform.toLowerCase();
  
  // Helper function to render icon using createElement
  const renderIcon = (iconType: string, color: string) => {
    // Use a simplified approach that doesn't require external icon libraries
    return (
      <span 
        className={`inline-flex items-center justify-center ${color} ${className}`}
        style={{ width: size, height: size }}
      >
        {iconType}
      </span>
    );
  };
  
  // Platform mapping with simple text-based indicators instead of imported icons
  if (platformLower.includes('steam')) {
    return renderIcon('S', 'text-[#1b2838]');
  }
  
  if (platformLower.includes('playstation') || platformLower.includes('ps') || platformLower === 'psn') {
    return renderIcon('PS', 'text-[#006FCD]');
  }
  
  if (platformLower.includes('xbox')) {
    return renderIcon('X', 'text-[#107C10]');
  }
  
  if (platformLower.includes('epic')) {
    return renderIcon('E', 'text-gray-800');
  }
  
  if (platformLower.includes('riot')) {
    return renderIcon('R', 'text-[#D32936]');
  }
  
  if (platformLower.includes('ubisoft') || platformLower.includes('uplay')) {
    return renderIcon('UB', 'text-[#0070FF]');
  }
  
  if (platformLower.includes('battle') || platformLower.includes('blizzard')) {
    return renderIcon('BN', 'text-[#148EFF]');
  }
  
  if (platformLower.includes('mobile') || platformLower.includes('android') || platformLower.includes('ios')) {
    // For mobile, use a simple text indicator
    return renderIcon('M', 'text-gray-600');
  }
  
  if (platformLower.includes('paypal')) {
    return renderIcon('PP', 'text-[#00457C]');
  }
  
  if (platformLower.includes('discord')) {
    return renderIcon('D', 'text-[#5865F2]');
  }
  
  if (platformLower === 'pc') {
    return renderIcon('PC', 'text-gray-700');
  }
  
  // Default icon
  return renderIcon('G', 'text-gray-500');
};

export default PlatformIcon; 