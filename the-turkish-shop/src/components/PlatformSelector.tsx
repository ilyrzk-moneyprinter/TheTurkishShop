import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { GamePlatform } from '../firebase/types';

interface PlatformSelectorProps {
  selectedPlatform: GamePlatform | undefined;
  onChange: (platform: GamePlatform) => void;
  product: string;
  headerText?: string;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  selectedPlatform, 
  onChange,
  product,
  headerText = 'Select Platform'
}) => {
  const { isDarkMode } = useTheme();
  const isApexCoins = product.includes('Apex Coin');
  const isFIFAPoints = product.includes('FIFA') || product.includes('FC Point');
  const isValorant = product.includes('Valorant Point');
  const isDiscordNitro = product.includes('Discord Nitro') || product.includes('Nitro');
  const isSpotifyPremium = product.includes('Spotify') || product.includes('Premium');
  
  // Platform icons
  const platformIcons = {
    PC: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    Xbox: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1.95 20.08C7.238 19.758 3.05 16.758 3.05 12c0-1.058.237-2.062.65-2.965.43.933 1.393 2.013 2.467 3.135 1.738 1.982 3.835 3.893 3.882 3.893.05 0 .05-.048.05-.048-.572-1.202-1.15-2.455-1.682-3.704-.88-2.26-1.915-4.495-2.98-6.708 1.442-.908 3.139-1.415 4.955-1.415 1.2 0 2.334.238 3.375.645-2.235 2.32-4.233 4.83-6.087 7.415-1.238 1.743-2.42 3.535-3.514 5.374-.62.142-.143.288-.166.335 1.614 1.196 3.608 1.905 5.77 1.905.073 0 .144-.005.215-.007-.053-.143-.102-.286-.154-.428-.954-2.584-1.84-5.21-2.702-7.835-.05-.146-.05-.146-.098-.195 3.274 1.93 6.513 3.93 9.702 6.02-1.448 1.658-3.532 2.786-5.873 3.1.048-.097.097-.195.143-.292.954-2.015 1.958-4.025 2.962-6.04.24-.482.48-.96.718-1.442.1-.145.2-.29.344-.434 1.39 2.602 2.207 5.444 2.421 8.42-1.446 1.658-3.53 2.784-5.873 3.096 1.97-1.198 3.82-2.5 5.676-3.895l-.05-.05c-1.642-.95-3.283-1.853-4.974-2.757-1.25-.655-2.567-1.35-3.876-1.956z" />
      </svg>
    ),
    PlayStation: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.957 12.344c-.472.557-1.134.84-1.932.992l-7.638 2.684V14.4l5.52-1.957c.567-.205.653-.447.186-.557-.465-.112-1.35 0-1.92.205l-3.787 1.344V12.18l.222-.074c.123-.05.247-.073.385-.094 1.188-.23 2.69-.28 3.91.065 1.486.409 1.65 1.011 1.054 1.266M2.363 15.48c-1.249.418-1.47 1.285-.556 1.838.815.5 2.198.892 3.575.892.726 0 1.424-.093 2.073-.279l.01-2.088v-5.714l.001-.048c.005-.676.055-.67.143-.561.214.267.392.86.392 1.534v4.788l.018-.004c.973-.277 1.657-.932 1.657-2.08V8.966c0-1.072-.868-1.664-2.07-1.831-1.146-.162-2.661-.032-3.855.416-2.081.783-2.307 1.551-2.307 3.339v2.328c.033 1.103.051 2.173 1.919 2.261M24 17.654a3.521 3.521 0 0 1-1.694 3.025c-1.139.675-2.522.9-3.961.9-1.12 0-2.274-.115-3.289-.47-1.358-.477-2.035-1.196-2.035-2.173v-1.086l.024-.004 4.932-1.751v1.996c0 .334.196.557.532.612.475.075 1.006.086 1.456.003.45-.082.533-.306.533-.612v-1.842l1.9-.678c.83-.295 1.43-.76 1.592-1.446.04-.17.01-2.436.01-2.436V7.96c0-1.143-.881-1.949-2.516-1.78-2.219.23-2.317 1.786-2.317 2.229v5.21l-4.99 1.766.023-.004-.024.004-3.246 1.154V3.462c1.268-.664 2.878-1.11 4.56-1.39 1.575-.262 3.076-.26 4.305-.047 3.87.669 4.205 2.293 4.205 4.975v10.654z" />
      </svg>
    ),
    Mobile: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    'Nintendo Switch': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.615 4.928h.66V19.07h-.66V4.928zm-1.112 0h.142V19.07h-.142V4.928zm-6.213 3.96H8V19.07h-.71V8.888zm7.807-3.96h.328V19.07h-.328V4.928zm-6.57 3.96h.52V19.07h-.52V8.888zm-1.245 0h.094V19.07h-.094V8.888zm8.917-3.96h.142V19.07h-.142V4.928zm1.03 0h.66V19.07h-.66V4.928zm2.7 0h.661V19.07h-.66V4.928zm-1.12 0h.142V19.07h-.141V4.928zm-12.03 3.96h.236V19.07h-.236V8.888zM8.528 1.028l-7.502.006A1.024 1.024 0 000 2.058v19.886a1.024 1.024 0 001.024 1.022h7.504a1.024 1.024 0 001.024-1.022V2.058A1.024 1.024 0 008.528 1.028zm-4.5 17.573a2.232 2.232 0 112.232-2.232 2.232 2.232 0 01-2.232 2.232zm20.951-17.57h-7.513a1.024 1.024 0 00-1.024 1.022v19.886a1.024 1.024 0 001.024 1.022h7.513a1.024 1.024 0 001.021-1.022V2.053a1.024 1.024 0 00-1.021-1.022zm-3.755 4.212a2.76 2.76 0 11-2.76 2.757 2.76 2.76 0 012.76-2.76v.003z" />
      </svg>
    )
  };
  
  // Get game-specific redemption instructions
  const getGameRedemptionInstructions = (platform: GamePlatform) => {
    if (isApexCoins) {
      // Apex Coins redemption instructions by platform
      switch (platform) {
        case 'PC':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">💻 PC (EA App or Origin):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the EA App or Origin Client and log in</li>
                <li>Click your profile icon → "Redeem Code"</li>
                <li>Enter your EA Gift Card code and click Next</li>
                <li>Your balance will be added — go to the in-game store (Apex) to buy Coins</li>
              </ul>
            </div>
          );
        case 'Xbox':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">🎮 Xbox:</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Go to Microsoft Store → scroll down to Redeem</li>
                <li>Enter the 25-character gift card code from your EA card</li>
                <li>Open Apex Legends, go to the in-game store, and buy the pack using your new balance</li>
              </ul>
            </div>
          );
        case 'PlayStation':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">🎮 PlayStation:</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the PlayStation Store → scroll to Redeem Codes</li>
                <li>Enter your EA Gift Card code and press Redeem</li>
                <li>Launch Apex, and use your wallet balance to purchase Coins</li>
              </ul>
            </div>
          );
        case 'Nintendo Switch':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">🎮 Nintendo Switch:</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the Nintendo eShop</li>
                <li>Select your account icon in the top-right corner</li>
                <li>Scroll down and select "Redeem Code"</li>
                <li>Enter your EA Gift Card code and redeem</li>
                <li>Launch Apex Legends and purchase Coins with your balance</li>
              </ul>
            </div>
          );
        default:
          return null;
      }
    } else if (isFIFAPoints) {
      // FIFA Points redemption instructions by platform - Updated
      switch (platform) {
        case 'PC':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">💻 PC (EA App or Origin):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the EA App or Origin Client and log in</li>
                <li>Click your profile icon → "Redeem Code"</li>
                <li>Enter your EA Gift Card code and click Next</li>
                <li>Your balance will be added — go to the in-game store (FIFA) to buy Points</li>
              </ul>
            </div>
          );
        case 'Xbox':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">🎮 Xbox:</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Go to Microsoft Store → scroll down to Redeem</li>
                <li>Enter the 25-character gift card code from your EA card</li>
                <li>Open FIFA, go to the in-game store, and buy the pack using your new balance</li>
              </ul>
            </div>
          );
        case 'PlayStation':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">🎮 PlayStation:</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the PlayStation Store → scroll to Redeem Codes</li>
                <li>Enter your EA Gift Card code and press Redeem</li>
                <li>Launch FIFA, and use your wallet balance to purchase FIFA Points</li>
              </ul>
            </div>
          );
        default:
          return null;
      }
    } else if (isValorant) {
      // Valorant Points redemption instructions by platform
      switch (platform) {
        case 'PC':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">💻 PC (Riot Client):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open Valorant and log in</li>
                <li>Go to Store → Purchase VP → Select Prepaid Cards & Codes</li>
                <li>Enter your gift card code and click Submit to redeem</li>
              </ul>
            </div>
          );
        case 'Xbox':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">🎮 Xbox (for Riot-connected content):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Go to Microsoft Store → scroll to Redeem or open Settings &gt; Account &gt; Redeem Code</li>
                <li>Enter the 25-character Riot/Xbox gift card code</li>
                <li>Content will be added to your linked Riot/Xbox account</li>
              </ul>
            </div>
          );
        case 'PlayStation':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">🎮 PlayStation (for Wild Rift or Valorant Console Beta when supported):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the PlayStation Store</li>
                <li>Scroll down and select Redeem Codes</li>
                <li>Enter the code printed on your Riot gift card and press Redeem</li>
              </ul>
            </div>
          );
        default:
          return null;
      }
    } else if (isDiscordNitro) {
      // Discord Nitro redemption instructions by platform - Updated
      switch (platform) {
        case 'PC':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">💻 PC (Windows/Mac):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the email and click the Nitro gift link (e.g. https://discord.gift/abc123...).</li>
                <li>It will open in your browser — click "Accept Gift".</li>
                <li>Log in to your Discord account and Nitro will be applied instantly.</li>
              </ul>
            </div>
          );
        case 'Mobile':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">📱 Phone (iOS/Android):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the email and tap the Nitro gift link.</li>
                <li>It will open in your browser or redirect to the Discord app.</li>
                <li>Tap "Accept Gift", log in if needed, and Nitro will be activated.</li>
              </ul>
            </div>
          );
        default:
          return null;
      }
    } else if (isSpotifyPremium) {
      // Spotify Premium redemption instructions by platform - Updated
      switch (platform) {
        case 'PC':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">💻 PC (Windows/Mac):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the email and choose your option:</li>
                <li className="ml-4"><span className="text-green-500">✅</span> <strong>Fresh Account:</strong> You'll receive a brand new Spotify account with Premium already activated — just log in and start using it.</li>
                <li className="ml-4"><span className="text-blue-500">🔄</span> <strong>Your Own Account:</strong> If you provided your email and password, we will apply Premium directly to your existing account.</li>
                <li>No codes needed — just log in and enjoy Premium.</li>
              </ul>
            </div>
          );
        case 'Mobile':
          return (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">📱 Phone (iOS/Android):</p>
              <ul className="text-xs text-blue-600 list-disc pl-4">
                <li>Open the email and pick your option:</li>
                <li className="ml-4"><span className="text-green-500">✅</span> <strong>Fresh Account:</strong> Download the Spotify app, log in with the credentials sent to your email, and enjoy Premium.</li>
                <li className="ml-4"><span className="text-blue-500">🔄</span> <strong>Your Own Account:</strong> If you gave us your login, open your Spotify app — Premium will be active once we've applied it.</li>
                <li>No code or VPN needed — everything is handled for you.</li>
              </ul>
            </div>
          );
        default:
          return null;
      }
    }
    return null;
  };
  
  // Platform-specific instructions and tutorials
  const platformInstructions = {
    PC: (
      <div className="mt-2 text-sm">
        <p className="mb-2"><strong>Requirements:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Windows PC or laptop</li>
          <li>Stable internet connection</li>
          <li>Game launcher installed (if applicable)</li>
        </ul>
        <p className="mt-2 mb-1"><strong>Instructions:</strong></p>
        <p>We'll provide you with login details or a code to redeem directly on your PC.</p>
        {selectedPlatform === 'PC' && getGameRedemptionInstructions('PC')}
      </div>
    ),
    Xbox: (
      <div className="mt-2 text-sm">
        <p className="mb-2"><strong>Requirements:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Xbox console (Xbox One, Series X|S)</li>
          <li>Xbox account with online access</li>
          <li>Stable internet connection</li>
        </ul>
        <p className="mt-2 mb-1"><strong>Instructions:</strong></p>
        <p>You'll receive a code to redeem in the Microsoft Store or directly on your Xbox.</p>
        {selectedPlatform === 'Xbox' && getGameRedemptionInstructions('Xbox')}
      </div>
    ),
    PlayStation: (
      <div className="mt-2 text-sm">
        <p className="mb-2"><strong>Requirements:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>PlayStation console (PS4 or PS5)</li>
          <li>PSN account</li>
          <li>Stable internet connection</li>
        </ul>
        <p className="mt-2 mb-1"><strong>Instructions:</strong></p>
        <p>You'll receive a code to redeem in the PlayStation Store.</p>
        {selectedPlatform === 'PlayStation' && getGameRedemptionInstructions('PlayStation')}
      </div>
    ),
    Mobile: (
      <div className="mt-2 text-sm">
        <p className="mb-2"><strong>Requirements:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>iOS or Android device</li>
          <li>Game account (if applicable)</li>
          <li>Stable internet connection</li>
        </ul>
        <p className="mt-2 mb-1"><strong>Instructions:</strong></p>
        <p>You'll receive login details or a code to redeem through the app store or in-game.</p>
        {selectedPlatform === 'Mobile' && getGameRedemptionInstructions('Mobile')}
      </div>
    ),
    'Nintendo Switch': (
      <div className="mt-2 text-sm">
        <p className="mb-2"><strong>Requirements:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Nintendo Switch console</li>
          <li>Nintendo account</li>
          <li>Stable internet connection</li>
        </ul>
        <p className="mt-2 mb-1"><strong>Instructions:</strong></p>
        <p>You'll receive a code to redeem in the Nintendo eShop.</p>
        {selectedPlatform === 'Nintendo Switch' && getGameRedemptionInstructions('Nintendo Switch')}
      </div>
    )
  };
  
  // Product-specific platform compatibility
  const getCompatiblePlatforms = (): GamePlatform[] => {
    switch (product) {
      case 'Fortnite V-Bucks':
        return ['PC', 'Xbox', 'PlayStation', 'Mobile', 'Nintendo Switch'];
      case 'FIFA FC Points':
        return ['PC', 'Xbox', 'PlayStation'];
      case 'Rainbow Six Siege Credits':
        return ['PC', 'Xbox', 'PlayStation'];
      case 'Roblox Robux':
        return ['PC', 'Xbox', 'Mobile'];
      case 'Apex Coins':
        return ['PC', 'Xbox', 'PlayStation', 'Nintendo Switch'];
      case 'Brawl Stars Gems':
        return ['Mobile'];
      case 'Valorant Points':
        return ['PC'];
      case 'Call of Duty Points':
        return ['PC', 'Xbox', 'PlayStation', 'Mobile'];
      case 'Discord Nitro':
        return ['PC', 'Mobile'];
      case 'Spotify Premium':
        return ['PC', 'Mobile'];
      default:
        return ['PC', 'Xbox', 'PlayStation', 'Mobile', 'Nintendo Switch'];
    }
  };
  
  const compatiblePlatforms = getCompatiblePlatforms();
  
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {headerText}
      </label>
      
      <div className="space-y-3">
        {compatiblePlatforms.map((platform) => (
          <div 
            key={platform}
            className={`p-3 rounded-lg border cursor-pointer ${
              selectedPlatform === platform 
                ? 'border-accent bg-accent/5' 
                : isDarkMode 
                  ? 'border-white/10 hover:bg-white/5' 
                  : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onChange(platform)}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                selectedPlatform === platform ? 'bg-accent' : 'bg-gray-300'
              }`}>
                {selectedPlatform === platform && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
              <div className="ml-3 flex items-center">
                <span className="mr-2">{platformIcons[platform]}</span>
                <span className="font-medium">{platform}</span>
              </div>
            </div>
            
            {selectedPlatform === platform && platformInstructions[platform]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformSelector; 