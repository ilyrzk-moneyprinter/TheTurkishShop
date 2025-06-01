import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { signInUser } from '../firebase/authService';
import MotionWrapper from '../components/animations/MotionWrapper';
import DiscordSignIn from '../components/DiscordSignIn';

const SignInPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInUser(email, password);
      navigate('/'); // Redirect to home page after successful login
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordSuccess = () => {
    navigate('/'); // Redirect to home page after successful Discord login
  };

  const handleDiscordError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper variant="bouncyFadeIn">
        <div className="max-w-md mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Sign In
          </h1>

          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-surface-dark border-white/10 text-textLight' 
                      : 'bg-white border-gray-300 text-textDark'
                  } focus:outline-none focus:ring-1 focus:ring-accent`}
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-surface-dark border-white/10 text-textLight' 
                      : 'bg-white border-gray-300 text-textDark'
                  } focus:outline-none focus:ring-1 focus:ring-accent`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-accent text-white hover:bg-accent/90' 
                    : 'bg-accent text-white hover:bg-accent/90'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-white/10' : 'border-gray-300'}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isDarkMode ? 'bg-surface-dark text-textLight/70' : 'bg-surface text-textDark/70'}`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <DiscordSignIn
                onSuccess={handleDiscordSuccess}
                onError={handleDiscordError}
              />
            </form>

            <div className="mt-4 text-center">
              <p className={`text-sm ${isDarkMode ? 'text-textLight/70' : 'text-textDark/70'}`}>
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/signup')}
                  className="text-accent hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
};

export default SignInPage; 