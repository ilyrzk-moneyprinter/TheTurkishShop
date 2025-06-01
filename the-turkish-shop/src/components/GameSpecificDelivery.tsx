import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Gamepad2, Globe, Gift, User, CreditCard, ShieldCheck } from 'lucide-react';

interface GameSpecificDeliveryProps {
  productName: string;
  email: string;
  setEmail: (email: string) => void;
  gameUsername: string;
  setGameUsername: (username: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (notes: string) => void;
  multipleAccounts: string;
  setMultipleAccounts: (accounts: string) => void;
  isMultipleAccounts: boolean;
  setIsMultipleAccounts: (value: boolean) => void;
  platform?: string;
  setPlatform?: (platform: string) => void;
  deliveryMethod: string;
  setDeliveryMethod: (method: string) => void;
  giftcardCountry?: string;
  setGiftcardCountry?: (country: string) => void;
  accountUsername?: string;
  setAccountUsername?: (username: string) => void;
  accountPassword?: string;
  setAccountPassword?: (password: string) => void;
}

// Country list
const COUNTRIES = [
  'United States', 'United Kingdom', 'Turkey', 'Germany', 'France', 'Spain', 'Italy', 
  'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Poland', 'Canada', 'Australia'
];

const GameSpecificDelivery: React.FC<GameSpecificDeliveryProps> = ({
  productName,
  email,
  setEmail,
  gameUsername,
  setGameUsername,
  additionalNotes,
  setAdditionalNotes,
  multipleAccounts,
  setMultipleAccounts,
  isMultipleAccounts,
  setIsMultipleAccounts,
  platform,
  setPlatform,
  deliveryMethod,
  setDeliveryMethod,
  giftcardCountry,
  setGiftcardCountry,
  accountUsername,
  setAccountUsername,
  accountPassword,
  setAccountPassword,
}) => {
  const { isDarkMode } = useTheme();
  const productLower = productName.toLowerCase();
  
  // Determine game type
  const isValorant = productLower.includes('valorant');
  const isFortnite = productLower.includes('fortnite') || productLower.includes('v-bucks');
  const isCallOfDuty = productLower.includes('call of duty') || productLower.includes('cod');
  const isRainbow6 = productLower.includes('rainbow') || productLower.includes('r6');
  const isRoblox = productLower.includes('roblox') || productLower.includes('robux');
  const isBrawlStars = productLower.includes('brawl');
  
  // Common platforms
  const platforms = ['PC', 'PlayStation', 'Xbox'];
  const mobilePlatforms = ['PC', 'Xbox', 'Mobile', 'PlayStation'];
  
  // Base input styles
  const inputStyles = `w-full px-4 py-2 rounded-lg border ${
    isDarkMode 
      ? 'bg-gray-800 text-white border-gray-700 focus:border-accent' 
      : 'bg-white text-gray-900 border-gray-300 focus:border-accent'
  } focus:outline-none focus:ring-2 focus:ring-accent`;
  
  const labelStyles = `block text-sm font-medium mb-2 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  // Render platform-specific instructions
  const renderPlatformInstructions = () => {
    if (!platform) return null;
    
    const instructions = {
      'PC': {
        icon: <Gamepad2 className="h-5 w-5" />,
        text: isValorant ? 'Redeem through Riot Client' :
              isFortnite ? 'Redeem through Epic Games Launcher' :
              isCallOfDuty ? 'Redeem through Battle.net or Steam' :
              isRainbow6 ? 'Redeem through Ubisoft Connect' :
              isRoblox ? 'Redeem on Roblox website' :
              isBrawlStars ? 'Redeem in Brawl Stars app' :
              'Redeem on your platform'
      },
      'PlayStation': {
        icon: <Gamepad2 className="h-5 w-5" />,
        text: 'Redeem through PlayStation Store'
      },
      'Xbox': {
        icon: <Gamepad2 className="h-5 w-5" />,
        text: 'Redeem through Microsoft Store'
      },
      'Mobile': {
        icon: <Gamepad2 className="h-5 w-5" />,
        text: 'Redeem in mobile app'
      }
    };
    
    const instruction = instructions[platform as keyof typeof instructions];
    if (!instruction) return null;
    
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
      }`}>
        {instruction.icon}
        <span className="text-sm">{instruction.text}</span>
      </div>
    );
  };

  // Render delivery method options
  const renderDeliveryOptions = () => {
    // Roblox specific options
    if (isRoblox) {
      return (
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Delivery Options
          </h3>
          
          {/* Gamepass option */}
          <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
            deliveryMethod === 'gamepass' 
              ? 'border-accent bg-accent/10' 
              : isDarkMode 
                ? 'border-gray-700 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="gamepass"
              checked={deliveryMethod === 'gamepass'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                deliveryMethod === 'gamepass' ? 'border-accent' : 'border-gray-400'
              }`}>
                {deliveryMethod === 'gamepass' && <div className="w-2 h-2 bg-accent rounded-full" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Gamepass Method
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a gamepass and we'll purchase it. Include the gamepass link below.
                </p>
                {deliveryMethod === 'gamepass' && (
                  <input
                    type="text"
                    placeholder="Enter gamepass link"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className={`${inputStyles} mt-3`}
                  />
                )}
              </div>
            </div>
          </label>
          
          {/* Gift card option */}
          <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
            deliveryMethod === 'giftcard' 
              ? 'border-accent bg-accent/10' 
              : isDarkMode 
                ? 'border-gray-700 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="giftcard"
              checked={deliveryMethod === 'giftcard'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                deliveryMethod === 'giftcard' ? 'border-accent' : 'border-gray-400'
              }`}>
                {deliveryMethod === 'giftcard' && <div className="w-2 h-2 bg-accent rounded-full" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Gift Card
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Receive a Roblox gift card code
                </p>
                {deliveryMethod === 'giftcard' && (
                  <select
                    value={giftcardCountry || 'United States'}
                    onChange={(e) => setGiftcardCountry?.(e.target.value)}
                    className={`${inputStyles} mt-3`}
                  >
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </label>
          
          {/* Account delivery option */}
          <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
            deliveryMethod === 'account' 
              ? 'border-accent bg-accent/10' 
              : isDarkMode 
                ? 'border-gray-700 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="account"
              checked={deliveryMethod === 'account'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                deliveryMethod === 'account' ? 'border-accent' : 'border-gray-400'
              }`}>
                {deliveryMethod === 'account' && <div className="w-2 h-2 bg-accent rounded-full" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Account Delivery (Fastest)
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  We'll log in and add Robux directly
                </p>
                {deliveryMethod === 'account' && (
                  <div className="space-y-3 mt-3">
                    <input
                      type="text"
                      placeholder="Roblox username"
                      value={accountUsername || ''}
                      onChange={(e) => setAccountUsername?.(e.target.value)}
                      className={inputStyles}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={accountPassword || ''}
                      onChange={(e) => setAccountPassword?.(e.target.value)}
                      className={inputStyles}
                    />
                  </div>
                )}
              </div>
            </div>
          </label>
        </div>
      );
    }
    
    // Other games (Valorant, Fortnite, CoD, R6)
    return (
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Delivery Method
        </h3>
        
        {/* Gift card option */}
        <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
          deliveryMethod === 'giftcard' 
            ? 'border-accent bg-accent/10' 
            : isDarkMode 
              ? 'border-gray-700 hover:bg-gray-800' 
              : 'border-gray-300 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="deliveryMethod"
            value="giftcard"
            checked={deliveryMethod === 'giftcard'}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="sr-only"
          />
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              deliveryMethod === 'giftcard' ? 'border-accent' : 'border-gray-400'
            }`}>
              {deliveryMethod === 'giftcard' && <div className="w-2 h-2 bg-accent rounded-full" />}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <Gift className="inline h-4 w-4 mr-1" />
                Gift Card / Code
              </h4>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Receive a redeemable code for your platform
              </p>
              {deliveryMethod === 'giftcard' && (
                <select
                  value={giftcardCountry || 'Turkey'}
                  onChange={(e) => setGiftcardCountry?.(e.target.value)}
                  className={`${inputStyles} mt-3`}
                >
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </label>
        
        {/* Direct top-up option */}
        <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
          deliveryMethod === 'direct' 
            ? 'border-accent bg-accent/10' 
            : isDarkMode 
              ? 'border-gray-700 hover:bg-gray-800' 
              : 'border-gray-300 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="deliveryMethod"
            value="direct"
            checked={deliveryMethod === 'direct'}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="sr-only"
          />
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              deliveryMethod === 'direct' ? 'border-accent' : 'border-gray-400'
            }`}>
              {deliveryMethod === 'direct' && <div className="w-2 h-2 bg-accent rounded-full" />}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <CreditCard className="inline h-4 w-4 mr-1" />
                Direct Top-Up
              </h4>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We add currency directly to your account using your ID
              </p>
              {deliveryMethod === 'direct' && (
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    placeholder={isValorant ? "Riot ID (username#tag)" : "Player ID"}
                    value={gameUsername}
                    onChange={(e) => setGameUsername(e.target.value)}
                    className={inputStyles}
                  />
                  <select
                    value={giftcardCountry || 'Turkey'}
                    onChange={(e) => setGiftcardCountry?.(e.target.value)}
                    className={inputStyles}
                  >
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </label>
        
        {/* Account delivery option */}
        <label className={`block p-4 rounded-lg border cursor-pointer transition-all ${
          deliveryMethod === 'account' 
            ? 'border-accent bg-accent/10' 
            : isDarkMode 
              ? 'border-gray-700 hover:bg-gray-800' 
              : 'border-gray-300 hover:bg-gray-50'
        }`}>
          <input
            type="radio"
            name="deliveryMethod"
            value="account"
            checked={deliveryMethod === 'account'}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="sr-only"
          />
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              deliveryMethod === 'account' ? 'border-accent' : 'border-gray-400'
            }`}>
              {deliveryMethod === 'account' && <div className="w-2 h-2 bg-accent rounded-full" />}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <User className="inline h-4 w-4 mr-1" />
                Account Delivery (Fastest)
              </h4>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We'll log in and add currency directly to your account
              </p>
              {deliveryMethod === 'account' && (
                <div className="space-y-3 mt-3">
                  <input
                    type="text"
                    placeholder="Account username/email"
                    value={accountUsername || ''}
                    onChange={(e) => setAccountUsername?.(e.target.value)}
                    className={inputStyles}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={accountPassword || ''}
                    onChange={(e) => setAccountPassword?.(e.target.value)}
                    className={inputStyles}
                  />
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    <ShieldCheck className="inline h-4 w-4 mr-1" />
                    <span className="text-sm">Your login details are encrypted and never stored</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </label>
      </div>
    );
  };

  // Brawl Stars specific
  if (isBrawlStars) {
    return (
      <div className="space-y-6">
        <div>
          <label className={labelStyles}>
            Supercell ID Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Supercell ID email"
            className={inputStyles}
          />
        </div>
        
        <div>
          <label className={labelStyles}>
            Player Tag <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={gameUsername}
            onChange={(e) => setGameUsername(e.target.value)}
            placeholder="#XXXXXXXXX"
            className={inputStyles}
          />
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Find it in Settings → Advanced → Player Tag
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <h4 className="font-medium mb-2">How to Redeem Brawl Stars Gems:</h4>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Open Brawl Stars and tap your player icon (top-left)</li>
            <li>Copy your Player Tag</li>
            <li>We'll add gems directly to your account</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <label className={labelStyles}>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email for delivery confirmation"
          className={inputStyles}
        />
      </div>
      
      {/* Game Username - only show if not using account delivery */}
      {deliveryMethod !== 'account' && (
        <div>
          <label className={labelStyles}>
            {isValorant ? 'Riot ID' : isFortnite ? 'Epic Username' : 'Game Username'} 
            {deliveryMethod === 'direct' && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={gameUsername}
            onChange={(e) => setGameUsername(e.target.value)}
            placeholder={
              isValorant ? "username#tag" : 
              isFortnite ? "Your Epic Games username" :
              "Your in-game username"
            }
            className={inputStyles}
          />
        </div>
      )}
      
      {/* Platform selection for non-Roblox games */}
      {!isRoblox && setPlatform && (
        <div>
          <label className={labelStyles}>
            Platform <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(isRoblox ? mobilePlatforms : platforms).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`p-3 rounded-lg border transition-all ${
                  platform === p 
                    ? 'border-accent bg-accent/10 text-accent' 
                    : isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-800 text-gray-300' 
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {platform && renderPlatformInstructions()}
        </div>
      )}
      
      {/* Delivery options */}
      {renderDeliveryOptions()}
      
      {/* Multiple accounts */}
      <div>
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isMultipleAccounts}
            onChange={(e) => setIsMultipleAccounts(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
          />
          <span className={labelStyles.replace('block', 'inline')}>
            Multiple accounts
          </span>
        </label>
        
        {isMultipleAccounts && (
          <textarea
            value={multipleAccounts}
            onChange={(e) => setMultipleAccounts(e.target.value)}
            placeholder="Account1 - Amount&#10;Account2 - Amount"
            rows={3}
            className={`${inputStyles} mt-2`}
          />
        )}
      </div>
      
      {/* Additional notes */}
      <div>
        <label className={labelStyles}>
          Additional Notes (Optional)
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Any special instructions"
          rows={3}
          className={inputStyles}
        />
      </div>
    </div>
  );
};

export default GameSpecificDelivery; 