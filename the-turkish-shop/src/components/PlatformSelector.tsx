import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface PlatformSelectorProps {
  headerText?: string;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  headerText = 'How to Receive'
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
      <h3 className={`text-md font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {headerText}
      </h3>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <Link
          to="/how-to-receive"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 text-center px-4 py-3 rounded-lg font-medium transition-colors text-sm shadow-md hover:shadow-lg ${
            isDarkMode
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'bg-accent text-white hover:bg-accent/80'
          }`}
        >
          How to Receive Items
        </Link>
        <Link
          to="/how-long-it-takes"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 text-center px-4 py-3 rounded-lg font-medium transition-colors text-sm shadow-md hover:shadow-lg ${
            isDarkMode
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          How Long It Takes
        </Link>
      </div>
    </div>
  );
};

export default PlatformSelector; 