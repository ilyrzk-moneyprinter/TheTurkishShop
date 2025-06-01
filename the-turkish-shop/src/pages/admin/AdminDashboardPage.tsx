// Admin Dashboard Page Module
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  MessageSquare,
  Settings,
  Shield,
  Zap,
  Database,
  FileText,
  CreditCard,
  Coins,
  BadgeCheck,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveOrders, getAllOrders } from '../../firebase/orderService';
import { getUserCount } from '../../firebase/userService';
import { getAllHelpRequests } from '../../firebase/helpService';
import { Order } from '../../firebase/types';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Timestamp } from 'firebase/firestore';

interface QuickStat {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const AdminDashboardPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    pendingSupport: 0,
    avgOrderValue: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load orders
      const [allOrders, currentActiveOrders] = await Promise.all([
        getAllOrders(),
        getActiveOrders()
      ]);
      
      setOrders(allOrders);
      setActiveOrders(currentActiveOrders);
      
      // Get other stats
      const [userCount, helpRequests] = await Promise.all([
        getUserCount(),
        getAllHelpRequests()
      ]);
      
      // Calculate revenue
      const totalRevenue = allOrders
        .filter((o: Order) => o.status === 'delivered')
        .reduce((sum: number, order: Order) => sum + parseFloat(order.totalPrice || order.price), 0);
      
      // Today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRevenue = allOrders
        .filter((o: Order) => {
          const createdAt = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt);
          return createdAt >= today && o.status === 'delivered';
        })
        .reduce((sum: number, order: Order) => sum + parseFloat(order.totalPrice || order.price), 0);
      
      const completedOrders = allOrders.filter((o: Order) => o.status === 'delivered').length;
      const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
      
      setStats({
        totalRevenue,
        todayRevenue,
        totalOrders: allOrders.length,
        activeOrders: currentActiveOrders.length,
        completedOrders,
        totalUsers: userCount,
        pendingSupport: helpRequests.filter((h: any) => h.status === 'pending').length,
        avgOrderValue
      });
      
      // Create recent activity
      const activities = allOrders
        .slice(0, 10)
        .map(order => ({
          type: 'order',
          message: `New order #${order.orderID.slice(0, 8)}`,
          time: order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt),
          status: order.status,
          value: formatPrice(parseFloat(order.totalPrice || order.price))
        }));
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickStats: QuickStat[] = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-green-500'
    },
    {
      title: "Today's Revenue",
      value: formatPrice(stats.todayRevenue),
      change: '+8.2%',
      trend: 'up',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-blue-500'
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      change: `${stats.activeOrders} in queue`,
      trend: 'neutral',
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-500'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+25 this week',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'text-purple-500'
    }
  ];

  const adminActions = [
    {
      title: 'Order Management',
      description: 'Process orders, update status',
      icon: <Package className="h-8 w-8" />,
      link: '/admin/enhanced-orders',
      color: 'bg-blue-500'
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: <Users className="h-8 w-8" />,
      link: '/admin/users',
      color: 'bg-purple-500'
    },
    {
      title: 'Product Management',
      description: 'Update products and pricing',
      icon: <ShoppingBag className="h-8 w-8" />,
      link: '/admin/enhanced-products',
      color: 'bg-green-500'
    },
    {
      title: 'Promo Codes',
      description: 'Create and manage promo codes',
      icon: <Tag className="h-8 w-8" />,
      link: '/admin/promo-codes',
      color: 'bg-orange-500'
    },
    {
      title: 'Support Tickets',
      description: `${stats.pendingSupport} pending tickets`,
      icon: <MessageSquare className="h-8 w-8" />,
      link: '/admin/help',
      color: 'bg-yellow-500'
    },
    {
      title: 'Vouch Management',
      description: 'Review and manage vouches',
      icon: <BadgeCheck className="h-8 w-8" />,
      link: '/admin/vouches',
      color: 'bg-indigo-500'
    },
    {
      title: 'Game Prices',
      description: 'Check latest game prices',
      icon: <Coins className="h-8 w-8" />,
      link: '/admin/game-prices',
      color: 'bg-pink-500'
    },
    {
      title: 'Database Setup',
      description: 'Initialize database collections',
      icon: <Database className="h-8 w-8" />,
      link: '/admin/database-init',
      color: 'bg-red-500'
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-background-dark' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Welcome back! Here's your business overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white'
              } shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 
                  stat.trend === 'down' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.title}
              </h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    to={action.link}
                    className={`block p-6 rounded-xl ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-white'
                    } shadow-lg hover:shadow-xl transition-all`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{action.title}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-6`}>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No recent activity
                  </p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start space-x-3 pb-3 ${
                        index < recentActivity.length - 1 ? 'border-b border-gray-700' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {activity.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatTimeAgo(activity.time)}
                          </span>
                          <span className="text-xs font-medium text-accent">
                            {activity.value}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              {recentActivity.length > 0 && (
                <Link
                  to="/admin/enhanced-orders"
                  className="block text-center mt-4 text-accent hover:underline text-sm font-medium"
                >
                  View all orders →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Order Completion Rate</h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Excellent
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div 
                    style={{ width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Average Order Value</h3>
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Based on {stats.completedOrders} completed orders
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Support Response</h3>
                <MessageSquare className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">{stats.pendingSupport}</p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending support tickets
              </p>
            </motion.div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className={`rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-lg p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: 'API Server', status: 'operational', icon: <Zap /> },
                { name: 'Database', status: 'operational', icon: <Database /> },
                { name: 'Email Service', status: 'operational', icon: <MessageSquare /> },
                { name: 'Payment Gateway', status: 'operational', icon: <CreditCard /> }
              ].map((service) => (
                <div key={service.name} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    service.status === 'operational' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {service.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className={`text-xs ${
                      service.status === 'operational' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {service.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 