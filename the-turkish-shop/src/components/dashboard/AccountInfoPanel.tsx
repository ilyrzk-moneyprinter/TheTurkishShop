import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Edit, Save, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { updateUserGameProfiles } from '../../firebase/userService';

// Define User type based on what's needed for this component
interface User {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: any;
  gameProfiles?: {
    [key: string]: string;
  };
}

interface AccountInfoPanelProps {
  user: User | null;
}

const AccountInfoPanel: React.FC<AccountInfoPanelProps> = ({ user }) => {
  const { isDarkMode } = useTheme();
  const [isEditingProfiles, setIsEditingProfiles] = useState(false);
  const [gameProfiles, setGameProfiles] = useState(user?.gameProfiles || {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Format date for display
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  // Handle username changes
  const handleProfileChange = (platform: string, value: string) => {
    setGameProfiles(prev => ({
      ...prev,
      [platform]: value
    }));
  };
  
  // Save updated profiles
  const saveProfiles = async () => {
    if (!user?.uid) return;
    
    try {
      setIsSaving(true);
      await updateUserGameProfiles(user.uid, gameProfiles);
      setSuccess('Game profiles updated successfully');
      setIsEditingProfiles(false);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating profiles:', err);
      setError(err.message || 'Failed to update profiles');
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setGameProfiles(user?.gameProfiles || {});
    setIsEditingProfiles(false);
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div 
      className={`rounded-2xl backdrop-blur-xl ${
        isDarkMode ? 'bg-white/5' : 'bg-white/80'
      } shadow-glass p-6 border border-white/10`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
          Account Info
        </h2>
        {!isEditingProfiles && (
          <motion.button
            onClick={() => setIsEditingProfiles(true)}
            className="text-accent hover:bg-accent/10 p-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit className="h-4 w-4" />
          </motion.button>
        )}
      </div>
      
      {/* Account Details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-white/10' : 'bg-gray-100'
          }`}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full" />
            ) : (
              <User className="h-8 w-8 opacity-70" />
            )}
          </div>
          <div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              {user.displayName || 'User'}
            </h3>
            <p className="text-sm opacity-70">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm opacity-70">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Member since {formatDate(user.createdAt)}</span>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
            <button className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            {success}
            <button className="ml-2 underline" onClick={() => setSuccess(null)}>Dismiss</button>
          </div>
        )}
        
        {/* Game Username Section */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Game Usernames
            </h3>
            
            {isEditingProfiles && (
              <div className="flex space-x-2">
                <motion.button
                  onClick={cancelEditing}
                  className="p-1 rounded-full hover:bg-white/10 text-red-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={saveProfiles}
                  className="p-1 rounded-full hover:bg-white/10 text-green-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {isEditingProfiles ? (
              <>
                <div>
                  <label className="block text-xs opacity-70 mb-1">Fortnite Username</label>
                  <input
                    type="text"
                    value={gameProfiles.fortnite || ''}
                    onChange={(e) => handleProfileChange('fortnite', e.target.value)}
                    placeholder="Enter Fortnite username"
                    className={`w-full px-3 py-2 text-sm rounded-lg ${
                      isDarkMode 
                        ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                        : 'bg-white text-textDark placeholder:text-gray-400'
                    } border border-transparent focus:border-accent focus:outline-none`}
                  />
                </div>
                
                <div>
                  <label className="block text-xs opacity-70 mb-1">Roblox Username</label>
                  <input
                    type="text"
                    value={gameProfiles.roblox || ''}
                    onChange={(e) => handleProfileChange('roblox', e.target.value)}
                    placeholder="Enter Roblox username"
                    className={`w-full px-3 py-2 text-sm rounded-lg ${
                      isDarkMode 
                        ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                        : 'bg-white text-textDark placeholder:text-gray-400'
                    } border border-transparent focus:border-accent focus:outline-none`}
                  />
                </div>
                
                <div>
                  <label className="block text-xs opacity-70 mb-1">Discord Username</label>
                  <input
                    type="text"
                    value={gameProfiles.discord || ''}
                    onChange={(e) => handleProfileChange('discord', e.target.value)}
                    placeholder="Enter Discord username"
                    className={`w-full px-3 py-2 text-sm rounded-lg ${
                      isDarkMode 
                        ? 'bg-black/20 text-textLight placeholder:text-gray-500' 
                        : 'bg-white text-textDark placeholder:text-gray-400'
                    } border border-transparent focus:border-accent focus:outline-none`}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs opacity-70">Fortnite Username</p>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {gameProfiles.fortnite || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs opacity-70">Roblox Username</p>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {gameProfiles.roblox || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs opacity-70">Discord Username</p>
                  <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {gameProfiles.discord || 'Not provided'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountInfoPanel; 