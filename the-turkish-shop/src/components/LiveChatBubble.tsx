import React, { useState } from 'react';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const LiveChatBubble: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Show thank you message
      setShowThankYou(true);
      setMessage('');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg ${
          isDarkMode 
            ? 'bg-accent hover:bg-accent/90' 
            : 'bg-accent hover:bg-accent/90'
        } text-white transition-all duration-300`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 0 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: 90 }}
              className="relative"
            >
              <MessageCircle className="h-6 w-6" />
              {/* Notification dot */}
              <motion.div
                className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl ${
              isDarkMode 
                ? 'bg-surface-dark border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 rounded-t-2xl ${
              isDarkMode ? 'bg-accent/10' : 'bg-accent/5'
            } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-accent/20' : 'bg-accent/10'
                    }`}>
                      <MessageCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      Live Support
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      We typically reply in minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-4 h-64 overflow-y-auto">
              {showThankYou ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    Message Received!
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    For immediate assistance, join our Discord server.
                  </p>
                </motion.div>
              ) : (
                <div>
                  <div className={`mb-4 p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                      👋 Welcome to The Turkish Shop!
                    </p>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      How can we help you today? For the fastest response, we recommend joining our Discord server.
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2 mb-4">
                    <a
                      href="https://discord.gg/theturkishshop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-purple-900/20 hover:bg-purple-900/30 text-purple-300' 
                          : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5" />
                        <div>
                          <p className="font-medium text-sm">Join Discord</p>
                          <p className="text-xs opacity-75">Get instant support</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      onClick={() => window.location.href = '/help'}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 hover:bg-gray-700' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-accent" />
                        <div className="text-left">
                          <p className={`font-medium text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            Submit Ticket
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Get email support
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Business Hours */}
                  <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Support Hours: 9 AM - 11 PM GMT+3
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 text-textLight placeholder:text-gray-500 border-gray-700' 
                      : 'bg-gray-100 text-textDark placeholder:text-gray-400 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-accent/50`}
                />
                <button
                  onClick={handleSendMessage}
                  className={`p-2 rounded-lg transition-colors ${
                    message.trim() 
                      ? 'bg-accent hover:bg-accent/90 text-white' 
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!message.trim()}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatBubble; 