import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-yellow-300" />
        ) : (
          <Moon className="h-5 w-5 text-slate-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default DarkModeToggle; 