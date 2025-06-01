import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MotionWrapper from '../components/animations/MotionWrapper';
import MotionButton from '../components/animations/MotionButton';
import { useTheme } from '../contexts/ThemeContext';
import { registerUser, signInWithDiscord, processDiscordSignIn } from '../firebase/authService';

const SignUpPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);

  const validateForm = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        console.log("Creating account for:", name, email);
        
        // Register user with Firebase
        await registerUser(email, password);
        
        // Registration successful, redirect to sign in
        navigate('/signin');
      } catch (err: any) {
        console.error("Registration error:", err);
        setError(err.message || 'Failed to create account. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDiscordSignUp = async () => {
    try {
      setIsDiscordLoading(true);
      setError('');
      
      // Sign in with Discord
      const result = await signInWithDiscord();
      
      // Process the Discord sign-in result
      await processDiscordSignIn(result);
      
      // Redirect to home page after successful sign-in
      navigate('/');
    } catch (err: any) {
      console.error("Discord sign-in error:", err);
      setError(err.message || 'Failed to sign in with Discord. Please try again.');
    } finally {
      setIsDiscordLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <MotionWrapper 
          variant="slideInUp" 
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <motion.h1 
              className={`text-3xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Create Account
            </motion.h1>
            <motion.p 
              className={`${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'} mt-2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Sign up to start shopping for discounted game products
            </motion.p>
          </div>

          <motion.div 
            className="bg-glass backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {error && (
              <motion.div 
                className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className={`text-sm ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>{error}</span>
              </motion.div>
            )}
            
            <form onSubmit={handleSignUp}>
              <div className="space-y-6">
                {/* Name field */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-2`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`} />
                    </div>
                    <motion.input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'} focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200`}
                      placeholder="John Doe"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-2`}>
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`} />
                    </div>
                    <motion.input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'} focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200`}
                      placeholder="your@email.com"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`} />
                    </div>
                    <motion.input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'} focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200`}
                      placeholder="••••••••"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-textDark/50">
                    Password must be at least 8 characters long
                  </p>
                </motion.div>

                {/* Confirm Password field */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'} mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`} />
                    </div>
                    <motion.input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg ${isDarkMode ? 'text-textLight' : 'text-textDark'} focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200`}
                      placeholder="••••••••"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>

                {/* Sign up button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <MotionButton
                    type="submit"
                    variant="primary"
                    className="w-full flex justify-center items-center py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </MotionButton>
                </motion.div>

                {/* Or separator */}
                <motion.div 
                  className="relative py-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className={`px-4 bg-glass text-sm ${isDarkMode ? 'text-textLight/50' : 'text-textDark/50'}`}>Or</span>
                  </div>
                </motion.div>

                {/* Discord sign up */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                >
                  <motion.button
                    type="button"
                    onClick={handleDiscordSignUp}
                    disabled={isDiscordLoading}
                    className="w-full flex justify-center items-center bg-[#5865F2] text-white py-3 rounded-lg hover:bg-[#5865F2]/90 transition-colors disabled:opacity-70"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDiscordLoading ? (
                      <span>Connecting to Discord...</span>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        Sign up with Discord
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </form>

            {/* Sign in link */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                Already have an account?{' '}
                <motion.span 
                  whileHover={{ scale: 1.05 }} 
                  className="inline-block"
                >
                  <Link to="/signin" className="text-accent hover:text-accent/80 transition-colors">
                    Sign in
                  </Link>
                </motion.span>
              </p>
            </motion.div>
          </motion.div>
        </MotionWrapper>
      </div>
    </div>
  );
};

export default SignUpPage; 