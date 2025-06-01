import React from 'react';
import GamePriceChecker from '../components/GamePriceChecker';
import MotionWrapper from '../components/animations/MotionWrapper';
import { useTheme } from '../contexts/ThemeContext';

const GamePriceCheckerPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="container mx-auto">
        <MotionWrapper variant="bouncyFadeIn" className="mb-10">
          <div className={`bg-glass backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg ${isDarkMode ? 'bg-opacity-20' : ''}`}>
            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Game Price Checker
              </h1>
              <p className={isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}>
                Enter a Steam or PlayStation Store URL to check the discounted Turkish price (60% off the regular price).
              </p>
            </div>
          </div>
        </MotionWrapper>

        <MotionWrapper variant="bouncySlideUp">
          <GamePriceChecker />
        </MotionWrapper>

        <MotionWrapper variant="bouncyFadeIn" className="mt-10">
          <div className={`bg-glass backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg ${isDarkMode ? 'bg-opacity-20' : ''}`}>
            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              <h2 className={`text-2xl font-bold leading-tight ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                How It Works
              </h2>
              <ol className={`list-decimal list-inside space-y-2 ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                <li>Copy the URL of any game from Steam or PlayStation Store</li>
                <li>Paste it into the input field above</li>
                <li>Click "Check Price" to see the discounted Turkish price</li>
                <li>You save approximately 60% compared to regular prices</li>
              </ol>
              
              <div className="mt-4">
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Supported Platforms
                </h3>
                <div className="flex flex-wrap gap-3">
                  <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-[#1b2838] text-white' : 'bg-[#1b2838] text-white'}`}>
                    Steam
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-[#006FCD] text-white' : 'bg-[#006FCD] text-white'}`}>
                    PlayStation Store
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </div>
  );
};

export default GamePriceCheckerPage; 