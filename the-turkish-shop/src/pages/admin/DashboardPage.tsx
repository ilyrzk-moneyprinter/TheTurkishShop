import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { isAdmin } from '../../firebase/authService';
import { getOrderStats, getRecentOrders, getRevenueSummary } from '../../firebase/adminService';
import { Order, OrderStatus } from '../../firebase/types';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { Package, User, Tag, ShoppingBag, MessageSquare, Star, ArrowRight, Calendar } from 'lucide-react';

// Define new interface for revenue data
interface RevenueSummary {
  today: number;
  week: number;
  month: number;
  total: number;
  currency: string;
}

const DashboardPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<OrderStatus, number>>({
    pending: 0,
    'Payment Verification': 0,
    queued: 0,
    in_progress: 0,
    delivered: 0,
    delayed: 0,
    cancelled: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    currency: '£'
  });
  const [error, setError] = useState<string | null>(null);

  // Check admin status on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await isAdmin();
        if (!adminStatus) {
          navigate('/signin'); // Redirect non-admins
          return;
        }

        // Load data
        await Promise.all([
          loadStats(),
          loadRecentOrders(),
          loadRevenue()
        ]);
      } catch (err: any) {
        setError(err.message || 'Error loading admin data');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Load order statistics
  const loadStats = async () => {
    try {
      const orderStats = await getOrderStats();
      setStats(orderStats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  // Load recent orders
  const loadRecentOrders = async () => {
    try {
      const orders = await getRecentOrders(5);
      setRecentOrders(orders);
    } catch (err: any) {
      console.error('Error loading recent orders:', err);
    }
  };

  // Load revenue data
  const loadRevenue = async () => {
    try {
      const revenueSummary = await getRevenueSummary();
      setRevenue(revenueSummary);
    } catch (err: any) {
      console.error('Error loading revenue data:', err);
    }
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp objects
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    
    // Handle Date objects or ISO strings
    return new Date(timestamp).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
        return 'text-blue-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
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
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
            Admin Dashboard
          </h1>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
              <button 
                className="ml-4 underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-yellow-500`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">Queued Orders</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {stats.queued}
                  </p>
                </div>
                <div className="bg-yellow-500/10 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-blue-500`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">In Progress</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {stats.in_progress}
                  </p>
                </div>
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-green-500`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">Delivered Orders</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {stats.delivered}
                  </p>
                </div>
                <div className="bg-green-500/10 p-2 rounded-lg">
                  <User className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} border-l-4 border-red-500`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">Cancelled Orders</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                    {stats.cancelled}
                  </p>
                </div>
                <div className="bg-red-500/10 p-2 rounded-lg">
                  <Tag className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Revenue Stats */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'} mb-8`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
              Revenue Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <p className="text-sm opacity-70">Today</p>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  {revenue.currency}{revenue.today.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <p className="text-sm opacity-70">This Week</p>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  {revenue.currency}{revenue.week.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <p className="text-sm opacity-70">This Month</p>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  {revenue.currency}{revenue.month.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/80'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <p className="text-sm opacity-70">All Time</p>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  {revenue.currency}{revenue.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                  Recent Orders
                </h2>
                <Link 
                  to="/admin/orders" 
                  className="flex items-center text-accent hover:underline"
                >
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              {recentOrders.length === 0 ? (
                <p className="text-center py-8 opacity-70">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link 
                      key={order.orderID} 
                      to={`/admin/orders?id=${order.orderID}`}
                      className={`block p-3 rounded-lg cursor-pointer border ${
                        isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                            {order.product} - {order.tier}
                          </p>
                          <p className="text-sm opacity-70">
                            {order.buyerEmail}
                          </p>
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <p className="text-xs opacity-70 text-right">
                            {formatDate(order.createdAt).split(',')[0]}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Admin Quick Links */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-surface-dark' : 'bg-surface'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>
                Admin Tools
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link 
                  to="/admin/orders" 
                  className={`p-4 rounded-lg flex items-center space-x-3 ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Order Management</p>
                    <p className="text-xs opacity-70">View and process orders</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin/users" 
                  className={`p-4 rounded-lg flex items-center space-x-3 ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="bg-green-500/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>User Management</p>
                    <p className="text-xs opacity-70">View and manage users</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin/products" 
                  className={`p-4 rounded-lg flex items-center space-x-3 ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Products</p>
                    <p className="text-xs opacity-70">Manage products and stock</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin/vouches" 
                  className={`p-4 rounded-lg flex items-center space-x-3 ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="bg-yellow-500/10 p-2 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Vouches</p>
                    <p className="text-xs opacity-70">Manage reviews and testimonials</p>
                  </div>
                </Link>
                
                <Link 
                  to="/admin/help" 
                  className={`p-4 rounded-lg flex items-center space-x-3 ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="bg-red-500/10 p-2 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-textLight' : 'text-textDark'}`}>Help Requests</p>
                    <p className="text-xs opacity-70">Customer support messages</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
};

export default DashboardPage; 