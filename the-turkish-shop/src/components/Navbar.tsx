import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, ChevronDown, LogIn, MessageCircle, Info, User, Package, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MotionWrapper from './animations/MotionWrapper';
import DarkModeToggle from './DarkModeToggle';
import CurrencySelector from './CurrencySelector';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../firebase/authService';
import DiscordIcon from '../assets/icons/discord-icon.png';
import ShopLogo from '../assets/logos/istockphoto-1144879597-612x612.jpg';
import { classNames } from '../utils/classNames';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { itemCount } = useCart();
  const { currentUser, isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleInfoDropdown = () => {
    setIsInfoDropdownOpen(!isInfoDropdownOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Animation variants
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -5,
      scale: 0.95,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  // Cart item badge animation
  const cartBadgeVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
      }
    }
  };

  return (
    <MotionWrapper variant="bouncySlideUp" className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <nav className={`max-w-7xl mx-auto backdrop-blur-md ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} border border-white/10 rounded-2xl shadow-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link to="/" className="flex items-center">
                <img 
                  src={ShopLogo} 
                  alt="The Turkish Shop" 
                  className="h-10 w-auto rounded-lg shadow-md"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/products">Products</NavLink>
                <NavLink to="/vouches">Vouches</NavLink>
                
                {/* Information Dropdown */}
                <div className="relative">
                  <motion.button 
                    onClick={toggleInfoDropdown}
                    className={`${isDarkMode ? 'text-textLight hover:text-accent' : 'text-textDark hover:text-accent'} px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Information
                    <motion.div
                      animate={{ rotate: isInfoDropdownOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isInfoDropdownOpen && (
                      <motion.div 
                        className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl overflow-hidden z-20 ${
                          isDarkMode 
                            ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/20' 
                            : 'bg-white/80 backdrop-blur-2xl border border-gray-200/50'
                        }`}
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="py-1">
                          <DropdownLink 
                            to="/how-to-receive" 
                            onClick={() => setIsInfoDropdownOpen(false)}
                          >
                            How to Receive
                          </DropdownLink>
                          <DropdownLink 
                            to="/how-long-it-takes" 
                            onClick={() => setIsInfoDropdownOpen(false)}
                          >
                            Delivery Times
                          </DropdownLink>
                          <DropdownLink 
                            to="/payment-methods" 
                            onClick={() => setIsInfoDropdownOpen(false)}
                          >
                            Payment Methods
                          </DropdownLink>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              {/* Currency Selector */}
              <CurrencySelector />
              
              {/* Discord Support Button */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Link to="/help" className={`flex items-center px-4 py-2 bg-white/5 border border-white/10 ${isDarkMode ? 'text-textLight' : 'text-textDark'} rounded-lg hover:bg-white/10 transition-colors`}>
                  <img src={DiscordIcon} alt="Discord" className="h-5 w-5 mr-2" />
                  <span>Discord Support</span>
                </Link>
              </motion.div>
              
              {/* Cart Button */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative"
              >
                <Link to="/cart" className="p-2 rounded-lg bg-surface hover:bg-white/10 transition-colors text-textDark">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
                {itemCount > 0 && (
                  <motion.div 
                    variants={cartBadgeVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.div>
                )}
              </motion.div>
              
              {/* Profile Button or Sign In Button */}
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    onClick={toggleProfileDropdown}
                    className={`flex items-center p-1 rounded-full border-2 ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/5 hover:bg-white/10' 
                        : 'border-gray-300 bg-white hover:bg-gray-100'
                    } transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
                      {currentUser?.email ? (
                        currentUser.email.charAt(0).toUpperCase()
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div 
                        className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl overflow-hidden z-20 ${
                          isDarkMode 
                            ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/20' 
                            : 'bg-white/80 backdrop-blur-2xl border border-gray-200/50'
                        }`}
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        {currentUser && (
                          <div className={`px-4 py-3 border-b ${
                            isDarkMode ? 'border-white/20 text-textLight' : 'border-gray-200/50 text-textDark'
                          }`}>
                            <p className="text-sm font-medium truncate">
                              {currentUser.email || 'User'}
                            </p>
                          </div>
                        )}
                        <div className="py-1">
                          <DropdownLink 
                            to="/profile" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            My Profile
                          </DropdownLink>
                          <DropdownLink 
                            to="/dashboard" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            My Orders
                          </DropdownLink>
                          <DropdownLink 
                            to="/profile#settings" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Account Settings
                          </DropdownLink>
                          
                          {/* Admin Panel Link - Only for admins */}
                          {currentUser && currentUser.role === 'admin' && (
                            <DropdownLink 
                              to="/admin" 
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              Admin Panel
                            </DropdownLink>
                          )}

                          <button
                            onClick={handleSignOut}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                              isDarkMode 
                                ? 'text-red-400 hover:bg-white/10' 
                                : 'text-red-600 hover:bg-gray-100/50'
                            } transition-colors`}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Link to="/signin" className={`flex items-center px-4 py-2 bg-white/5 border border-white/10 ${isDarkMode ? 'text-textLight' : 'text-textDark'} rounded-lg hover:bg-white/10 transition-colors`}>
                    <LogIn className="h-5 w-5 mr-2" />
                    <span>Sign In</span>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              {/* Dark Mode Toggle (Mobile) */}
              <div className="mr-2">
                <DarkModeToggle />
              </div>
              
              {/* Cart Button (Mobile) */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative mr-2"
              >
                <Link to="/cart" className="p-2 rounded-lg bg-surface hover:bg-white/10 transition-colors text-textDark">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
                {itemCount > 0 && (
                  <motion.div 
                    variants={cartBadgeVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.div>
                )}
              </motion.div>
              
              {/* Profile button (Mobile) */}
              {isAuthenticated && (
                <motion.div 
                  className="relative mr-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/profile" className="p-1 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white">
                      {currentUser?.email ? (
                        currentUser.email.charAt(0).toUpperCase()
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                  </Link>
                </motion.div>
              )}
              
              <button
                onClick={toggleMenu}
                className={`inline-flex items-center justify-center p-2 rounded-lg ${isDarkMode ? 'text-textLight hover:bg-white/10' : 'text-textDark hover:bg-white/10'} focus:outline-none focus:ring-2 focus:ring-white/10`}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden overflow-hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/10">
                <MobileNavLink to="/" onClick={toggleMenu}>Home</MobileNavLink>
                <MobileNavLink to="/products" onClick={toggleMenu}>Products</MobileNavLink>
                <MobileNavLink to="/vouches" onClick={toggleMenu}>Vouches</MobileNavLink>
                
                {/* Mobile Information Dropdown */}
                <div>
                  <button
                    onClick={toggleInfoDropdown}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-base font-medium ${isDarkMode ? 'text-textLight hover:bg-white/10' : 'text-textDark hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <Info className="mr-3 h-5 w-5" />
                      Information
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transform transition-transform duration-200 ${isInfoDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  <AnimatePresence>
                    {isInfoDropdownOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-10 space-y-1 mt-1 mb-2">
                          <MobileSubNavLink to="/how-to-receive" onClick={toggleMenu}>
                            How to Receive
                          </MobileSubNavLink>
                          <MobileSubNavLink to="/how-long-it-takes" onClick={toggleMenu}>
                            Delivery Times
                          </MobileSubNavLink>
                          <MobileSubNavLink to="/payment-methods" onClick={toggleMenu}>
                            Payment Methods
                          </MobileSubNavLink>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Mobile Profile Links */}
                {isAuthenticated ? (
                  <>
                    <MobileNavLink to="/orders" onClick={toggleMenu}>
                      <Package className="mr-3 h-5 w-5" />
                      My Orders
                    </MobileNavLink>
                    <MobileNavLink to="/dashboard" onClick={toggleMenu}>
                      <User className="mr-3 h-5 w-5" />
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink to="/profile" onClick={toggleMenu}>
                      <Settings className="mr-3 h-5 w-5" />
                      Account Settings
                    </MobileNavLink>

                    {/* Admin Panel Link (Mobile) - Only for admins */}
                    {currentUser && currentUser.role === 'admin' && (
                      <MobileNavLink to="/admin" onClick={toggleMenu}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Admin Panel
                      </MobileNavLink>
                    )}

                    <button
                      onClick={() => {
                        handleSignOut();
                        toggleMenu();
                      }}
                      className={`flex items-center w-full px-3 py-2 rounded-lg text-base font-medium ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-white/10' 
                          : 'text-red-600 hover:bg-gray-50'
                      }`}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <MobileNavLink to="/signin" onClick={toggleMenu}>
                    <LogIn className="mr-3 h-5 w-5" />
                    Sign In
                  </MobileNavLink>
                )}
                
                <MobileNavLink to="/help" onClick={toggleMenu}>
                  <div className="flex items-center">
                    <img src={DiscordIcon} alt="Discord" className="h-5 w-5 mr-3" />
                    Discord Support
                  </div>
                </MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </MotionWrapper>
  );
};

// Helper components for cleaner code
const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Link to={to} className={`${isDarkMode ? 'text-textLight hover:text-accent' : 'text-textDark hover:text-accent'} px-3 py-2 rounded-lg text-sm font-medium transition-colors`}>
        {children}
      </Link>
    </motion.div>
  );
};

const DropdownLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.div
      whileHover={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
      className="block w-full"
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Link 
        to={to} 
        className={`block px-4 py-2 text-sm ${
          isDarkMode ? 'text-textLight hover:text-accent' : 'text-textDark hover:text-accent'
        } transition-colors w-full flex items-center`}
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  );
};

const MobileNavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Link
        to={to}
        className={`${isDarkMode ? 'text-textLight hover:text-accent' : 'text-textDark hover:text-accent'} block px-3 py-2 rounded-lg text-base font-medium`}
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  );
};

const MobileSubNavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick?: () => void }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Link
        to={to}
        className={`${isDarkMode ? 'text-textLight/80 hover:text-accent' : 'text-textDark/80 hover:text-accent'} block px-3 py-2 pl-6 rounded-lg text-sm`}
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default Navbar; 