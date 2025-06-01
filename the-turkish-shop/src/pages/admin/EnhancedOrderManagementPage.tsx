import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllOrders, getOrderStats } from '../../firebase/adminService';
import { isAdmin } from '../../firebase/authService';
import { Order, OrderStatus } from '../../firebase/types';
import MotionWrapper from '../../components/animations/MotionWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { Search, SlidersHorizontal, X, Package, ShoppingCart, Gamepad, Monitor, Filter, Zap, ChevronRight, RotateCw } from 'lucide-react';
import OrderDetailModal from '../../components/admin/OrderDetailModal';

const EnhancedOrderManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Record<OrderStatus, number>>({
    pending: 0,
    'Payment Verification': 0,
    queued: 0,
    in_progress: 0,
    delivered: 0,
    delayed: 0,
    cancelled: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<string | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
        await loadOrders();
        await loadStats();
      } catch (err: any) {
        setError(err.message || 'Error loading admin data');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Load orders with optional filter
  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await getAllOrders(
        100, // Fetch more orders 
        undefined, 
        statusFilter !== 'all' ? statusFilter : undefined
      );
      setOrders(result.orders);
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  // Load order statistics
  const loadStats = async () => {
    try {
      const orderStats = await getOrderStats();
      setStats(orderStats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  // Handle order reload after update
  const handleOrderUpdated = async () => {
    await loadOrders();
    await loadStats();
  };

  // Filter orders based on search term, status, and platform
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Apply platform filter
    if (platformFilter !== 'all') {
      const orderPlatform = order.platform?.toLowerCase() || '';
      const productName = order.product.toLowerCase();
      
      if (platformFilter === 'psn' && !orderPlatform.includes('playstation') && !productName.includes('playstation')) {
        return false;
      }
      if (platformFilter === 'steam' && !orderPlatform.includes('steam') && !productName.includes('steam')) {
        return false;
      }
      if (platformFilter === 'discord' && !productName.includes('discord')) {
        return false;
      }
      if (platformFilter === 'spotify' && !productName.includes('spotify')) {
        return false;
      }
      if (platformFilter === 'other' && 
          !['playstation', 'steam', 'discord', 'spotify'].some(p => 
            orderPlatform.includes(p) || productName.includes(p)
          )) {
        return false;
      }
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderID.toLowerCase().includes(searchLower) ||
        order.buyerEmail.toLowerCase().includes(searchLower) ||
        order.product.toLowerCase().includes(searchLower) ||
        (order.country && order.country.toLowerCase().includes(searchLower)) ||
        (order.notes && order.notes.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

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

  // Determine platform icon
  const getPlatformIcon = (order: Order) => {
    const platform = order.platform?.toLowerCase() || '';
    const product = order.product.toLowerCase();
    
    if (platform.includes('playstation') || product.includes('playstation')) {
      return <Gamepad className="h-5 w-5 text-blue-500" />;
    } else if (platform.includes('steam') || product.includes('steam')) {
      return <Monitor className="h-5 w-5 text-gray-500" />;
    } else if (product.includes('discord')) {
      return <ShoppingCart className="h-5 w-5 text-indigo-500" />;
    } else if (product.includes('spotify')) {
      return <ShoppingCart className="h-5 w-5 text-green-500" />;
    } else {
      return <Package className="h-5 w-5 text-purple-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-20';
      case 'in_progress':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20';
      case 'delivered':
        return 'text-green-500 bg-green-100 dark:bg-green-900 dark:bg-opacity-20';
      case 'delayed':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900 dark:bg-opacity-20';
      case 'cancelled':
        return 'text-red-500 bg-red-100 dark:bg-red-900 dark:bg-opacity-20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <MotionWrapper>
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              View and manage all customer orders
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Queued</h3>
              <p className="mt-2 text-2xl font-bold text-yellow-500">{stats.queued}</p>
            </div>
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
              <p className="mt-2 text-2xl font-bold text-blue-500">{stats.in_progress}</p>
            </div>
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivered</h3>
              <p className="mt-2 text-2xl font-bold text-green-500">{stats.delivered}</p>
            </div>
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Delayed</h3>
              <p className="mt-2 text-2xl font-bold text-orange-500">{stats.delayed}</p>
            </div>
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cancelled</h3>
              <p className="mt-2 text-2xl font-bold text-red-500">{stats.cancelled}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className={`w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-400'
                }`}
                placeholder="Search by email, product, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center rounded-lg border px-4 py-2 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>
              <button
                onClick={loadOrders}
                className={`flex items-center rounded-lg border px-4 py-2 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Filter Options */}
          {showFilters && (
            <div className={`mb-6 rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        statusFilter === 'all'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('queued')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        statusFilter === 'queued'
                          ? 'bg-yellow-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Queued
                    </button>
                    <button
                      onClick={() => setStatusFilter('in_progress')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        statusFilter === 'in_progress'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setStatusFilter('delivered')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        statusFilter === 'delivered'
                          ? 'bg-green-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => setStatusFilter('delayed')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        statusFilter === 'delayed'
                          ? 'bg-orange-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Delayed
                    </button>
                    <button
                      onClick={() => setStatusFilter('cancelled')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        statusFilter === 'cancelled'
                          ? 'bg-red-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Platform</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPlatformFilter('all')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        platformFilter === 'all'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setPlatformFilter('psn')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        platformFilter === 'psn'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      PlayStation
                    </button>
                    <button
                      onClick={() => setPlatformFilter('steam')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        platformFilter === 'steam'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Steam
                    </button>
                    <button
                      onClick={() => setPlatformFilter('discord')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        platformFilter === 'discord'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Discord
                    </button>
                    <button
                      onClick={() => setPlatformFilter('spotify')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        platformFilter === 'spotify'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Spotify
                    </button>
                    <button
                      onClick={() => setPlatformFilter('other')}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        platformFilter === 'other'
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Other
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300">
              <div className="flex items-center">
                <X className="mr-2 h-5 w-5" />
                {error}
              </div>
            </div>
          )}

          {/* Orders Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="rounded-full bg-blue-500 p-3">
                <RotateCw className="h-6 w-6 animate-spin text-white" />
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={`flex h-64 flex-col items-center justify-center rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'
            }`}>
              <Package className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <table className={`min-w-full divide-y ${
                isDarkMode ? 'divide-gray-700 bg-gray-800 text-gray-200' : 'divide-gray-200 bg-white text-gray-900'
              }`}>
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Order
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredOrders.map(order => (
                    <tr 
                      key={order.orderID}
                      className={`hover:bg-opacity-70 ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-medium">#{order.orderID.substring(0, 8)}</span>
                          {order.isExpress && (
                            <Zap className="ml-2 h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getPlatformIcon(order)}
                          <span className="ml-2 max-w-xs truncate">{order.product}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate">{order.buyerEmail}</div>
                        {order.country && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{order.country}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-none ${getStatusColor(order.status)}`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium ${
                            isDarkMode
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          <span>View</span>
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination placeholder - can be implemented if needed */}
          {filteredOrders.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredOrders.length} orders
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </MotionWrapper>
  );
};

export default EnhancedOrderManagementPage; 