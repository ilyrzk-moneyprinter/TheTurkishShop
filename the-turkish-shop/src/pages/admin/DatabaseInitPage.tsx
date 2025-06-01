import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAdmin, createAdminUser } from '../../firebase/authService';
import { auth } from '../../firebase/config';
import { getAllProducts } from '../../firebase/productService';
import { getAllVouches } from '../../firebase/vouchService';
import { initializeDatabase, checkDatabaseStatus, makeUserAdmin } from '../../firebase/initializeDatabase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { Database, CheckCircle, AlertCircle, RefreshCw, ShoppingBag, Star } from 'lucide-react';

const DatabaseInitPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [status, setStatus] = useState({
    hasProducts: false,
    hasVouches: false,
    productCount: 0,
    vouchCount: 0
  });
  const [result, setResult] = useState<{ productsCreated: number; vouchesCreated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // Check admin status and database status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // First ensure the current user has admin role in database
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email === 'senpaimc04@gmail.com') {
          await createAdminUser(currentUser);
          console.log('Admin user document ensured for:', currentUser.email);
        }
        
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          navigate('/signin');
          return;
        }

        const dbStatus = await checkDatabaseStatus();
        setStatus({
          hasProducts: dbStatus.products > 0,
          hasVouches: dbStatus.vouches > 0,
          productCount: dbStatus.products,
          vouchCount: dbStatus.vouches
        });
      } catch (err: any) {
        setError(err.message || 'Error checking status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  // Initialize database with sample data
  const handleInitialize = async (force: boolean = false) => {
    try {
      setInitializing(true);
      setError(null);
      setSuccess(null);
      
      const result = await initializeDatabase(!force);
      setResult(result);
      
      // Refresh status
      const newStatus = await checkDatabaseStatus();
      setStatus({
        hasProducts: newStatus.products > 0,
        hasVouches: newStatus.vouches > 0,
        productCount: newStatus.products,
        vouchCount: newStatus.vouches
      });
      
      if (result.productsCreated > 0 || result.vouchesCreated > 0) {
        setSuccess(`Successfully created ${result.productsCreated} products and ${result.vouchesCreated} vouches!`);
      } else {
        setSuccess('Database already initialized. No changes made.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize database');
    } finally {
      setInitializing(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!adminEmail) {
      setAdminError('Please enter an email address');
      return;
    }
    
    setMakingAdmin(true);
    setAdminError(null);
    setAdminSuccess(null);
    
    try {
      const result = await makeUserAdmin(adminEmail);
      if (result) {
        setAdminSuccess(`Successfully made ${adminEmail} an admin`);
        setAdminEmail('');
      } else {
        setAdminError('Failed to make user admin. User may not exist.');
      }
    } catch (error: any) {
      setAdminError(error.message || 'Error making user admin');
    } finally {
      setMakingAdmin(false);
    }
  };

  const handleSetupInitialAdmin = async () => {
    setMakingAdmin(true);
    setAdminError(null);
    setAdminSuccess(null);
    
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setAdminError('No user is currently signed in');
        return;
      }
      
      if (currentUser.email !== 'senpaimc04@gmail.com') {
        setAdminError('Only senpaimc04@gmail.com can perform initial setup');
        return;
      }
      
      // Create or update the admin user document
      await createAdminUser(currentUser);
      
      setAdminSuccess('Admin setup complete! Refreshing page...');
      
      // Reload after a short delay to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      setAdminError(error.message || 'Error setting up admin');
    } finally {
      setMakingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper variant="bouncyFadeIn">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Database Initialization
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
              <button 
                className="ml-auto underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
              <button 
                className="ml-auto underline"
                onClick={() => setSuccess(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Current Status */}
          <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              <Database className="h-6 w-6 mr-2" />
              Current Database Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2 text-accent" />
                    <span className="font-medium">Products Collection</span>
                  </div>
                  <div className="flex items-center">
                    {status.hasProducts ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-500">{status.productCount} items</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-yellow-500">Empty</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-accent" />
                    <span className="font-medium">Vouches Collection</span>
                  </div>
                  <div className="flex items-center">
                    {status.hasVouches ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-500">{status.vouchCount} items</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-yellow-500">Empty</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Initialization Options */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Initialize Database
            </h2>

            <p className="mb-6 opacity-70">
              Use this tool to populate your database with sample products and testimonials. This is useful for testing or getting started quickly.
            </p>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className="font-medium mb-2">Safe Initialize</h3>
                <p className="text-sm opacity-70 mb-3">
                  Only adds sample data if collections are empty. Existing data will not be affected.
                </p>
                <button
                  onClick={() => handleInitialize(false)}
                  disabled={initializing}
                  className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  {initializing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5 mr-2" />
                      Initialize Empty Collections
                    </>
                  )}
                </button>
              </div>

              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-red-500/20' : 'border-red-200'}`}>
                <h3 className="font-medium mb-2 text-red-500">Force Initialize</h3>
                <p className="text-sm opacity-70 mb-3">
                  Adds sample data regardless of existing data. Use with caution.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to force initialize? This will add duplicate data if collections already exist.')) {
                      handleInitialize(true);
                    }
                  }}
                  disabled={initializing}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {initializing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Force Initialize
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sample Data Preview */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-medium mb-3">Sample Data Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm opacity-70">
                <div>
                  <h4 className="font-medium mb-2">Products (3 items)</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Steam Gift Card ($10, $25, $50)</li>
                    <li>PlayStation Plus (1, 3, 12 months)</li>
                    <li>Xbox Game Pass (1, 3 months)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Testimonials (4 items)</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>5-star review from John Smith</li>
                    <li>5-star review from Emma Wilson</li>
                    <li>4-star review from Michael Brown</li>
                    <li>5-star review from Sarah Davis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Make User Admin Section */}
          <div className={`mt-8 p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Make User Admin
            </h2>
            
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter the email address of the user you want to make an admin.
            </p>
            
            {adminError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                {adminError}
              </div>
            )}
            
            {adminSuccess && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">
                {adminSuccess}
              </div>
            )}
            
            <div className="flex gap-4">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="user@example.com"
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <button
                onClick={handleMakeAdmin}
                disabled={makingAdmin || !adminEmail.trim()}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {makingAdmin ? 'Processing...' : 'Make Admin'}
              </button>
            </div>
          </div>

          {/* Setup Initial Admin Section */}
          <div className={`mt-8 p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Setup Initial Admin
            </h2>
            
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Use this tool to setup the initial admin user. This is useful for setting up the first admin user.
            </p>
            
            <button
              onClick={handleSetupInitialAdmin}
              disabled={makingAdmin}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {makingAdmin ? 'Processing...' : 'Setup Initial Admin'}
            </button>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
};

export default DatabaseInitPage; 