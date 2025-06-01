import React from 'react';
import { IconType } from 'react-icons';
import { FaPaypal, FaSteam, FaPlaystation, FaXbox, FaDiscord, FaGamepad } from 'react-icons/fa';
import { 
  SiEpicgames,
  SiNintendo,
  SiRoblox
} from 'react-icons/si';
import { Gamepad2, ShoppingBag, CreditCard } from 'lucide-react';
import { MdPhoneAndroid } from 'react-icons/md';

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 24, className = '' }) => {
  const platformLower = platform.toLowerCase();
  
  // Helper function to render icon using createElement for React 19 compatibility
  const renderIcon = (Icon: IconType | React.FC<any>, color: string) => {
    return React.createElement(Icon, {
      size: size,
      className: `${color} ${className}`
    });
  };
  
  // Platform mapping
  if (platformLower.includes('steam')) {
    return renderIcon(FaSteam, 'text-[#1b2838]');
  }
  
  if (platformLower.includes('playstation') || platformLower.includes('ps') || platformLower === 'psn') {
    return renderIcon(FaPlaystation, 'text-[#006FCD]');
  }
  
  if (platformLower.includes('xbox')) {
    return renderIcon(FaXbox, 'text-[#107C10]');
  }
  
  if (platformLower.includes('epic')) {
    return renderIcon(SiEpicgames, 'text-gray-800');
  }
  
  if (platformLower.includes('riot')) {
    // Use generic game icon for Riot
    return renderIcon(FaGamepad, 'text-[#D32936]');
  }
  
  if (platformLower.includes('ubisoft') || platformLower.includes('uplay')) {
    // Use generic game icon for Ubisoft
    return renderIcon(FaGamepad, 'text-[#0070FF]');
  }
  
  if (platformLower.includes('battle') || platformLower.includes('blizzard')) {
    // Use generic game icon for Battle.net
    return renderIcon(FaGamepad, 'text-[#148EFF]');
  }
  
  if (platformLower.includes('mobile') || platformLower.includes('android') || platformLower.includes('ios')) {
    return renderIcon(MdPhoneAndroid, 'text-gray-600');
  }
  
  if (platformLower.includes('paypal')) {
    return renderIcon(FaPaypal, 'text-[#00457C]');
  }
  
  if (platformLower.includes('discord')) {
    return renderIcon(FaDiscord, 'text-[#5865F2]');
  }
  
  if (platformLower === 'pc') {
    return renderIcon(FaGamepad, 'text-gray-700');
  }
  
  // Default icon
  return renderIcon(FaGamepad, 'text-gray-500');
};

export default PlatformIcon; 