import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import MotionWrapper from '../components/animations/MotionWrapper';
import { 
  User as UserIcon, 
  Package, 
  Clock, 
  CreditCard, 
  Settings, 
  Mail, 
  Shield,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  ChevronRight,
  Edit,
  Save,
  X
} from 'lucide-react';
import { getUserOrders } from '../firebase/orderService';
import { Order } from '../firebase/types';
import { useCurrency } from '../contexts/CurrencyContext';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { User as FirebaseUser } from 'firebase/auth';

const UserProfilePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  
  // Settings state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userOrders = await getUserOrders(currentUser!.uid);
      const mappedOrders = userOrders.map((order: any) => ({
        ...order,
        id: order.id || order.orderID  // Handle both id and orderID fields
      })) as Order[];
      setOrders(mappedOrders);
      
      // Calculate stats
      const totalSpent = mappedOrders.reduce((sum: number, order: Order) => 
        sum + parseFloat(order.totalPrice || order.price || '0'), 0
      );
      const pendingOrders = mappedOrders.filter((o: Order) => 
        ['pending', 'Payment Verification', 'queued', 'in_progress'].includes(o.status)
      ).length;
      const completedOrders = mappedOrders.filter((o: Order) => o.status === 'delivered').length;
      
      setStats({
        totalOrders: mappedOrders.length,
        totalSpent,
        pendingOrders,
        completedOrders
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Payment Verification':
        return <Clock className="h-4 w-4" />;
      case 'queued':
      case 'in_progress':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Payment Verification':
        return 'text-yellow-500';
      case 'queued':
      case 'in_progress':
        return 'text-blue-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdateMessage(null);
      
      const user = auth.currentUser;
      if (!user) return;
      
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      
      if (email !== user.email) {
        if (!currentPassword) {
          setUpdateMessage({ type: 'error', message: 'Current password required to change email' });
          return;
        }
        await updateEmail(user, email);
      }
      
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setUpdateMessage({ type: 'error', message: 'Passwords do not match' });
          return;
        }
        if (newPassword.length < 6) {
          setUpdateMessage({ type: 'error', message: 'Password must be at least 6 characters' });
          return;
        }
        await updatePassword(user, newPassword);
      }
      
      setUpdateMessage({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditingProfile(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setUpdateMessage({ type: 'error', message: error.message });
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Orders
              </p>
              <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <ShoppingBag className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Spent
              </p>
              <p className="text-2xl font-bold mt-1">{formatPrice(stats.totalSpent)}</p>
            </div>
            <DollarSign className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Orders
              </p>
              <p className="text-2xl font-bold mt-1">{stats.pendingOrders}</p>
            </div>
            <Clock className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className="text-2xl font-bold mt-1">{stats.completedOrders}</p>
            </div>
            <CheckCircle className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-6`}>
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        {orders.slice(0, 5).map((order) => (
          <div 
            key={order.orderID}
            className={`flex items-center justify-between py-3 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } border-b last:border-0`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{order.product}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {order.createdAt instanceof Date 
                    ? order.createdAt.toLocaleDateString()
                    : new Date(order.createdAt as any).toLocaleDateString()
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="text-sm font-medium capitalize">
                  {order.status.replace('_', ' ')}
                </span>
              </span>
              <ChevronRight className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
          </div>
        ))}
        {orders.length > 5 && (
          <button
            onClick={() => setActiveTab('orders')}
            className="mt-4 text-accent hover:underline text-sm font-medium"
          >
            View all orders →
          </button>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No orders yet
          </p>
        </div>
      ) : (
        orders.map((order) => (
          <motion.div
            key={order.orderID}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white'
            } shadow-lg`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold">{order.product}</h4>
                  <span className={`flex items-center space-x-1 text-sm ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>Order ID: {order.orderID}</p>
                  <p>Date: {order.createdAt instanceof Date 
                    ? order.createdAt.toLocaleString()
                    : new Date(order.createdAt as any).toLocaleString()
                  }</p>
                  {order.platform && <p>Platform: {order.platform}</p>}
                  <p>Payment: {order.paymentMethod}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-2xl font-bold">{formatPrice(parseFloat(order.totalPrice || order.price))}</p>
                {order.deliveryType === 'Express' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 mt-2">
                    <Truck className="h-3 w-3 mr-1" />
                    Express
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderSettings = () => (
    <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Account Settings</h3>
        {!isEditingProfile ? (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center space-x-2 text-accent hover:opacity-80"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleProfileUpdate}
              className="flex items-center space-x-2 text-green-500 hover:opacity-80"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setIsEditingProfile(false);
                setDisplayName(currentUser?.displayName || '');
                setEmail(currentUser?.email || '');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setUpdateMessage(null);
              }}
              className="flex items-center space-x-2 text-red-500 hover:opacity-80"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {updateMessage && (
        <div className={`mb-4 p-3 rounded-lg ${
          updateMessage.type === 'success' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {updateMessage.message}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Information */}
        <div>
          <h4 className="font-medium mb-4 flex items-center">
            <UserIcon className="h-4 w-4 mr-2" />
            Profile Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                    : 'bg-white border-gray-300 disabled:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-accent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800' 
                    : 'bg-white border-gray-300 disabled:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-accent`}
              />
            </div>
          </div>
        </div>

        {/* Security */}
        {isEditingProfile && (
          <div>
            <h4 className="font-medium mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </h4>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required to change email or password"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-accent`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-accent`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-accent`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div>
          <h4 className="font-medium mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Account Statistics
          </h4>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Member Since</p>
                <p className="font-medium">
                  {auth.currentUser?.metadata.creationTime 
                    ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Last Sign In</p>
                <p className="font-medium">
                  {auth.currentUser?.metadata.lastSignInTime 
                    ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Orders</p>
                <p className="font-medium">{stats.totalOrders}</p>
              </div>
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total Spent</p>
                <p className="font-medium">{formatPrice(stats.totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`text-center py-12 rounded-xl ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white'
        }`}>
          <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Please sign in to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MotionWrapper variant="fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage your profile and view order history
          </p>
        </div>

        {/* Profile Info Card */}
        <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-6 mb-6`}>
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {currentUser.displayName || 'User'}
              </h2>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {(['overview', 'orders', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-accent border-b-2 border-accent'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </MotionWrapper>
    </div>
  );
};

export default UserProfilePage; 